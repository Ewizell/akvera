'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CartCardControl from './CartCardControl'
import CompareButton from './CompareButton'
import FavoriteButton from './FavoriteButton'
import ProductImageHoverSlider from './ProductImageHoverSlider'

type CatalogCard = {
  id: string
  variantId: string
  sku: string
  slug: string
  name: string
  variantName: string | null
  brandName: string | null
  shortDescription: string | null
  image: string | null
  images: string[]
  price: number | null
  stock: number
  attrs: { label: string; value: string }[]
  tags: { id: string; name: string; slug: string }[]
}

export default function ProductCard({ product }: { product: CatalogCard }) {
  const [copied, setCopied] = useState(false)

  function copySku(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(product.sku)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="relative bg-white border border-[#e5e7e8] rounded-[16px] flex flex-col w-full overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square w-full bg-gray-50">
        <ProductImageHoverSlider images={product.images} alt={product.name} />

        {product.tags.length > 0 && (
          <div className="absolute left-2.5 top-2.5 right-12 z-10 flex flex-wrap gap-1.5">
            {product.tags.map((tag, i) => (
              <span
                key={tag.id}
                className={`h-[26px] items-center px-2 bg-accent rounded-lg text-white text-[11px] sm:text-xs font-manrope font-medium truncate max-w-full ${
                  i > 0 ? 'hidden sm:flex' : 'flex'
                }`}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="absolute right-2.5 top-2.5 z-10 flex flex-col gap-2">
          <FavoriteButton variantId={product.variantId} />
          <div className="hidden lg:block">
            <CompareButton variantId={product.variantId} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-2.5 sm:gap-3 sm:p-3 flex-1">
        <div>
          <p className="font-manrope font-bold text-[#1c2126] text-base sm:text-xl">
            {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
          </p>

          <p className="font-manrope font-medium text-[#1c2126] text-[13px] leading-snug mt-2 line-clamp-3 sm:text-sm sm:mt-3 sm:line-clamp-none">
            {product.variantName || product.name}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2.5 sm:gap-3">
          <div className="flex flex-col items-start gap-0.5 w-full min-w-0 sm:flex-row sm:items-center sm:gap-2">
            <p className="font-manrope font-medium text-[#767d83] text-xs sm:text-[14px] truncate min-w-0 max-w-full sm:flex-1">
              {product.stock > 0 ? `${product.stock} шт. на складе` : 'По запросу'}
            </p>
            <div className="relative min-w-0 max-w-full shrink-0">
              <button
                onClick={copySku}
                className="flex items-center gap-0.5 max-w-full sm:shrink-0 sm:max-w-[90px] cursor-pointer group/sku"
                aria-label="Скопировать артикул"
              >
                <span className="font-manrope font-medium text-[#767d83] text-sm truncate group-hover/sku:text-[#1c2126] group-hover/sku:underline">
                  {product.sku}
                </span>
                <Image src="/icons/fi-rr-copy-alt.svg" alt="" width={14} height={14} className="shrink-0" />
              </button>
              {copied && (
                <div className="absolute left-0 sm:left-auto sm:right-0 bottom-full mb-1 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded font-manrope z-20">
                  Скопировано
                </div>
              )}
            </div>
          </div>

<CartCardControl
  variantId={product.variantId}
  productName={product.name}
  slug={product.slug}
  sku={product.sku}
  price={product.price}
  image={product.image}
  compact
/>

        </div>
      </div>
    </Link>
  )
}