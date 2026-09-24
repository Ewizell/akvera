'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function parseStringList(formData: FormData, name: string): string[] {
  const raw = formData.get(name) as string | null
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.map((s) => String(s).trim()).filter(Boolean) : []
  } catch {
    return []
  }
}

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const brandId = formData.get('brandId') as string

  const sku = formData.get('sku') as string
  const slug = formData.get('slug') as string
  const price = formData.get('price') as string
  const shortDescription = formData.get('shortDescription') as string
  const applicationAreas = parseStringList(formData, 'applicationAreas')
  const advantages = parseStringList(formData, 'advantages')

  try {
    await prisma.product.create({
      data: {
        name,
        categoryId,
        description: description || null,
        shortDescription: shortDescription || null,
        applicationAreas,
        advantages,
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
  const applicationAreas = parseStringList(formData, 'applicationAreas')
  const advantages = parseStringList(formData, 'advantages')

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        categoryId,
        description: description || null,
        shortDescription: shortDescription || null,
        applicationAreas,
        advantages,
        brandId: brandId || null,
        tags: { set: tagIds.map((id) => ({ id })) },
      },
    })
  } catch (error) {
    console.error('updateProduct error:', error)
    return {
      success: false,
      error: 'Не удалось сохранить изменения товара.',
    }
  }

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

// TODO: сейчас популярность определяется тегом "Популярно" — замените
// на реальную метрику (продажи, отдельное поле и т.п.), если она появится
export async function getPopularVariants(excludeVariantId?: string, take = 5) {
  const variants = await prisma.productVariant.findMany({
    where: {
      product: {
        tags: { some: { name: 'Популярно' } },
      },
      ...(excludeVariantId ? { id: { not: excludeVariantId } } : {}),
    },
    include: {
      product: { select: { name: true } },
      images: { orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }], take: 1 },
    },
    take,
  })

  // Decimal нельзя передавать в клиентские компоненты — сериализуем в number,
  // как в getRelatedVariants/getOtherVariants выше
  return variants.map((v) => ({
    ...v,
    price: v.price !== null ? Number(v.price) : null,
  }))
}

export async function bulkDeleteProducts(productIds: string[]) {
  let deleted = 0;
  const blocked: string[] = [];

  for (const id of productIds) {
    try {
      await prisma.product.delete({ where: { id } });
      deleted++;
    } catch {
      const product = await prisma.product.findUnique({ where: { id }, select: { name: true } });
      blocked.push(product?.name ?? id);
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalog/all");
  revalidatePath("/category", "layout");

  return { success: true, deleted, blocked };
}

export async function bulkUpdateCategory(
  productIds: string[],
  categoryId: string
) {
  try {
    await prisma.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
      },
      data: {
        categoryId: categoryId,
      },
    })

    revalidatePath('/admin/products')
    revalidatePath('/catalog')
    revalidatePath('/category', 'layout')

    return { success: true }
  } catch (error) {
    console.error('bulkUpdateCategory error:', error)

    return {
      success: false,
      error: 'Не удалось изменить категорию товаров.',
    }
  }
}

