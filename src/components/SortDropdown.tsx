'use client'

import { useState } from 'react'
import Link from 'next/link'

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'По умолчанию' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'stock', label: 'Сначала в наличии' },
]

export default function SortDropdown({
  currentSort,
  basePath,
  brand,
  q,
  tags,
}: {
  currentSort: string
  basePath: string
  brand?: string
  q?: string
  tags?: string[]
}) {
  const [open, setOpen] = useState(false)
  const currentLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? SORT_OPTIONS[0].label

  function buildHref(sortValue: string) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (brand) params.set('brand', brand)
    if (tags && tags.length > 0) params.set('tags', tags.join(','))
    if (sortValue) params.set('sort', sortValue)
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