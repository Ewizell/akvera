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
  const formRef = useRef<HTMLFormElement>(null)

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

      <form ref={formRef} action={handleUpload} className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept="image/*"
          required
          className="hidden"
          onChange={() => formRef.current?.requestSubmit()}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
          {isPending ? 'Загрузка...' : 'Прикрепить фото'}
        </button>
        <label className="flex items-center gap-1.5 text-sm text-gray-500">
          <input type="checkbox" name="isMain" />
          сделать главным
        </label>
      </form>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}