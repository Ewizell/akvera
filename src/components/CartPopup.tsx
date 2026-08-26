'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export default function CartPopup() {
  const { items, closeCart, removeItem, totalPrice, totalCount } = useCart()
  const hasRequestPriceItems = items.some((item) => item.price === null)

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 flex flex-col max-h-[70vh]">
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="font-semibold text-sm">Корзина ({totalCount})</h2>
        <button onClick={closeCart} className="text-gray-400 hover:text-gray-800 text-lg leading-none">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Корзина пуста</p>
        )}
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-2">
            <div className="relative w-12 h-12 bg-gray-100 rounded shrink-0">
              {item.image ? (
                <Image src={item.image} alt={item.productName} fill className="object-contain p-1" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">
                  Нет фото
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{item.productName}</p>
              <p className="text-xs text-gray-500">
                {item.quantity} × {item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : 'по запросу'}
              </p>
            </div>
            <button
              onClick={() => removeItem(item.variantId)}
              className="text-gray-400 hover:text-red-600 text-xs shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="p-3 border-t space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Итого</span>
            <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
          </div>
          {hasRequestPriceItems && (
            <p className="text-xs text-amber-600">
              Есть товары с ценой по запросу
            </p>
          )}
          <Link
            href="/cart"
            onClick={closeCart}
            className="block text-center bg-black text-white py-2 rounded-lg text-sm hover:bg-gray-800"
          >
            Перейти в корзину
          </Link>
        </div>
      )}
    </div>
  )
}