'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ProductImageHoverSlider({
  images,
  alt,
}: {
  images: string[]
  alt: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const index = Math.round(el.scrollLeft / el.clientWidth)
    if (index !== activeIndex) setActiveIndex(index)
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        Нет фото
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Устройства с мышью: фото меняется по наведению */}
      <div className="absolute inset-0 hidden [@media(hover:hover)]:block">
        <Image
          src={images[activeIndex]}
          alt={alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {images.length > 1 && (
          <div className="absolute inset-0 flex">
            {images.map((_, i) => (
              <div
                key={i}
                className="h-full flex-1"
                style={{ flexBasis: `${100 / images.length}%` }}
                onMouseEnter={() => setActiveIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Тач-устройства: свайп */}
      <div
        onScroll={handleScroll}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [@media(hover:hover)]:hidden"
      >
        {images.map((src, i) => (
          <div key={i} className="relative h-full w-full shrink-0 snap-center">
            <Image
              src={src}
              alt={i === 0 ? alt : `${alt} — фото ${i + 1}`}
              fill
              draggable={false}
              className="object-contain"
              sizes="50vw"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="pointer-events-none absolute inset-x-2.5 bottom-2 flex gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-[3px] flex-1 rounded-full transition-colors ${
                i === activeIndex ? 'bg-accent' : 'bg-black/15'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}