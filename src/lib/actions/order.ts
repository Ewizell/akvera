"use server";

import { Prisma } from "@/generated/prisma/client";
import { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { OrderListItem } from "@/lib/orderTypes";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";

export async function getOrders(params: {
  status?: OrderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const { status, search, page = 1, pageSize = 20 } = params;

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { contactName: { contains: search, mode: "insensitive" } },
            { contactEmail: { contains: search, mode: "insensitive" } },
            { contactPhone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { items: { select: { priceAtOrder: true, quantity: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  const items: OrderListItem[] = orders.map((o) => {
    const anyOnRequest = o.items.some((i) => i.priceAtOrder === null);
    const sum = o.items.reduce(
      (acc, i) => acc + (i.priceAtOrder ? Number(i.priceAtOrder) : 0) * i.quantity,
      0
    );
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      createdAt: o.createdAt,
      contactName: o.contactName,
      contactEmail: o.contactEmail,
      contactPhone: o.contactPhone,
      itemsCount: o.items.length,
      total: anyOnRequest ? null : sum,
      adminComment: o.adminComment,
    };
  });

  return { items, total, pageCount: Math.ceil(total / pageSize) };
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true, images: { take: 1 } },
          },
        },
      },
      attachments: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });
  if (!order) return null;

  return {
    ...order,
    items: order.items.map((i) => ({
      ...i,
      priceAtOrder: i.priceAtOrder !== null ? Number(i.priceAtOrder) : null,
      variant: {
        ...i.variant,
        price: i.variant.price !== null ? Number(i.variant.price) : null,
      },
    })),
  };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return prisma.order.update({ where: { id }, data: { status } });
}

export async function updateOrderContact(
  id: string,
  data: { contactName: string; contactPhone: string; contactEmail: string | null; comment: string | null }
) {
  return prisma.order.update({ where: { id }, data });
}

export async function updateOrderAdminComment(id: string, adminComment: string | null) {
  return prisma.order.update({ where: { id }, data: { adminComment } });
}
type CreateOrderItemInput = { variantId: string; quantity: number };

export async function createOrder(formData: FormData) {
  try {
    const contactName = formData.get("contactName")?.toString().trim();
    const contactPhone = formData.get("contactPhone")?.toString().trim();
    const contactEmail = formData.get("contactEmail")?.toString().trim() || null;
    const comment = formData.get("comment")?.toString().trim() || null;
    const organization = formData.get("organization")?.toString().trim() || null;
    const deliveryMethod = formData.get("deliveryMethod")?.toString() || null;
    const deliveryAddress = formData.get("deliveryAddress")?.toString().trim() || null;
    const paymentMethod = formData.get("paymentMethod")?.toString() || null;
    const prepaymentType = formData.get("prepaymentType")?.toString() || null;

    if (!contactName || !contactPhone) {
      return { success: false as const, error: "Укажите имя и телефон" };
    }

    const rawItems = formData.get("items")?.toString();
    if (!rawItems) {
      return { success: false as const, error: "Корзина пуста" };
    }

    let items: CreateOrderItemInput[];
    try {
      items = JSON.parse(rawItems);
    } catch {
      return { success: false as const, error: "Некорректные данные корзины" };
    }

    if (!Array.isArray(items) || items.length === 0) {
      return { success: false as const, error: "Корзина пуста" };
    }

    // Не доверяем цене/количеству с клиента — перезапрашиваем цены из БД
    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, price: true },
    });
    const priceByVariantId = new Map(variants.map((v) => [v.id, v.price]));

    const session = await auth();

    const order = await prisma.order.create({
      data: {
        contactName,
        contactPhone,
        contactEmail,
        comment,
        organization,
        deliveryMethod,
        deliveryAddress,
        paymentMethod,
        prepaymentType,
        status: OrderStatus.NEW,
        ...(session?.user?.id ? { user: { connect: { id: session.user.id } } } : {}),
        items: {
          create: items.map((item) => ({
            variant: { connect: { id: item.variantId } },
            quantity: item.quantity,
            priceAtOrder: priceByVariantId.get(item.variantId) ?? null,
          })),
        },
      },
      select: { id: true },
    });

    const attachments = formData
      .getAll("attachments")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (attachments.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "orders", order.id);
      await mkdir(uploadDir, { recursive: true });

      for (const file of attachments) {
        const ext = path.extname(file.name);
        const filename = `${randomUUID()}${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(uploadDir, filename), buffer);

        await prisma.orderAttachment.create({
          data: {
            orderId: order.id,
            url: `/uploads/orders/${order.id}/${filename}`,
            filename: file.name,
          },
        });
      }
    }

    revalidatePath("/admin/orders");

    return { success: true as const, orderId: order.id };
  } catch (error) {
    console.error("createOrder error:", error);
    return { success: false as const, error: "Не удалось оформить заявку. Попробуйте ещё раз." };
  }
}
import { deleteFromS3 } from './upload';

export async function deleteOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { attachments: true },
    });

    if (!order) {
      return { success: false as const, error: 'Заказ не найден' };
    }

    for (const attachment of order.attachments) {
      await deleteFromS3(attachment.url);
    }

    await prisma.order.delete({ where: { id: orderId } });

    revalidatePath('/admin/orders');
    return { success: true as const };
  } catch (error) {
    console.error('deleteOrder error:', error);
    return { success: false as const, error: 'Не удалось удалить заказ.' };
  }
}

export async function deleteOrderItem(orderId: string, itemId: string) {
  try {
    const itemsCount = await prisma.orderItem.count({ where: { orderId } });

    if (itemsCount <= 1) {
      return {
        success: false as const,
        error: 'Нельзя удалить последнюю позицию — удалите весь заказ.',
      };
    }

    await prisma.orderItem.delete({ where: { id: itemId } });

    revalidatePath('/admin/orders');
    return { success: true as const };
  } catch (error) {
    console.error('deleteOrderItem error:', error);
    return { success: false as const, error: 'Не удалось удалить позицию.' };
  }
}

export async function updateOrderItem(
  itemId: string,
  data: { quantity: number; priceAtOrder: number | null; variantId: string }
) {
  try {
    await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        quantity: data.quantity,
        priceAtOrder: data.priceAtOrder,
        variant: { connect: { id: data.variantId } },
      },
    });

    revalidatePath('/admin/orders');
    return { success: true as const };
  } catch (error) {
    console.error('updateOrderItem error:', error);
    return { success: false as const, error: 'Не удалось обновить позицию.' };
  }
}

export async function addOrderItem(
  orderId: string,
  data: { variantId: string; quantity: number; priceAtOrder: number | null }
) {
  try {
    await prisma.orderItem.create({
      data: {
        orderId,
        variantId: data.variantId,
        quantity: data.quantity,
        priceAtOrder: data.priceAtOrder,
      },
    });

    revalidatePath('/admin/orders');
    return { success: true as const };
  } catch (error) {
    console.error('addOrderItem error:', error);
    return { success: false as const, error: 'Не удалось добавить товар.' };
  }
}

export async function searchVariantsForOrder(query: string) {
  if (!query.trim()) return [];

  const variants = await prisma.productVariant.findMany({
    where: {
      OR: [
        { sku: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: { product: { select: { name: true } } },
    take: 10,
  });

  return variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    name: v.name,
    productName: v.product.name,
    price: v.price !== null ? Number(v.price) : null,
  }));
}