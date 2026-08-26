'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalCount } = useCart()
  const hasRequestPriceItems = items.some((item) => item.price === null)

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold mb-4">Корзина пуста</h1>
        <p className="text-gray-500 mb-6">Добавьте товары из каталога, чтобы оформить заявку</p>
        <Link href="/catalog" className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
          Перейти в каталог
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Корзина ({totalCount})</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-4 border rounded-lg p-4">
            <Link href={`/catalog/${item.slug}`} className="relative w-24 h-24 bg-gray-100 rounded shrink-0">
              {item.image ? (
                <Image src={item.image} alt={item.productName} fill className="object-contain p-2" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  Нет фото
                </div>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/catalog/${item.slug}`} className="font-medium hover:underline">
                {item.productName}
              </Link>
              {item.variantName && <p className="text-sm text-gray-500">{item.variantName}</p>}
              <p className="text-xs text-gray-400 mt-1">Артикул: {item.sku}</p>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="px-3 py-1 hover:bg-gray-100 disabled:opacity-30"
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.variantId, parseInt(e.target.value, 10) || 1)}
                    className="w-12 text-center border-x py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.variantId)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Удалить
                </button>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="font-semibold">
                {item.price ? `${(item.price * item.quantity).toLocaleString('ru-RU')} ₽` : 'По запросу'}
              </p>
              {item.price && item.quantity > 1 && (
                <p className="text-xs text-gray-400">{item.price.toLocaleString('ru-RU')} ₽ / шт</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Итого ({totalCount} шт.)</p>
          <p className="text-2xl font-bold">{totalPrice.toLocaleString('ru-RU')} ₽</p>
          {hasRequestPriceItems && (
            <p className="text-xs text-amber-600 mt-1">
              Есть товары с ценой по запросу — сумма будет уточнена при обработке заявки
            </p>
          )}
        </div>
        <Link
          href="/checkout"
          className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Оформить заявку
        </Link>
      </div>
    </main>
  );
}