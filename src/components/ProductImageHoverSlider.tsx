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

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        Нет фото
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
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

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === activeIndex ? 'bg-[#179146]' : 'bg-white/70 ring-1 ring-black/10'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}