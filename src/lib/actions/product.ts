'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const brandId = formData.get('brandId') as string

  const sku = formData.get('sku') as string
  const slug = formData.get('slug') as string
  const price = formData.get('price') as string
  const shortDescription = formData.get('shortDescription') as string

  try {
    await prisma.product.create({
      data: {
        name,
        categoryId,
        description: description || null,
        shortDescription: shortDescription || null,
        brandId: brandId || null,
        variants: {
          create: {
            name,
            sku,
            slug,
            price: parseFloat(price),
            attributes: {},
          },
        },
      },
    })
    revalidatePath('/admin/products')
    revalidatePath('/category', 'layout')
    revalidatePath('/catalog')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Не удалось создать товар. Проверьте, что артикул и slug уникальны.',
    }
  }
}

export async function getRelatedVariants(categoryId: string, excludeVariantId: string, limit = 8) {
  const variants = await prisma.productVariant.findMany({
    where: {
      product: { categoryId },
      id: { not: excludeVariantId },
    },
    include: {
      product: { select: { name: true } },
      images: { where: { isMain: true }, take: 1 },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })

  // Decimal нельзя передавать в клиентские компоненты — сериализуем в number
  return variants.map((v) => ({
    ...v,
    price: v.price !== null ? Number(v.price) : null,
  }))
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const brandId = formData.get('brandId') as string
  const shortDescription = formData.get('shortDescription') as string
  const tagIds = formData.getAll('tagIds') as string[]

  await prisma.product.update({
    where: { id },
    data: {
      name,
      categoryId,
      description: description || null,
      shortDescription: shortDescription || null,
      brandId: brandId || null,
      tags: { set: tagIds.map((id) => ({ id })) },
    },
  })

  revalidatePath('/admin/products')
  revalidatePath('/category', 'layout')
  revalidatePath('/catalog')
  return { success: true }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/admin/products')
    revalidatePath('/category', 'layout')
    revalidatePath('/catalog')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Не удалось удалить товар.',
    }
  }
}