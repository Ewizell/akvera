'use server'

import { prisma } from '@/lib/prisma'
import { cardInclude, buildCard, type CatalogCard } from '@/lib/catalog-query'
import type { CarouselVariant } from '@/components/CarouselProductCard'

function toCarouselVariant(card: CatalogCard): CarouselVariant {
  return {
    id: card.variantId,
    slug: card.slug,
    sku: card.sku,
    name: card.variantName || card.name,
    price: card.price,
    stock: card.stock,
    product: { name: card.name },
    images: card.images.map((url) => ({ url, alt: null })),
  }
}

export async function getFavoritesRecommendations(variantIds: string[]): Promise<CarouselVariant[]> {
  if (variantIds.length === 0) return []

  const favoriteVariants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { product: { select: { categoryId: true } } },
  })
  const categoryIds = Array.from(
    new Set(favoriteVariants.map((v) => v.product.categoryId).filter((id): id is string => !!id))
  )
  if (categoryIds.length === 0) return []

  const variants = await prisma.productVariant.findMany({
    where: {
      product: { categoryId: { in: categoryIds } },
      id: { notIn: variantIds },
    },
    include: cardInclude,
    take: 12,
  })

  return variants.map(buildCard).map(toCarouselVariant)
}