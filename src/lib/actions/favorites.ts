'use server'

import { prisma } from '@/lib/prisma'
import { cardInclude, buildCard, type CatalogCard } from '@/lib/catalog-query'

export async function getFavoriteVariants(variantIds: string[]): Promise<CatalogCard[]> {
  if (variantIds.length === 0) return []

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: cardInclude,
  })

  const cards = variants.map(buildCard)
  const orderIndex = new Map(variantIds.map((id, i) => [id, i]))
  return cards.sort((a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0))
}