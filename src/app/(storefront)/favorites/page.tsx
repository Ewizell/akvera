'use client'

import { useEffect, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/lib/favorites-context'
import { getFavoriteVariants } from '@/lib/actions/favorites'
import type { CatalogCard } from '@/lib/catalog-query'

export default function FavoritesPage() {
  const { variantIds, removeFavorite, clear } = useFavorites()
  const [items, setItems] = useState<CatalogCard[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (variantIds.length === 0) {
      setItems([])
      return
    }
    startTransition(async () => {
      const data = await getFavoriteVariants(variantIds)
      setItems(data)
    })
  }, [variantIds])

  if (variantIds.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold mb-3">Список избранного пуст</h1>
        <p className="text-gray-500 mb-6">Добавляйте товары из каталога, нажав на сердце на карточке.</p>
        <Link href="/catalog" className="text-blue-600 hover:underline">
          Перейти в каталог
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Избранное</h1>
        <button onClick={clear} className="text-sm text-gray-500 hover:underline">
          Очистить всё
        </button>
      </div>

      {isPending && items.length === 0 ? (
        <p className="text-gray-500">Загрузка…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <div key={product.id} className="relative group">
              <button
                onClick={() => removeFavorite(product.variantId)}
                aria-label="Убрать из избранного"
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white border text-gray-400 hover:text-gray-700 text-sm flex items-center justify-center shadow-sm"
              >
                ×
              </button>
              <Link
                href={`/product/${product.slug}`}
                className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
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
                    {product.variantName && (
                      <span className="block text-xs font-normal text-gray-500">{product.variantName}</span>
                    )}
                  </h2>
                  {product.price ? (
                    <p className="mt-2 text-base font-semibold">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-400">Цена по запросу</p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}