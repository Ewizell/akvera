'use server'

import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

type CreateOrderResult = { success: true; orderId: string } | { success: false; error: string }

export async function createOrder(formData: FormData): Promise<CreateOrderResult> {
  const contactName = (formData.get('contactName') as string)?.trim()
  const contactPhone = (formData.get('contactPhone') as string)?.trim()
  const contactEmail = (formData.get('contactEmail') as string)?.trim() || null
  const comment = (formData.get('comment') as string)?.trim() || null
  const itemsRaw = formData.get('items') as string

  if (!contactName || !contactPhone) {
    return { success: false, error: 'Укажите имя и телефон' }
  }

  let parsedItems: { variantId: string; quantity: number }[]
  try {
    parsedItems = JSON.parse(itemsRaw)
  } catch {
    return { success: false, error: 'Некорректные данные корзины' }
  }

  if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
    return { success: false, error: 'Корзина пуста' }
  }

  // подтягиваем актуальные цены с сервера, не доверяем клиенту
  const variantIds = parsedItems.map((i) => i.variantId)
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, price: true, stock: true },
  })
  const variantMap = new Map(variants.map((v) => [v.id, v]))

  for (const item of parsedItems) {
    if (!variantMap.has(item.variantId)) {
      return { success: false, error: 'Один из товаров больше недоступен' }
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return { success: false, error: 'Некорректное количество товара' }
    }
  }

  const files = formData.getAll('attachments') as File[]
  const validFiles = files.filter((f) => f instanceof File && f.size > 0)

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        contactName,
        contactPhone,
        contactEmail,
        comment,
        items: {
          create: parsedItems.map((item) => {
            const variant = variantMap.get(item.variantId)!
            return {
              variant: { connect: { id: item.variantId } },
              quantity: item.quantity,
              priceAtOrder: variant.price, // null, если цена была "по запросу"
            }
          }),
        },
      },
    })
    return newOrder
  })

  if (validFiles.length > 0) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'orders', order.id)
    await mkdir(uploadDir, { recursive: true })

    for (const file of validFiles) {
      const ext = path.extname(file.name)
      const filename = `${randomUUID()}${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(path.join(uploadDir, filename), buffer)

      await prisma.orderAttachment.create({
        data: {
          orderId: order.id,
          url: `/uploads/orders/${order.id}/${filename}`,
          filename: file.name,
        },
      })
    }
  }

  return { success: true, orderId: order.id }
}