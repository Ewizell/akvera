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

export default function ProductCardHorizontal({ product }: { product: CatalogCard }) {
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
      className="relative bg-white border border-[#e5e7e8] rounded-[16px] flex flex-wrap sm:flex-nowrap gap-3 p-3 w-full min-w-0 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative order-1 size-[104px] shrink-0 bg-gray-50 rounded-xl overflow-hidden sm:size-[216px]">
        <ProductImageHoverSlider images={product.images} alt={product.name} />

        {product.tags.length > 0 && (
          <div className="absolute left-2.5 top-2.5 z-10 flex flex-wrap gap-1.5 max-w-[85%]">
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
      </div>

      <div className="order-2 flex-1 min-w-0 flex flex-col gap-2 sm:gap-2.5 self-stretch">
        <p className="font-manrope font-medium text-[#1c2126] text-sm line-clamp-3 sm:text-base sm:line-clamp-none">
          {product.variantName || product.name}
        </p>

        <div className="relative w-fit">
          <button
            onClick={copySku}
            className="flex items-center gap-0.5 cursor-pointer group/sku"
            aria-label="Скопировать артикул"
          >
            <span className="font-manrope font-medium text-[#767d83] text-sm group-hover/sku:text-[#1c2126] group-hover/sku:underline">
              {product.sku}
            </span>
            <Image src="/icons/fi-rr-copy-alt.svg" alt="" width={14} height={14} className="shrink-0" />
          </button>
          {copied && (
            <div className="absolute left-0 bottom-full mb-1 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded font-manrope z-20">
              Скопировано
            </div>
          )}
        </div>

        {product.shortDescription && (
          <p className="hidden sm:block font-manrope font-medium text-[#1c2126] text-[13px] line-clamp-3 mb-1">
            {product.shortDescription}
          </p>
        )}

        {product.attrs.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-x-2.5 gap-y-1 font-manrope font-medium text-[#767d83] text-[13px]">
            {product.attrs.map((attr, i) => (
              <span key={i}>{attr.value}</span>
            ))}
          </div>
        )}
      </div>

      <div className="order-4 flex w-full items-center justify-between gap-3 border-t border-[#e5e7e8] pt-3 sm:order-3 sm:w-[150px] sm:shrink-0 sm:flex-col sm:items-start sm:justify-start sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 sm:gap-3">
        <div className="flex flex-col gap-1 sm:gap-3">
          <p className="font-manrope font-bold text-[#1c2126] text-lg sm:text-xl">
            {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
          </p>
          <p className="font-manrope font-medium text-[#767d83] text-xs sm:text-[14px]">
            {product.stock > 0 ? `${product.stock} шт. на складе` : 'По запросу'}
          </p>
        </div>
        <CartCardControl
          variantId={product.variantId}
          productName={product.name}
          slug={product.slug}
          sku={product.sku}
          price={product.price}
          image={product.image}
        />
      </div>

      <div className="order-3 flex flex-col gap-2 shrink-0 sm:order-4">
        <FavoriteButton variantId={product.variantId} />
        <div className="hidden lg:block">
          <CompareButton variantId={product.variantId} />
        </div>
      </div>
    </Link>
  )
}