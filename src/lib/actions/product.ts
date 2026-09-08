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

export async function getOtherVariants(productId: string, excludeVariantId: string) {
  const variants = await prisma.productVariant.findMany({
    where: { productId, id: { not: excludeVariantId } },
    include: {
      images: { where: { isMain: true }, take: 1 },
    },
    orderBy: { name: 'asc' },
  })

  return variants.map((v) => ({
    id: v.id,
    slug: v.slug,
    name: v.name,
    price: v.price !== null ? Number(v.price) : null,
    image: v.images[0]?.url ?? null,
  }))
}
export async function bulkDeleteProducts(productIds: string[]) {
  await prisma.product.deleteMany({ where: { id: { in: productIds } } });
  revalidatePath("/admin/products");
}

export async function bulkUpdateCategory(productIds: string[], categoryId: string) {
  await prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: { categoryId },
  });
  revalidatePath("/admin/products");
}

export async function bulkUpdateBrand(productIds: string[], brandId: string | null) {
  await prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: { brandId },
  });
  revalidatePath("/admin/products");
}

export async function bulkAddTags(productIds: string[], tagIds: string[]) {
  await prisma.$transaction(
    productIds.map((id) =>
      prisma.product.update({
        where: { id },
        data: { tags: { connect: tagIds.map((tagId) => ({ id: tagId })) } },
      })
    )
  );
  revalidatePath("/admin/products");
}

export async function bulkRemoveTags(productIds: string[], tagIds: string[]) {
  await prisma.$transaction(
    productIds.map((id) =>
      prisma.product.update({
        where: { id },
        data: { tags: { disconnect: tagIds.map((tagId) => ({ id: tagId })) } },
      })
    )
  );
  revalidatePath("/admin/products");
}

export async function duplicateProduct(productId: string) {
  try {
    const source = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        tags: true,
        variants: {
          include: {
            images: true,
            documents: true,
            tags: true,
          },
        },
      },
    })

    if (!source) {
      return { success: false, error: 'Товар не найден' }
    }

    const suffix = Date.now().toString(36)

    await prisma.product.create({
      data: {
        name: `${source.name} (копия)`,
        categoryId: source.categoryId,
        brandId: source.brandId,
        description: source.description,
        shortDescription: source.shortDescription,
        tags: { connect: source.tags.map((t) => ({ id: t.id })) },
        variants: {
          create: source.variants.map((v) => ({
            name: v.name,
            sku: `${v.sku}-copy-${suffix}`,
            slug: `${v.slug}-copy-${suffix}`,
            price: v.price,
            stock: v.stock,
            attributes: v.attributes as object,
            metaTitle: v.metaTitle,
            metaDescription: v.metaDescription,
            metaKeywords: v.metaKeywords,
            tags: { connect: v.tags.map((t) => ({ id: t.id })) },
            images: {
              create: v.images.map((img) => ({
                url: img.url,
                isMain: img.isMain,
                sortOrder: img.sortOrder,
              })),
            },
            documents: {
              create: v.documents.map((doc) => ({
                title: doc.title,
                type: doc.type,
                url: doc.url,
              })),
            },
          })),
        },
      },
    })

    revalidatePath('/admin/products')
    revalidatePath('/category', 'layout')
    revalidatePath('/catalog')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Не удалось скопировать товар.' }
  }
}