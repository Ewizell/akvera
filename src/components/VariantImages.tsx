'use client'

import { useState, useTransition, useRef } from 'react'
import { addImage, deleteImage } from '@/lib/actions/productImage'

type Image = {
  id: string
  url: string
  isMain: boolean
}

export default function VariantImages({ variantId, images }: { variantId: string; images: Image[] }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleUpload(formData: FormData) {
    startTransition(async () => {
      const result = await addImage(variantId, formData)
      if (result.success) {
        setError(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        setError(result.error ?? 'Ошибка загрузки')
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteImage(id)
      if (!result.success) {
        setError(result.error ?? 'Ошибка удаления')
      }
    })
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((img) => (
          <div key={img.id} className="relative">
            <img
              src={img.url}
              alt=""
              className={`w-16 h-16 object-cover rounded border-2 ${img.isMain ? 'border-blue-500' : 'border-gray-200'}`}
            />
            {img.isMain && (
              <span className="absolute -top-1 -left-1 bg-blue-500 text-white text-[9px] px-1 rounded">
                глав.
              </span>
            )}
            <button
              type="button"
              onClick={() => handleDelete(img.id)}
              disabled={isPending}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] leading-none"
            >
              ✕
            </button>
          </div>
        ))}
        {images.length === 0 && <p className="text-xs text-gray-400">Изображений пока нет</p>}
      </div>

      <form action={handleUpload} className="flex items-center gap-2 text-xs">
        <input ref={fileInputRef} type="file" name="file" accept="image/*" required className="text-xs" />
        <label className="flex items-center gap-1">
          <input type="checkbox" name="isMain" />
          главное
        </label>
        <button type="submit" disabled={isPending} className="text-blue-600 hover:underline disabled:opacity-50">
          {isPending ? 'Загрузка...' : 'Загрузить'}
        </button>
      </form>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}