import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  const [categories, brands, variants] = await Promise.all([
    prisma.category.findMany({
      select: { slug: true, parent: { select: { slug: true } } },
    }),
    prisma.brand.findMany({ select: { slug: true } }),
    prisma.productVariant.findMany({ select: { slug: true, updatedAt: true } }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/catalog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/catalog/all`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/brands`, changeFrequency: 'weekly', priority: 0.6 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: c.parent
      ? `${siteUrl}/category/${c.parent.slug}/${c.slug}`
      : `${siteUrl}/category/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${siteUrl}/brands/${b.slug}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  const productRoutes: MetadataRoute.Sitemap = variants.map((v) => ({
    url: `${siteUrl}/product/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes]
}