'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type CarouselVariant = {
  id: string
  slug: string
  name: string
  price: number | null
  product: { name: string }
  images: { url: string; alt: string | null }[]
}

export function ProductCarousel({ title, variants }: { title: string; variants: CarouselVariant[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (variants.length === 0) return null

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return
    const amount = 280
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 border rounded-full p-2 bg-white/90 backdrop-blur shadow-md hover:bg-white"
          aria-label="Прокрутить влево"
        >
          <ChevronLeft className="w-4 h-4 text-gray-900" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 border rounded-full p-2 bg-white/90 backdrop-blur shadow-md hover:bg-white"
          aria-label="Прокрутить вправо"
        >
          <ChevronRight className="w-4 h-4 text-gray-900" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {variants.map((variant, index) => {
            const image = variant.images[0]
            return (
              <Link
                key={variant.id}
                href={`/product/${variant.slug}`}
                className="shrink-0 w-64 snap-start border rounded-lg p-3 hover:shadow-md transition-shadow bg-white"
              >
                <div className="relative w-full aspect-square mb-2 bg-gray-50 rounded overflow-hidden">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.alt ?? variant.name}
                      fill
                      className="object-contain"
                      sizes="256px"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Нет фото
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{variant.product.name}</p>
                <p className="text-sm font-medium text-gray-900 truncate mb-1">{variant.name}</p>
                <p className="text-sm text-gray-900">
                  {variant.price !== null ? `${variant.price} ₽` : 'по запросу'}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}