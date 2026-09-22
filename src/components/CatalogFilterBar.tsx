'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CatalogFilters } from '@/lib/catalog-query'

type Tag = {
  id: string
  name: string
  slug: string
}

export default function CatalogFilterBar({
  allTags,
  selectedTagSlugs,
  basePath,
  filters,
}: {
  allTags: Tag[]
  selectedTagSlugs: string[]
  basePath: string
  filters: CatalogFilters
}) {
  const [expanded, setExpanded] = useState(false)

  const VISIBLE_COUNT = 6
  const visibleTags = expanded ? allTags : allTags.slice(0, VISIBLE_COUNT)

  function buildHref(params: { tags?: string[] }) {
    const searchParams = new URLSearchParams()

    if (filters.q) searchParams.set('q', filters.q)
    if (filters.categorySlug) searchParams.set('category', filters.categorySlug)
    if (filters.brand) searchParams.set('brand', filters.brand)
    if (filters.sort) searchParams.set('sort', filters.sort)

    if (params.tags && params.tags.length > 0) {
      searchParams.set('tags', params.tags.join(','))
    }

    if (filters.priceMin !== undefined) searchParams.set('priceMin', String(filters.priceMin))
    if (filters.priceMax !== undefined) searchParams.set('priceMax', String(filters.priceMax))
    if (filters.inStock) searchParams.set('stock', '1')
    if (filters.attrValues) {
      for (const [key, values] of Object.entries(filters.attrValues)) {
        if (values.length > 0) searchParams.set(`attr_${key}`, values.join(','))
      }
    }
    if (filters.attrRanges) {
      for (const [key, range] of Object.entries(filters.attrRanges)) {
        if (range.min !== undefined) searchParams.set(`attr_${key}_min`, String(range.min))
        if (range.max !== undefined) searchParams.set(`attr_${key}_max`, String(range.max))
      }
    }

    const qs = searchParams.toString()

    return qs ? `${basePath}?${qs}` : basePath
  }

  function toggleTag(slug: string) {
    const next = selectedTagSlugs.includes(slug)
      ? selectedTagSlugs.filter((s) => s !== slug)
      : [...selectedTagSlugs, slug]

    return buildHref({ tags: next })
  }

  if (allTags.length === 0) return null

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      {visibleTags.map((tag) => {
        const active = selectedTagSlugs.includes(tag.slug)

        return (
          <Link
            key={tag.id}
            href={toggleTag(tag.slug)}
            className={`h-[33px] flex items-center px-2.5 rounded-xl text-sm font-manrope transition-colors ${
              active
                ? 'bg-[#179146] text-white font-medium'
                : 'bg-[#efefef] text-[#1c2126] font-normal hover:bg-[#e4e4e4]'
            }`}
          >
            {tag.name}
          </Link>
        )
      })}

      {allTags.length > VISIBLE_COUNT && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-sm font-manrope text-[#179146] hover:underline"
        >
          Показать ещё ⌄
        </button>
      )}
    </div>
  )
}