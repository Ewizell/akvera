'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import CartCardControl from './CartCardControl'
import ProductImageHoverSlider from './ProductImageHoverSlider'
import { loadMoreCatalogProducts } from '@/lib/actions/catalog'
import type { CatalogFilters } from '@/lib/catalog-query'
import CompareButton from './CompareButton'
import CatalogPagination from './CatalogPagination'
import FavoriteButton from './FavoriteButton'
import ProductCard from './ProductCard'
import ProductCardHorizontal from './ProductCardHorizontal'
import type { CatalogCard } from '@/lib/catalog-query'

const STORAGE_KEY = 'akvera_catalog_view'

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'По умолчанию' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'stock', label: 'Сначала в наличии' },
]

function buildSortHref(basePath: string, filters: CatalogFilters, sort: string) {
  const params = new URLSearchParams()

  if (filters.q) params.set('q', filters.q)
  if (filters.categorySlug) params.set('category', filters.categorySlug)
  if (filters.brand) params.set('brand', filters.brand)
  if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','))
  if (sort) params.set('sort', sort)
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

export default function CatalogGrid({
  products,
  filters,
  page,
  totalPages,
  basePath,
}: {
  products: CatalogCard[]
  filters: CatalogFilters
  page: number
  totalPages: number
  basePath: string
}) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [items, setItems] = useState(products)
  const [currentPage, setCurrentPage] = useState(page)
  const [isPending, startTransition] = useTransition()

  function handleLoadMore() {
    startTransition(async () => {
      const nextPage = currentPage + 1
      const more = await loadMoreCatalogProducts(filters, nextPage)
      setItems((prev) => [...prev, ...more])
      setCurrentPage(nextPage)
    })
  }

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'grid' || saved === 'list') setView(saved)
  }, [])

  function setViewAndSave(v: 'grid' | 'list') {
    setView(v)
    localStorage.setItem(STORAGE_KEY, v)
  }

  const currentSort = filters.sort ?? ''

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="font-manrope font-bold text-[#1c2126] text-base">Сортировка:</span>
          <div className="flex items-center gap-6">
            {SORT_OPTIONS.map((opt) => {
              const active = opt.value === currentSort
              return (
                <Link
                  key={opt.value}
                  href={buildSortHref(basePath, filters, opt.value)}
                  className={`font-manrope text-base pb-1 border-b-2 ${
                    active
                      ? 'text-[#1c2126] font-medium border-[#179146]'
                      : 'text-[#1c2126] font-normal border-transparent hover:border-[#e9e9e9]'
                  }`}
                >
                  {opt.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewAndSave('grid')}
            aria-label="Плиткой"
            className={view === 'grid' ? 'text-[#179146]' : 'text-[#969393] hover:text-[#1c2126]'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>
          <button
            onClick={() => setViewAndSave('list')}
            aria-label="Списком"
            className={view === 'list' ? 'text-[#179146]' : 'text-[#969393] hover:text-[#1c2126]'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 min-w-0">
          {items.map((product) => (
            <ProductCardHorizontal key={product.id} product={product} />
          ))}
        </div>
      )}

      {currentPage < totalPages && (
        <div className="flex justify-center mt-8">
                    <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="bg-[#f0f0f0] hover:bg-[#e5e5e5] flex items-center justify-center h-[44px] px-[20px] rounded-[12px] disabled:opacity-50 font-montserrat font-medium text-[15px] text-[#1c2116]"
          >
            {isPending ? 'Загрузка...' : 'Показать ещё'}
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <CatalogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={basePath}
          filters={filters}
        />
      )}
    </div>
  )
}