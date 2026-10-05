'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

type GalleryImage = {
  id: string
  url: string
  alt: string | null
}

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[]
  productName: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)
  const touchX = useRef<number | null>(null)

  // Мобильная лента: индекс по положению прокрутки
  function handleStripScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const index = Math.round(el.scrollLeft / el.clientWidth)
    if (index !== activeIndex) setActiveIndex(index)
  }

  // Лента догоняет, если фото сменили стрелками в полноэкранном режиме
  useEffect(() => {
    const el = stripRef.current
    if (!el || el.clientWidth === 0) return
    if (Math.round(el.scrollLeft / el.clientWidth) !== activeIndex) {
      el.scrollTo({ left: activeIndex * el.clientWidth })
    }
  }, [activeIndex])

  // Свайп в полноэкранном режиме
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return
    const diff = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(diff) < 50 || images.length < 2) return
    setActiveIndex((i) =>
      diff < 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length,
    )
  }

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-gray-100 rounded-[12px] overflow-hidden flex items-center justify-center text-gray-400 w-full max-w-[604px]">
        Нет фото
      </div>
    )
  }

  const active = images[activeIndex]

  return (
    <div className="flex gap-3 sm:gap-[24px] items-start w-full max-w-[604px]">
      {images.length > 1 && (
        <div className="relative hidden flex-col gap-[16px] shrink-0 w-[80px] sm:flex">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="relative"
            >
              {index === activeIndex && (
                <span className="absolute -left-2 top-1/2 -translate-y-1/2 h-[60%] w-[2px] rounded-[4px] bg-accent" />
              )}
              <span className="block relative aspect-square h-[64px] rounded-[4px] overflow-hidden bg-gray-100">
                <Image
                  src={img.url}
                  alt={img.alt || productName}
                  fill
                  className="object-contain p-1"
                  sizes="80px"
                />
              </span>
            </button>
          ))}
        </div>
      )}

      <div
        onClick={() => setIsFullscreen(true)}
        className="relative min-w-0 flex-1 aspect-[500/482] bg-white rounded-[12px] overflow-hidden cursor-zoom-in"
      >
        {/* Планшет и десктоп: одно фото, смена миниатюрами */}
        <Image
          src={active.url}
          alt={active.alt || productName}
          fill
          className="hidden object-contain p-6 sm:block"
          sizes="(max-width: 768px) 100vw, 500px"
          priority
        />

        {/* Мобильный: лента со свайпом */}
        <div
          ref={stripRef}
          onScroll={handleStripScroll}
          className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden"
        >
          {images.map((img) => (
            <div key={img.id} className="relative h-full w-full shrink-0 snap-center">
              <Image
                src={img.url}
                alt={img.alt || productName}
                fill
                draggable={false}
                className="object-contain p-3"
                sizes="100vw"
              />
            </div>
          ))}
        </div>

        {/* Линии-индикаторы (мобильный) */}
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-4 bottom-3 flex gap-1 sm:hidden">
            {images.map((img, i) => (
              <span
                key={img.id}
                className={`h-[3px] flex-1 rounded-full transition-colors ${
                  i === activeIndex ? 'bg-accent' : 'bg-black/15'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {isFullscreen && (
        <div
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center cursor-zoom-out p-3 sm:p-6"
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-3 right-3 z-10 flex size-11 items-center justify-center text-4xl leading-none text-white/80 hover:text-white sm:top-4 sm:right-4"
            aria-label="Закрыть"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex((i) => (i - 1 + images.length) % images.length)
                }}
                className="absolute left-2 sm:left-4 z-10 top-1/2 -translate-y-1/2 bg-black/30 text-white/80 hover:text-white border border-white/30 rounded-full p-2"
                aria-label="Предыдущее фото"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex((i) => (i + 1) % images.length)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white border border-white/30 rounded-full p-2"
                aria-label="Следующее фото"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative w-full h-full max-w-4xl max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX
            }}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={active.url}
              alt={active.alt || productName}
              fill
              className="object-contain"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        </div>
      )}
    </div>
  )
}