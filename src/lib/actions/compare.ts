'use server'

import { prisma } from '@/lib/prisma'

export type CompareVariant = {
  variantId: string
  productId: string
  productName: string
  variantName: string
  sku: string
  slug: string
  price: number | null
  image: string | null
  brandName: string | null
  categoryId: string
  categoryName: string
  attributes: Record<string, unknown>
  categoryAttributes: {
    key: string
    label: string
    fieldType: string
    unit: string | null
    group: string | null
  }[]
  customAttributes: { label: string; value: string }[]
  siblingVariants: { id: string; name: string; sku: string }[]
}

export async function getCompareVariants(variantIds: string[]): Promise<CompareVariant[]> {
  if (variantIds.length === 0) return []

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        include: {
          category: {
            include: { attributes: { orderBy: { sortOrder: 'asc' } } },
          },
          brand: true,
          variants: { select: { id: true, name: true, sku: true } },
        },
      },
      images: { where: { isMain: true }, take: 1 },
    },
  })

  // сохраняем порядок из localStorage (variantIds), а не порядок из БД
  const byId = new Map(variants.map((v) => [v.id, v]))
  const ordered = variantIds.map((id) => byId.get(id)).filter((v): v is typeof variants[number] => Boolean(v))

  return ordered.map((v) => ({
    variantId: v.id,
    productId: v.productId,
    productName: v.product.name,
    variantName: v.name,
    sku: v.sku,
    slug: v.slug,
    price: v.price ? Number(v.price) : null,
    image: v.images[0]?.url ?? null,
    brandName: v.product.brand?.name ?? null,
    categoryId: v.product.categoryId,
    categoryName: v.product.category.name,
    attributes: v.attributes as Record<string, unknown>,
    categoryAttributes: v.product.category.attributes.map((a) => ({
      key: a.key,
      label: a.label,
      fieldType: a.fieldType,
      unit: a.unit,
      group: a.group,
    })),
    customAttributes:
      (v.attributes as Record<string, unknown> | null)?.customAttributes as
        | { label: string; value: string }[]
        | undefined ?? [],
    siblingVariants: v.product.variants.map((sv) => ({ id: sv.id, name: sv.name, sku: sv.sku })),
  }))
}