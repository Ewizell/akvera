'use client'

import { useRef } from 'react'
import Link from 'next/link'
import CarouselProductCard, {
  type CarouselVariant,
} from './CarouselProductCard'

export type { CarouselVariant }

function ChevronIcon({
  direction,
}: {
  direction: 'left' | 'right'
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={direction === 'left' ? 'rotate-180' : ''}
    >
      <path d="M6 3l5 5-5 5" />
    </svg>
  )
}

export function ProductCarousel({
  title,
  variants,
  href,
  linkLabel = 'Смотреть все',
}: {
  title: string
  variants: CarouselVariant[]
  href?: string
  linkLabel?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (variants.length === 0) return null

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return

    const amount = scrollRef.current.clientWidth

    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="mt-12">
      <div className="mb-[16px] flex items-center justify-between gap-4">
        <p className="font-manrope font-bold text-[24px] text-[#1c2126]">{title}</p>

        {href && (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-accent px-5 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
          >
            {linkLabel}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-[-16px] top-1/2 -translate-y-1/2 z-10 size-[32px] rounded-full bg-[#f0f0f0] hover:bg-[#e5e5e5] flex items-center justify-center text-[#1c2126] transition-colors"
          aria-label="Прокрутить влево"
        >
          <ChevronIcon direction="left" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="absolute right-[-16px] top-1/2 -translate-y-1/2 z-10 size-[32px] rounded-full bg-[#f0f0f0] hover:bg-[#e5e5e5] flex items-center justify-center text-[#1c2126] transition-colors"
          aria-label="Прокрутить вправо"
        >
          <ChevronIcon direction="right" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-stretch gap-[24px] overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="shrink-0 snap-start w-[calc((100%-96px)/5)]"
            >
              <CarouselProductCard variant={variant} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}