export async function bulkUpdateBrand(productIds: string[], brandId: string | null) {
  try {
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { brandId },
    })
    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('bulkUpdateBrand error:', error)
    return {
      success: false,
      error: 'Не удалось изменить бренд товаров.',
    }
  }
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
        documents: true,
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
        applicationAreas: source.applicationAreas,
        advantages: source.advantages,
        tags: { connect: source.tags.map((t) => ({ id: t.id })) },
        documents: {
          create: source.documents.map((doc) => ({
            documentId: doc.documentId,
            sortOrder: doc.sortOrder,
          })),
        },
        variants: {
          create: source.variants.map((v) => ({
            name: v.name,
            sku: `${v.sku}-copy-${suffix}`,
            slug: `${v.slug}-copy-${suffix}`,
            price: v.price,
            stock: v.stock,
            attributes: v.attributes as object,
            applicationAreas: v.applicationAreas,
            advantages: v.advantages,
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
                documentId: doc.documentId,
                sortOrder: doc.sortOrder,
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
import { computeAttributeMigration, type CategoryAttributeSchema } from '@/lib/attribute-migration'

export async function previewBulkCategoryChange(productIds: string[], newCategoryId: string) {
  const [newCategory, products] = await Promise.all([
    prisma.category.findUnique({
      where: { id: newCategoryId },
      include: { attributes: true },
    }),
    prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: { include: { attributes: true } },
        variants: { select: { id: true, name: true, attributes: true } },
      },
    }),
  ])

  if (!newCategory) {
    return { success: false as const, error: 'Категория не найдена.' }
  }

  const newSchema: CategoryAttributeSchema[] = newCategory.attributes.map((a) => ({
    key: a.key,
    label: a.label,
    fieldType: a.fieldType,
    unit: a.unit,
  }))

  const items = products.map((product) => {
    const oldSchema: CategoryAttributeSchema[] = product.category.attributes.map((a) => ({
      key: a.key,
      label: a.label,
      fieldType: a.fieldType,
      unit: a.unit,
    }))

    const variants = product.variants.map((variant) => {
      const plan = computeAttributeMigration(
        oldSchema,
        newSchema,
        variant.attributes as Record<string, unknown> | null
      )
      return { variantId: variant.id, variantName: variant.name, ...plan }
    })

    return {
      productId: product.id,
      productName: product.name,
      oldCategoryName: product.category.name,
      variants,
      hasUnmatched: variants.some((v) => v.unmatchedAttributes.length > 0),
      hasMissing: variants.some((v) => v.missingAttributes.length > 0),
    }
  })

  return {
    success: true as const,
    newCategoryName: newCategory.name,
    items,
  }
}

export async function applyBulkCategoryChange(
  productIds: string[],
  newCategoryId: string,
  transfers: { variantId: string; keys: { key: string; label: string; value: unknown }[] }[]
) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.updateMany({
        where: { id: { in: productIds } },
        data: { categoryId: newCategoryId },
      })

      for (const transfer of transfers) {
        if (transfer.keys.length === 0) continue

        const variant = await tx.productVariant.findUnique({
          where: { id: transfer.variantId },
          select: { attributes: true },
        })
        if (!variant) continue

        const attrs = { ...(variant.attributes as Record<string, unknown>) }
        const existingCustom = Array.isArray(attrs.customAttributes)
          ? (attrs.customAttributes as { label: string; value: unknown }[])
          : []

        const mergedCustom = [
          ...existingCustom,
          ...transfer.keys.map(({ label, value }) => ({ label, value })),
        ]

        for (const { key } of transfer.keys) {
          delete attrs[key]
        }

        attrs.customAttributes = mergedCustom

        await tx.productVariant.update({
          where: { id: transfer.variantId },
          data: {
            attributes: attrs as import('@/generated/prisma/client').Prisma.InputJsonObject,
          },
        })
      }
    })

    revalidatePath('/admin/products')
    revalidatePath('/catalog')
    revalidatePath('/category', 'layout')

    return { success: true as const }
  } catch (error) {
    console.error('applyBulkCategoryChange error:', error)
    return { success: false as const, error: 'Не удалось применить изменения.' }
  }
}

export async function applyAttributeTransfers(
  transfers: { variantId: string; keys: { key: string; label: string; value: unknown }[] }[]
) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const transfer of transfers) {
        if (transfer.keys.length === 0) continue

        const variant = await tx.productVariant.findUnique({
          where: { id: transfer.variantId },
          select: { attributes: true },
        })
        if (!variant) continue

        const attrs = { ...(variant.attributes as Record<string, unknown>) }
        const existingCustom = Array.isArray(attrs.customAttributes)
          ? (attrs.customAttributes as { label: string; value: unknown }[])
          : []

        const mergedCustom = [
          ...existingCustom,
          ...transfer.keys.map(({ label, value }) => ({ label, value })),
        ]

        for (const { key } of transfer.keys) {
          delete attrs[key]
        }

        attrs.customAttributes = mergedCustom

        await tx.productVariant.update({
          where: { id: transfer.variantId },
          data: {
            attributes: attrs as import('@/generated/prisma/client').Prisma.InputJsonObject,
          },
        })
      }
    })

    revalidatePath('/admin/products')
    return { success: true as const }
  } catch (error) {
    console.error('applyAttributeTransfers error:', error)
    return { success: false as const, error: 'Не удалось перенести атрибуты.' }
  }
}