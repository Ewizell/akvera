'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export default function CartPopup() {
  const { items, closeCart, removeItem, clearCart, totalPrice, totalCount } = useCart()
  const hasRequestPriceItems = items.some((item) => item.price === null)

  return (
    <div className="absolute right-0 top-full mt-2 w-[340px] bg-white border border-[#e5e7e8] rounded-[16px] shadow-[0px_6px_18px_0px_rgba(15,23,42,0.07)] z-50 flex flex-col max-h-[70vh] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7e8]">
        <h2 className="font-montserrat font-semibold text-[15px] text-[#1c2126]">
          Корзина {totalCount > 0 && <span className="text-[#767d83] font-medium">({totalCount})</span>}
        </h2>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="font-manrope text-[12px] text-[#969393] hover:text-[#e0245e] transition-colors"
            >
              Очистить
            </button>
          )}
          <button
            onClick={closeCart}
            className="text-[#969393] hover:text-[#1c2126] transition-colors leading-none"
            aria-label="Закрыть корзину"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-[#969393]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <p className="font-manrope text-sm">Корзина пуста</p>
          </div>
        )}
        {items.map((item) => (
          <div key={item.variantId} className="group flex gap-3 items-center">
            <Link
              href={`/product/${item.slug}`}
              onClick={closeCart}
              className="flex gap-3 items-center flex-1 min-w-0"
            >
              <div className="relative w-14 h-14 bg-gray-50 rounded-[10px] overflow-hidden shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.productName} fill className="object-contain p-1" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] text-[#969393]">
                    Нет фото
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-manrope font-medium text-[13px] text-[#1c2126] truncate hover:text-[#179146] transition-colors">
                  {item.productName}
                </p>
                <p className="font-manrope text-[13px] text-[#767d83] mt-0.5">
                  {item.quantity} × {item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : 'по запросу'}
                </p>
              </div>
            </Link>
            <button
              onClick={() => removeItem(item.variantId)}
              className="shrink-0 text-[#c4c4c4] hover:text-[#e0245e] transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Удалить товар"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="px-4 py-3 border-t border-[#e5e7e8] flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-manrope font-medium text-[14px] text-[#1c2126]">Итого</span>
            <span className="font-montserrat font-semibold text-[18px] text-[#1c2126]">
              {totalPrice.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          {hasRequestPriceItems && (
            <p className="font-manrope text-[12px] text-[#b8860b]">
              Есть товары с ценой по запросу
            </p>
          )}
          <Link
            href="/cart"
            onClick={closeCart}
            className="h-[40px] flex items-center justify-center bg-[#179146] hover:bg-[#147a3a] rounded-[10px] font-montserrat font-semibold text-[14px] text-white transition-colors"
          >
            Перейти в корзину
          </Link>
        </div>
      )}
    </div>
  )
}