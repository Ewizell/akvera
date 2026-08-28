'use client'

import { useState } from 'react'
import Link from 'next/link'

type Tag = {
  id: string
  name: string
  slug: string
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'По умолчанию' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'stock', label: 'Сначала в наличии' },
]

function SortDropdown({
  currentSort,
  selectedTagSlugs,
  buildHref,
}: {
  currentSort: string
  selectedTagSlugs: string[]
  buildHref: (params: { tags?: string[]; sort?: string }) => string
}) {
  const [open, setOpen] = useState(false)
  const currentLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? SORT_OPTIONS[0].label

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-blue-600 hover:underline flex items-center gap-0.5"
      >
        {currentLabel}
        <span className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={buildHref({ tags: selectedTagSlugs, sort: opt.value })}
                onClick={() => setOpen(false)}
                className={`block px-3 py-1.5 text-sm hover:bg-gray-50 ${
                  opt.value === currentSort ? 'text-black font-medium' : 'text-gray-700'
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function CatalogFilterBar({
  allTags,
  selectedTagSlugs,
  basePath,
  brand,
  q,
}: {
  allTags: Tag[]
  selectedTagSlugs: string[]
  basePath: string
  brand?: string
  q?: string
}) {
  const [expanded, setExpanded] = useState(false)

  const VISIBLE_COUNT = 6
  const visibleTags = expanded
    ? allTags
    : allTags.slice(0, VISIBLE_COUNT)

  function buildHref(params: { tags?: string[] }) {
    const searchParams = new URLSearchParams()

    if (q) searchParams.set('q', q)
    if (brand) searchParams.set('brand', brand)

    if (params.tags && params.tags.length > 0) {
      searchParams.set('tags', params.tags.join(','))
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

  return (
    <div className="mb-4 space-y-3">
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {visibleTags.map((tag) => {
            const active = selectedTagSlugs.includes(tag.slug)

            return (
              <Link
                key={tag.id}
                href={toggleTag(tag.slug)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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
              className="text-sm text-blue-600 hover:underline"
            >
              Показать ещё ⌄
            </button>
          )}
        </div>
      )}

    </div>
  )
}