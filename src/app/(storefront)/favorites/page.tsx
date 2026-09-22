'use client'

import { Suspense, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useFavorites } from '@/lib/favorites-context'
import { getFavoriteVariants } from '@/lib/actions/favorites'
import type { CatalogCard } from '@/lib/catalog-query'
import { CategoryFilterSidebar } from '@/components/CategoryFilterSidebar'
import CatalogGrid from '@/components/CatalogGrid'
import { ProductCarousel } from '@/components/ProductCarousel'
import { getRecentlyViewed, type RecentlyViewedItem } from '@/lib/recently-viewed'
import { getFavoritesRecommendations } from '@/lib/actions/favorites-recommendations'
import type { CarouselVariant } from '@/components/CarouselProductCard'

function FavoritesContent() {
  const { variantIds, clear } = useFavorites()
  const [items, setItems] = useState<CatalogCard[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  
  useEffect(() => {
    if (variantIds.length === 0) {
      setItems([])
      return
    }

    startTransition(async () => {
      const data = await getFavoriteVariants(variantIds)
      const order = new Map(variantIds.map((id, i) => [id, i]))
      data.sort((a, b) => (order.get(a.variantId) ?? 0) - (order.get(b.variantId) ?? 0))
      setItems(data)
    })
  }, [variantIds])

  const [recommended, setRecommended] = useState<CarouselVariant[]>([])
const [recentlyViewed, setRecentlyViewed] = useState<CarouselVariant[]>([])

useEffect(() => {
  if (variantIds.length === 0) return
  getFavoritesRecommendations(variantIds).then(setRecommended)
}, [variantIds])

useEffect(() => {
  const viewed = getRecentlyViewed().filter((i) => !variantIds.includes(i.id))
  setRecentlyViewed(
    viewed.map((item: RecentlyViewedItem) => ({
      id: item.id,
      slug: item.slug,
      sku: '', // см. примечание выше про recently-viewed.ts
      name: item.name,
      price: item.price,
      stock: 0,
      product: item.product,
      images: item.images,
    }))
  )
}, [variantIds])
  // ── читаем те же query-параметры, что генерирует CategoryFilterSidebar/CatalogGrid ──
  const brand = searchParams.get('brand') ?? undefined
  const priceMin = searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined
  const priceMax = searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined
  const inStock = searchParams.get('stock') === '1'
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) ?? []
  const sortParam = searchParams.get('sort')
  const sort: 'price_asc' | 'price_desc' | 'stock' | '' =
    sortParam === 'price_asc' || sortParam === 'price_desc' || sortParam === 'stock'
      ? sortParam
      : ''

  const filters = { brand, tags, sort: sort || undefined, priceMin, priceMax, inStock }

  // ── опции сайдбара считаем по ПОЛНОМУ набору избранного, не по уже отфильтрованному ──
  const brandOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string }>()
    for (const p of items) {
      if (p.brandName && p.brandSlug) {
        map.set(p.brandSlug, { id: p.brandSlug, name: p.brandName, slug: p.brandSlug })
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [items])

  const priceRange = useMemo(() => {
    const prices = items.map((p) => p.price).filter((p): p is number => p !== null)
    if (prices.length === 0) return { min: 0, max: 0 }
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [items])

  const filteredItems = useMemo(() => {
    let result = items.filter((p) => {
      if (brand && p.brandSlug !== brand) return false
      if (priceMin !== undefined && (p.price ?? 0) < priceMin) return false
      if (priceMax !== undefined && (p.price ?? Infinity) > priceMax) return false
      if (inStock && p.stock <= 0) return false
      if (tags.length > 0 && !tags.every((t) => p.tags.some((pt) => pt.slug === t))) return false
      return true
    })

    if (sort === 'price_asc') result = [...result].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    else if (sort === 'price_desc') result = [...result].sort((a, b) => (b.price ?? -1) - (a.price ?? -1))
    else if (sort === 'stock') result = [...result].sort((a, b) => b.stock - a.stock)

    return result
  }, [items, brand, priceMin, priceMax, inStock, tags, sort])

  if (variantIds.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-manrope font-bold text-[28px] text-[#1c2126] mb-3">
          Список избранного пуст
        </h1>
        <p className="text-[#767d83] mb-6">
          Добавляйте товары из каталога, нажав на сердце на карточке.
        </p>
        <Link href="/catalog" className="text-[#179146] hover:underline font-manrope font-medium">
          Перейти в каталог
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <nav className="mb-5 flex flex-wrap items-center gap-3 text-[14px] font-semibold uppercase tracking-[2px] text-[#179146]">
        <Link href="/" className="hover:opacity-80">Главная</Link>
        <span>/</span>
        <span>Избранное</span>
      </nav>

      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[36px] font-bold leading-[1.2] text-[#0f172a]">Избранное</h1>
          <p className="mt-1 text-sm text-[#767d83] font-manrope">
            Найдено: {filteredItems.length} товар{filteredItems.length === 1 ? '' : 'ов'}
          </p>
        </div>
        <button
          onClick={clear}
          className="flex items-center gap-2 text-sm text-[#767d83] hover:text-[#1c2126] font-manrope"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
          Очистить избранное
        </button>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <CategoryFilterSidebar
          basePath="/favorites"
          priceRange={priceRange}
          brands={brandOptions}
          attributeOptions={[]}
          brand={brand}
          tags={tags}
          sort={sort || undefined}
          priceMin={priceMin}
          priceMax={priceMax}
          inStock={inStock}
          attrValues={{}}
          attrRanges={{}}
        />

        {isPending && items.length === 0 ? (
          <p className="text-[#767d83]">Загрузка…</p>
        ) : (
          <CatalogGrid
            key={searchParams.toString()}
            products={filteredItems}
            filters={filters}
            page={1}
            totalPages={1}
            basePath="/favorites"
          />
        )}
      </div>
      <ProductCarousel title="Вам может понравиться" variants={recommended} />
<ProductCarousel title="Вы недавно просматривали" variants={recentlyViewed} />
    </main>
  )
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<main className="max-w-7xl mx-auto px-4 py-20" />}>
      <FavoritesContent />
    </Suspense>
  )
}