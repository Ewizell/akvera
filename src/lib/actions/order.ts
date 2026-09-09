"use server";

import { OrderStatus, Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type { OrderListItem } from "@/lib/orderTypes";

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