import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getVisibleCategoryIds } from '@/lib/visibility'
import { absoluteUrl } from '@/lib/seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const visibleCategoryIds = await getVisibleCategoryIds()

  const [categories, ownCounts, brands, brandCategoryPairs, variants] = await Promise.all([
    prisma.category.findMany({
      where: { id: { in: visibleCategoryIds } },
      select: { id: true, slug: true, parentId: true, updatedAt: true },
    }),
    prisma.product.groupBy({
      by: ['categoryId'],
      where: { isHidden: false },
      _count: { _all: true },
    }),
    prisma.brand.findMany({
      where: { products: { some: { isHidden: false } } },
      select: { id: true, slug: true, updatedAt: true },
    }),
    prisma.product.groupBy({
      by: ['brandId', 'categoryId'],
      where: { isHidden: false, brandId: { not: null }, categoryId: { in: visibleCategoryIds } },
    }),
    prisma.productVariant.findMany({
      where: { product: { isHidden: false, categoryId: { in: visibleCategoryIds } } },
      select: { slug: true, updatedAt: true },
    }),
  ])

  // ── категории: полная цепочка предков и пропуск пустых ──
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  function categoryPath(id: string): string[] | null {
    const path: string[] = []
    let current = categoryById.get(id)
    while (current) {
      path.unshift(current.slug)
      if (!current.parentId) return path
      current = categoryById.get(current.parentId)
    }
    return null // цепочка оборвана (родитель скрыт)
  }

  const own = new Map(ownCounts.map((c) => [c.categoryId, c._count._all]))
  const childrenOf = new Map<string, string[]>()
  for (const c of categories) {
    if (!c.parentId) continue
    childrenOf.set(c.parentId, [...(childrenOf.get(c.parentId) ?? []), c.id])
  }
  const total = (id: string): number =>
    (own.get(id) ?? 0) + (childrenOf.get(id) ?? []).reduce((sum, childId) => sum + total(childId), 0)

  const categoryRoutes: MetadataRoute.Sitemap = []
  for (const c of categories) {
    if (total(c.id) === 0) continue
    const path = categoryPath(c.id)
    if (!path) continue
    categoryRoutes.push({
      url: absoluteUrl(`/category/${path.join('/')}`),
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  // ── бренды и пары «бренд + категория» ──
  const brandSlugById = new Map(brands.map((b) => [b.id, b.slug]))

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: absoluteUrl(`/brands/${b.slug}`),
    lastModified: b.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  const brandCategoryRoutes: MetadataRoute.Sitemap = []
  for (const pair of brandCategoryPairs) {
    if (!pair.categoryId) continue
    const brandSlug = pair.brandId ? brandSlugById.get(pair.brandId) : undefined
    const category = categoryById.get(pair.categoryId)
    if (brandSlug && category) {
      brandCategoryRoutes.push({
        url: absoluteUrl(`/brands/${brandSlug}/${category.slug}`),
        changeFrequency: 'weekly',
        priority: 0.4,
      })
    }
  }

  // ── статические страницы и товары ──
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/catalog'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/catalog/all'), changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/brands'), changeFrequency: 'weekly', priority: 0.6 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const productRoutes: MetadataRoute.Sitemap = variants.map((v) => ({
    url: absoluteUrl(`/product/${v.slug}`),
    lastModified: v.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...brandRoutes,
    ...brandCategoryRoutes,
    ...productRoutes,
  ]
}
