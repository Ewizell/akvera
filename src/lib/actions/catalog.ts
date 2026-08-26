'use server'

import { getCatalogProducts, type CatalogFilters } from '@/lib/catalog-query'

export async function loadMoreCatalogProducts(filters: CatalogFilters, page: number) {
  const { cards } = await getCatalogProducts(filters, page)
  return cards
}