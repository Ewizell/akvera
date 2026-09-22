'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { ProductCarousel, type CarouselVariant } from '@/components/ProductCarousel'
import { getRecentlyViewed } from '@/lib/recently-viewed'
import FavoriteButton from '@/components/FavoriteButton'
import RemoveFromCartButton from '@/components/RemoveFromCartButton'
// TODO: подставьте реальный хук избранного и проверьте имя метода
// (в памяти проекта — FavoritesProvider/useFavorites с toggle по variantId)
import { useFavorites } from '@/lib/favorites-context'

// TODO: «Популярные товары» нужно получать на сервере (например, тегом
// "Популярно" через существующий Tag-фильтр) и передавать сюда пропом —
// сделайте page.tsx server component, который фетчит эти варианты и
// рендерит <CartPage popularVariants={...} />
type CartPageProps = {
  popularVariants?: CarouselVariant[]
}

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#767d83" strokeWidth="1.8">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}

export default function CartPage({ popularVariants = [] }: CartPageProps) {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalCount } = useCart()
  const { toggleFavorite } = useFavorites() // TODO: проверить реальную сигнатуру
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [recentlyViewed] = useState<CarouselVariant[]>(() =>
    getRecentlyViewed().map((item) => ({
      id: item.id,
      slug: item.slug,
      sku: '',
      name: item.name,
      price: item.price,
      stock: 0,
      product: item.product,
      images: item.images,
    }))
  )

  const hasRequestPriceItems = items.some((item) => item.price === null)
  const allSelected = items.length > 0 && selected.size === items.length

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.variantId)))
  }

  function toggleSelect(variantId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(variantId)) next.delete(variantId)
      else next.add(variantId)
      return next
    })
  }

  function deleteSelected() {
    selected.forEach((id) => removeItem(id))
    setSelected(new Set())
  }

  function copySku(sku: string) {
    navigator.clipboard?.writeText(sku)
  }

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold mb-4">Корзина пуста</h1>
        <p className="text-gray-500 mb-6">Добавьте товары из каталога, чтобы оформить заявку</p>
        <Link href="/catalog" className="inline-block bg-[#179146] text-white px-6 py-3 rounded-xl hover:bg-[#137a3a]">
          Перейти в каталог
        </Link>
      </main>
    )
  }

  return (
    <main className="bg-[#f8fafc] py-10">
      <div className="max-w-[1280px] mx-auto px-4 md:px-20">
        <nav className="flex gap-3 text-[14px] tracking-[1px] uppercase font-semibold text-[#179146] mb-6">
          <Link href="/">Главная</Link>
          <span>/</span>
          <span>корзина</span>
        </nav>

        <h1 className="text-[36px] font-semibold mb-6">Корзина</h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Левая колонка — товары */}
          <div className="bg-white border border-[#e5e7e8] rounded-2xl shadow-[0px_6px_18px_0px_rgba(15,23,42,0.07)] flex-1 w-full">
            <div className="flex items-center justify-between px-6 py-6">
              <h2 className="text-2xl font-semibold">Ваша заявка</h2>
              <button
                onClick={clearCart}
                className="text-sm underline transition-all duration-150 ease-out hover:scale-105 hover:text-red-600 active:scale-95"
              >
                Очистить корзину
              </button>
            </div>

            <div className="flex items-center gap-4 px-6 pb-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-[17px] h-[17px] accent-[#179146] rounded transition-transform duration-150 ease-out active:scale-90 group-hover:scale-110"
                  />
                  <span className="transition-colors duration-150 group-hover:text-[#179146]">Выбрать все</span>
                </label>
                <button
                  onClick={deleteSelected}
                  disabled={selected.size === 0}
                  className="flex items-center gap-1 text-sm transition-all duration-150 ease-out
                    disabled:opacity-30 enabled:hover:scale-105 enabled:hover:text-red-600 enabled:active:scale-95"
                >
                  <Image src="/icons/fi-br-trash.svg" alt="" width={16} height={16} />
                  Удалить выбранные
                </button>
            </div>

            <div className="border-t border-[#e5e7e8]">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 p-6 border-b last:border-b-0 border-[#e5e7e8]">
                  <input
                    type="checkbox"
                    checked={selected.has(item.variantId)}
                    onChange={() => toggleSelect(item.variantId)}
                    className="w-[17px] h-[17px] mt-1 accent-[#179146] rounded shrink-0"
                  />

                  <Link href={`/product/${item.slug}`} className="relative w-[108px] h-[108px] bg-gray-100 rounded shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.productName} fill className="object-contain p-2" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        Нет фото
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <Link href={`/product/${item.slug}`} className="text-sm hover:underline">
                      {item.productName}
                      {item.variantName ? ` — ${item.variantName}` : ''}
                    </Link>
                    <button onClick={() => copySku(item.sku)} className="flex items-center gap-1 text-xs text-[#767d83] w-fit">
                      {item.sku} <IconCopy />
                    </button>
                    <div className="flex items-center gap-3">
                      <FavoriteButton variantId={item.variantId} />
                      <RemoveFromCartButton variantId={item.variantId} />
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0">
                    <p className="font-bold text-[20px]">
                      {item.price ? `${(item.price * item.quantity).toLocaleString('ru-RU')} ₽` : 'По запросу'}
                    </p>

                    <div className="flex items-center gap-1 bg-[#eeeff1] rounded-md h-[33px] px-2">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="disabled:opacity-30 px-1 text-lg leading-none"
                      >
                        −
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-1 text-lg leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Правая колонка — итого */}
          <div className="bg-white border border-[#e5e7e8] rounded-2xl shadow-[0px_6px_18px_0px_rgba(15,23,42,0.07)] p-6 w-full lg:w-[360px] shrink-0 flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">Условия заказа</h2>

            <div className="flex justify-between text-[15px] text-[#475569]">
              <span>Товары, {totalCount} шт.</span>
              <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between text-[15px] text-[#475569]">
              <span>Доставка</span>
              <span>Рассчитаем</span>
            </div>

            {hasRequestPriceItems && (
              <div className="flex gap-2">
                <div className="w-[3px] rounded-xl bg-[#179146] shrink-0" />
                <p className="text-sm text-[#1c2126]">
                  Есть товары с ценой по запросу — сумма будет уточнена при обработке заявки
                </p>
              </div>
            )}

            <p className="text-[26px] font-bold">Итого: {totalPrice.toLocaleString('ru-RU')} ₽</p>

            <Link
              href="/checkout"
              className="bg-[#179146] text-white text-center rounded-xl py-3 font-semibold hover:bg-[#137a3a] transition-colors"
            >
              Перейти к оформлению
            </Link>

            <div className="h-px bg-[#d9d9d9]" />

            <div className="flex flex-col gap-2 text-sm text-[#1c2116]">
              <p className="flex items-center gap-1 font-semibold">
                <Image src="/icons/fi-br-info.svg" alt="" width={16} height={16} />
                Внимание!
              </p>
              <p>Цены носят информационный характер и не являются публичной офертой</p>
            </div>

            <div className="h-px bg-[#d9d9d9]" />

            <p className="text-sm text-[#1c2116]">
              Также вы можете оформить заказ или задать вопрос по{' '}
              {/* TODO: укажите реальный email поддержки */}
              <a href="mailto:info@akvera.ru" className="text-[#0082b2] font-medium">
                электронной почте
              </a>
              . Наши менеджеры предоставят информацию по обращению, проконсультируют по продукции и помогут с оформлением заказа.
            </p>
          </div>
        </div>
      </div>

      {popularVariants.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 md:px-20 mt-16">
          <ProductCarousel title="Популярные товары" variants={popularVariants} />
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 md:px-20 mt-16">
          <ProductCarousel title="Вы недавно смотрели" variants={recentlyViewed} />
        </div>
      )}
    </main>
  )
}