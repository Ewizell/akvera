'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export default function CartPopup() {
  const {
    items,
    closeCart,
    removeItem,
    clearCart,
    totalPrice,
    totalCount,
  } = useCart()

  const hasRequestPriceItems = items.some((item) => item.price === null)

  return (
    <div className="absolute right-0 top-full z-50 mt-2 flex w-[340px] max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-[#e5e8eb] bg-white/95 backdrop-blur-sm">
      {/* Заголовок */}
      <div className="flex items-center justify-between border-b border-[#e5e8eb] px-4 py-3.5">
        <h2 className="font-manrope text-[15px] font-semibold text-[#28313d]">
          Корзина{' '}
          {totalCount > 0 && (
            <span className="font-medium text-[#929aa6]">
              ({totalCount})
            </span>
          )}
        </h2>

        <div className="flex items-center gap-2">
          {/* Очистить корзину */}
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="
                flex h-8 cursor-pointer items-center gap-1.5
                rounded-lg
                bg-[#f4f5f7]
                px-2.5
                font-manrope
                text-[12px]
                font-medium
                text-[#66717d]
                transition-colors
                duration-200
                hover:bg-[#e9ecef]
                hover:text-[#28313d]
              "
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 4v2" />
                <path d="M19 6l-1 14a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20L5 6" />
                <path d="M10 10v7" />
                <path d="M14 10v7" />
              </svg>

              Очистить
            </button>
          )}

          {/* Закрыть */}
          <button
            type="button"
            onClick={closeCart}
            className="
              flex h-8 w-8 cursor-pointer items-center justify-center
              rounded-lg
              text-[#929aa6]
              transition-colors
              duration-200
              hover:bg-[#f4f5f7]
              hover:text-[#28313d]
            "
            aria-label="Закрыть корзину"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Товары */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-3">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f5f7] text-[#929aa6]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>

            <p className="font-manrope text-[14px] text-[#929aa6]">
              Корзина пуста
            </p>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.variantId}
            className="group flex items-center gap-3 border-b border-[#f0f2f3] py-2.5 last:border-b-0"
          >
            <Link
              href={`/product/${item.slug}`}
              onClick={closeCart}
              className="group/link flex min-w-0 flex-1 cursor-pointer items-center gap-3"
            >
              {/* Изображение */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f4f5f7]">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    sizes="56px"
                    className="object-contain p-1.5"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[9px] text-[#929aa6]">
                    Нет фото
                  </div>
                )}
              </div>

              {/* Информация */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-manrope text-[13px] font-medium text-[#28313d] transition-colors duration-200 group-hover/link:text-accent">
                  {item.productName}
                </p>

                {item.variantName && (
                  <p className="mt-0.5 truncate font-manrope text-[12px] text-[#929aa6]">
                    {item.variantName}
                  </p>
                )}

                <p className="mt-1 font-manrope text-[12px] text-[#66717d]">
                  {item.quantity} ×{' '}
                  {item.price !== null
                    ? `${item.price.toLocaleString('ru-RU')} ₽`
                    : 'по запросу'}
                </p>
              </div>
            </Link>

            {/* Удаление товара */}
            <button
              type="button"
              onClick={() => removeItem(item.variantId)}
              className="
                flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center
                rounded-lg
                text-[#b5bcc3]
                transition-colors
                duration-200
                hover:bg-[#f4f5f7]
                hover:text-[#28313d]
                sm:opacity-0
                sm:group-hover:opacity-100
              "
              aria-label={`Удалить ${item.productName}`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Итог */}
      {items.length > 0 && (
        <div className="border-t border-[#e5e8eb] px-4 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <span className="font-manrope text-[14px] font-medium text-[#66717d]">
              Итого
            </span>

            <span className="font-manrope text-[19px] font-semibold text-[#28313d]">
              {totalPrice.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          {hasRequestPriceItems && (
            <div className="mt-2.5 flex gap-2">
              <span className="mt-0.5 h-4 w-[3px] shrink-0 rounded-full bg-accent" />

              <p className="font-manrope text-[12px] leading-4 text-[#66717d]">
                Часть товаров имеет цену по запросу. Итоговая стоимость будет
                уточнена менеджером.
              </p>
            </div>
          )}

          {/* Перейти в корзину */}
          <Link
            href="/cart"
            onClick={closeCart}
            className="
              mt-3 flex h-11 w-full cursor-pointer items-center justify-center
              rounded-xl
              bg-accent
              font-manrope text-[14px] font-semibold text-white
              transition-colors
              duration-200
              hover:bg-accent-hover
            "
          >
            Перейти в корзину
          </Link>
        </div>
      )}
    </div>
  )
}