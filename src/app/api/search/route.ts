import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getVisibleCategoryIds } from '@/lib/visibility'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json({ results: [] })
  }

  type SearchRow = {
    id: string
    name: string
    slug: string
    price: number
    imageUrl: string | null
    sim: number
  }

  const prefix = `${q}%`
  const visibleCategoryIds = await getVisibleCategoryIds()

  if (visibleCategoryIds.length === 0) {
    return NextResponse.json({ results: [] })
  }

  const rows = await prisma.$queryRaw<SearchRow[]>`
    SELECT p.id, p.name, v.slug, v.price::float AS price, img.url AS "imageUrl",
      MAX(
        CASE
          WHEN p.name ILIKE ${prefix} OR v.sku ILIKE ${prefix} OR v.name ILIKE ${prefix} THEN 1.0
          ELSE GREATEST(
            similarity(p.name, ${q}),
            similarity(coalesce(v.sku, ''), ${q}),
            similarity(coalesce(v.name, ''), ${q})
          )
        END
      ) AS sim
    FROM "Product" p
    JOIN "ProductVariant" v ON v."productId" = p.id
    LEFT JOIN LATERAL (
      SELECT url FROM "ProductImage"
      WHERE "variantId" = v.id
      ORDER BY "isMain" DESC, "sortOrder" ASC
      LIMIT 1
    ) img ON true
    WHERE p."isHidden" = false
      AND p."categoryId" = ANY(${visibleCategoryIds})
      AND (
        p.name ILIKE ${prefix} OR v.sku ILIKE ${prefix} OR v.name ILIKE ${prefix}
        OR p.name % ${q} OR v.sku % ${q} OR v.name % ${q}
      )
    GROUP BY p.id, p.name, v.slug, v.price, img.url
    ORDER BY sim DESC
    LIMIT 5
  `

  return NextResponse.json({
    results: rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      price: r.price,
      imageUrl: r.imageUrl,
    })),
  })
}