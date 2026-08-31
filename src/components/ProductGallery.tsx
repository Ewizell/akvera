'use client'

import { useState } from 'react'
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

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-400">
        Нет фото
      </div>
    )
  }

  const active = images[activeIndex]

  return (
    <div>
      <div
        onClick={() => setIsFullscreen(true)}
        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in"
      >
        <Image
          src={active.url}
          alt={active.alt || productName}
          fill
          className="object-contain p-6"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square bg-gray-100 rounded overflow-hidden border-2 transition-colors ${
                index === activeIndex ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || productName}
                fill
                className="object-contain p-1"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}

      {isFullscreen && (
        <div
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out p-6"
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl leading-none"
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white border border-white/30 rounded-full p-2"
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