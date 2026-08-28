'use client'

import { useEffect, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import CartCardControl from './CartCardControl'
import SortDropdown from './SortDropdown'
import { loadMoreCatalogProducts } from '@/lib/actions/catalog'
import type { CatalogFilters } from '@/lib/catalog-query'

type CatalogCard = {
  id: string
  variantId: string
  sku: string
  slug: string
  name: string
  brandName: string | null
  shortDescription: string | null
  image: string | null
  price: number | null
  attrs: { label: string; value: string }[]
  tags: { id: string; name: string; slug: string }[]
}

const STORAGE_KEY = 'akvera_catalog_view'

export default function CatalogGrid({
  products,
  filters,
  page,
  totalPages,
}: {
  products: CatalogCard[]
  filters: CatalogFilters
  page: number
  totalPages: number
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <SortDropdown
          currentSort={filters.sort ?? ''}
          category={filters.category}
          brand={filters.brand}
          q={filters.q}
          tags={filters.tags}
        />
        <div className="flex gap-1">
        <button
          onClick={() => setViewAndSave('grid')}
          aria-label="Плиткой"
          className={`p-2 rounded border ${view === 'grid' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-500 border-gray-300 hover:bg-gray-50'}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
        <button
          onClick={() => setViewAndSave('list')}
          aria-label="Карточкой"
          className={`p-2 rounded border ${view === 'list' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-500 border-gray-300 hover:bg-gray-50'}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
            >
              <div className="relative aspect-square bg-gray-100">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Нет фото
                  </div>
                )}
              </div>
              <div className="p-4">
                {product.brandName && (
                  <p className="text-xs text-gray-400 mb-1">{product.brandName}</p>
                )}
                <h2 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h2>
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                {product.price ? (
                  <p className="mt-2 text-base font-semibold">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-gray-400">Цена по запросу</p>
                )}
                <CartCardControl
                  variantId={product.variantId}
                  productName={product.name}
                  slug={product.slug}
                  sku={product.sku}
                  price={product.price}
                  image={product.image}
                />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col sm:flex-row w-full"
            >
              <div className="relative w-full sm:w-48 aspect-square sm:aspect-auto shrink-0 bg-gray-100">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    sizes="192px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Нет фото
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  {product.brandName && (
                    <p className="text-xs text-gray-400 mb-1">{product.brandName}</p>
                  )}
                  <h2 className="text-base font-medium text-gray-900">{product.name}</h2>
                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {product.shortDescription && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.shortDescription}</p>
                  )}
                  {product.attrs.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      {product.attrs.map((attr, i) => (
                        <li key={i}>
                          <span className="text-gray-400">{attr.label}:</span> {attr.value}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="shrink-0 sm:text-right sm:w-40">
                  {product.price ? (
                    <p className="text-lg font-semibold">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">Цена по запросу</p>
                  )}
                  <CartCardControl
                    variantId={product.variantId}
                    productName={product.name}
                    slug={product.slug}
                    sku={product.sku}
                    price={product.price}
                    image={product.image}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {currentPage < totalPages && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="px-6 py-2.5 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {isPending ? 'Загрузка...' : 'Показать ещё'}
          </button>
        </div>
      )}
    </div>
  )
}