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
      className="relative bg-white border border-[#e5e7e8] rounded-[16px] flex gap-3 p-3 w-full min-w-0 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative size-[216px] shrink-0 bg-gray-50 rounded-xl overflow-hidden">
        <ProductImageHoverSlider images={product.images} alt={product.name} />

        {product.tags.length > 0 && (
          <div className="absolute left-2.5 top-2.5 z-10 flex flex-wrap gap-1.5 max-w-[85%]">
            {product.tags.map((tag) => (
              <span
                key={tag.id}
                className="h-[26px] flex items-center px-2 bg-[#179146] rounded-lg text-white text-xs font-manrope font-medium truncate max-w-full"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2.5 self-stretch">
        <p className="font-manrope font-medium text-[#1c2126] text-base">
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
          <p className="font-manrope font-medium text-[#1c2126] text-[13px] line-clamp-3 mb-1">
            {product.shortDescription}
          </p>
        )}

        {product.attrs.length > 0 && (
          <div className="flex flex-wrap gap-x-2.5 gap-y-1 font-manrope font-medium text-[#767d83] text-[13px]">
            {product.attrs.map((attr, i) => (
              <span key={i}>{attr.value}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 items-start pl-4 border-l border-[#e5e7e8] w-[150px] shrink-0">
        <p className="font-manrope font-bold text-[#1c2126] text-xl">
          {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
        </p>
        <p className="font-manrope font-medium text-[#767d83] text-[14px]">
          {product.stock > 0 ? `${product.stock} шт. на складе` : 'По запросу'}
        </p>
        <CartCardControl
          variantId={product.variantId}
          productName={product.name}
          slug={product.slug}
          sku={product.sku}
          price={product.price}
          image={product.image}
        />
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <FavoriteButton variantId={product.variantId} />
        <CompareButton variantId={product.variantId} />
      </div>
    </Link>
  )
}