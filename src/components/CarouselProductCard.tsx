'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import FavoriteButton from './FavoriteButton'
import CompareButton from './CompareButton'

export type CarouselVariant = {
  id: string
  slug: string
  sku: string
  name: string
  price: number | null
  stock: number
  product: { name: string }
  images: { url: string; alt: string | null }[]
}

export default function CarouselProductCard({ variant }: { variant: CarouselVariant }) {
  const [copied, setCopied] = useState(false)
  const { addItem } = useCart()
  const image = variant.images[0]

  function copySku(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(variant.sku)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      variantId: variant.id,
      productName: variant.product.name,
      variantName: variant.name,
      slug: variant.slug,
      sku: variant.sku,
      price: variant.price,
      image: image?.url ?? null,
    })
  }

  return (
    <Link
      href={`/product/${variant.slug}`}
      className="relative bg-white border border-[#e5e7e8] rounded-[16px] flex flex-col w-full h-full overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square w-full bg-gray-50">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? variant.name}
            fill
            className="object-contain "
            sizes="302px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Нет фото
          </div>
        )}

        <div className="absolute right-2.5 top-2.5 z-10 flex flex-col gap-2">
          <FavoriteButton variantId={variant.id} />
          <CompareButton variantId={variant.id} />
        </div>
      </div>

      <div className="flex flex-col gap-3 p-3 flex-1 min-h-0">
        <div>
          <p className="font-manrope font-bold text-[#1c2126] text-xl">
            {variant.price ? `${variant.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
          </p>

          <p className="font-manrope font-medium text-[#1c2126] text-sm mt-3 line-clamp-2">
            {variant.name || variant.product.name}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center gap-2 w-full min-w-0">
            <p className="font-manrope font-medium text-[#767d83] text-[14px] truncate min-w-0 flex-1">
              {variant.stock > 0 ? `${variant.stock} шт. на складе` : 'По запросу'}
            </p>
            <div className="relative shrink-0">
              <button
                onClick={copySku}
                className="flex items-center gap-0.5 shrink-0 max-w-[90px] cursor-pointer group/sku"
                aria-label="Скопировать артикул"
              >
                <span className="font-manrope font-medium text-[#767d83] text-sm truncate group-hover/sku:text-[#1c2126] group-hover/sku:underline">
                  {variant.sku}
                </span>
                <Image src="/icons/fi-rr-copy-alt.svg" alt="" width={14} height={14} className="shrink-0" />
              </button>
              {copied && (
                <div className="absolute right-0 bottom-full mb-1 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded font-manrope z-20">
                  Скопировано
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="h-[33px] self-start px-[16px] flex items-center justify-center bg-[#179146] hover:bg-[#147a3a] rounded-[6px] font-manrope font-semibold text-[14px] text-white transition-colors"
          >
            В корзину
          </button>
        </div>
      </div>
    </Link>
  )
}