'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CatalogFilters } from '@/lib/catalog-query'

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'По умолчанию' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'stock', label: 'Сначала в наличии' },
]

export default function SortDropdown({
  currentSort,
  basePath,
  filters,
}: {
  currentSort: string
  basePath: string
  filters: CatalogFilters
}) {
  const [open, setOpen] = useState(false)
  const currentLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? SORT_OPTIONS[0].label

  function buildHref(sortValue: string) {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.brand) params.set('brand', filters.brand)
    if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','))
    if (sortValue) params.set('sort', sortValue)
    if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin))
    if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax))
    if (filters.inStock) params.set('stock', '1')
    if (filters.attrValues) {
      for (const [key, values] of Object.entries(filters.attrValues)) {
        if (values.length > 0) params.set(`attr_${key}`, values.join(','))
      }
    }
    if (filters.attrRanges) {
      for (const [key, range] of Object.entries(filters.attrRanges)) {
        if (range.min !== undefined) params.set(`attr_${key}_min`, String(range.min))
        if (range.max !== undefined) params.set(`attr_${key}_max`, String(range.max))
      }
    }
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <div className="flex items-center gap-2 text-sm relative">
      <span className="text-gray-500">Сортировка:</span>
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
                  href={buildHref(opt.value)}
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
    </div>
  )
}