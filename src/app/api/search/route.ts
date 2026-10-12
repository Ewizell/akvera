import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { NextResponse } from 'next/server'
import { getVisibleCategoryIds } from '@/lib/visibility'

type SearchRow = {
  id: string
  name: string
  slug: string
  price: number
  imageUrl: string | null
  rank: number
  sim: number
}

// экранируем спецсимволы LIKE, чтобы "%" и "_" в запросе не работали как маски
const escapeLike = (s: string) => s.replace(/[\\%_]/g, '\\$&')

// "Калорифер" / "калориферы" → общий корень; артикулы и числа не трогаем
function stem(t: string) {
  if (!/^[a-zа-яё]+$/i.test(t)) return t
  if (t.length >= 7) return t.slice(0, -2)
  if (t.length >= 5) return t.slice(0, -1)
  return t
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json({ results: [] })
  }

  const visibleCategoryIds = await getVisibleCategoryIds()

  if (visibleCategoryIds.length === 0) {
    return NextResponse.json({ results: [] })
  }

  const prefix = `${escapeLike(q)}%`
  const contains = `%${escapeLike(q)}%`

  // каждое слово запроса должно встретиться где-то в «документе» товара
  const tokens = q.split(/\s+/).filter(Boolean).slice(0, 5)
  const conds = tokens.map((t) => {
    const s = stem(t)
    const like = `%${escapeLike(s)}%`
    const compact = s.toLowerCase().replace(/[^0-9a-zа-яё]/g, '')
    // артикулы вида "КСк2" находят "КСк-2"
    return /\d/.test(s) && compact.length >= 3
      ? Prisma.sql`(d.doc ILIKE ${like} OR dc.docc LIKE ${`%${compact}%`})`
      : Prisma.sql`d.doc ILIKE ${like}`
  })

  const rows = await prisma.$queryRaw<SearchRow[]>(Prisma.sql`
    SELECT * FROM (
      SELECT DISTINCT ON (m.id)
        m.id, m.name, m.slug, m.price, img.url AS "imageUrl", m.rank, m.sim
      FROM (
        SELECT
          p.id, p.name, v.id AS vid, v.slug, v.price::float AS price,
          CASE
            WHEN p.name ILIKE ${prefix} OR v.name ILIKE ${prefix} OR v.sku ILIKE ${prefix} THEN 3
            WHEN d.doc ILIKE ${contains} THEN 2
            ELSE 1
          END AS rank,
          word_similarity(${q}::text, d.doc) AS sim
        FROM "Product" p
        JOIN "ProductVariant" v ON v."productId" = p.id
        JOIN "Category" c ON c.id = p."categoryId"
        LEFT JOIN "Brand" b ON b.id = p."brandId"
        CROSS JOIN LATERAL (
          SELECT lower(concat_ws(' ', p.name, v.name, v.sku, b.name, c.name)) AS doc
        ) d
        CROSS JOIN LATERAL (
          SELECT regexp_replace(d.doc, '[^0-9a-zа-яё]', '', 'g') AS docc
        ) dc
        WHERE p."isHidden" = false
          AND p."categoryId" = ANY(${visibleCategoryIds})
          AND ((${Prisma.join(conds, ' AND ')}) OR ${q}::text <% d.doc)
      ) m
      LEFT JOIN LATERAL (
        SELECT url FROM "ProductImage"
        WHERE "variantId" = m.vid
        ORDER BY "isMain" DESC, "sortOrder" ASC
        LIMIT 1
      ) img ON true
      ORDER BY m.id, m.rank DESC, m.sim DESC
    ) t
    ORDER BY rank DESC, sim DESC
    LIMIT 8
  `)

  return NextResponse.json({
    results: rows.map((r) => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  price: r.price,
  imageUrl: r.imageUrl,
  rank: Number(r.rank),
    })),
  })
}