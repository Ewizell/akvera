import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/account',
          '/login',
          '/cart',
          '/checkout',
          '/compare',
          '/favorites',
          '/catalog/search',
          // дубли листингов с фильтрами и сортировкой
          '/*sort=',
          '/*tags=',
          '/*stock=',
          '/*priceMin=',
          '/*priceMax=',
          '/*attr_',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}