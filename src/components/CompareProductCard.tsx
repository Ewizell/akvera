'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import FavoriteButton from './FavoriteButton'
import type { CompareVariant } from '@/lib/actions/compare'

export default function CompareProductCard({
  item,
  isPinned,
  onTogglePin,
  onRemove,
}: {
  item: CompareVariant
  isPinned: boolean
  onTogglePin: () => void
  onRemove: () => void
}) {
  const { addItem } = useCart()

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      slug: item.slug,
      sku: item.sku,
      price: item.price,
      image: item.image,
    })
  }

  return (
    <div className="group relative flex h-full flex-col items-stretch bg-white rounded-[16px] p-3 w-full shadow-none hover:shadow-md transition-shadow">
      <button
        onClick={onTogglePin}
        aria-label={isPinned ? 'Открепить колонку' : 'Закрепить колонку'}
        title={isPinned ? 'Открепить колонку' : 'Закрепить колонку при прокрутке'}
        className={`absolute top-2 left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-transform duration-150 ease-out hover:scale-110 active:scale-90 ${
          isPinned
            ? 'bg-[#179146] text-white opacity-100'
            : 'bg-white/90 text-[#767d83] hover:bg-white hover:text-[#1c2126] opacity-0 group-hover:opacity-100'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 17v5M8 3h8l-1 6 3 3v2H6v-2l3-3-1-6Z" />
        </svg>
      </button>

      <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <FavoriteButton variantId={item.variantId} />
      </div>

      <button
        onClick={onRemove}
        aria-label="Убрать из сравнения"
        title="Убрать из сравнения"
        className="absolute top-12 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm opacity-0 transition-transform duration-150 ease-out hover:bg-white hover:scale-110 hover:text-[#b33a3a] active:scale-90 text-[#767d83] group-hover:opacity-100"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </button>

      <Link href={`/product/${item.slug}`} className="block">
        <div className="relative h-[140px] w-[140px] mx-auto bg-gray-50 rounded-[12px] overflow-hidden mb-3">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.productName}
              fill
              className="object-contain"
              sizes="140px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Нет фото
            </div>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="font-manrope font-bold text-[#1c2126] text-xl text-left">
          {item.price !== null ? `${item.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
        </p>

        <button
          onClick={handleAddToCart}
          aria-label="В корзину"
          title="В корзину"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#179146] hover:bg-[#147a3a] text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      </div>

      <Link href={`/product/${item.slug}`} className="block">
        <p className="text-sm font-medium text-[#1c2126] text-left">
          {item.variantName || item.productName}
        </p>
      </Link>

    </div>
  )
}