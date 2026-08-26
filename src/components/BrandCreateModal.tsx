'use client'

import { useState, useTransition } from 'react'
import { createBrand } from '@/lib/actions/brand'
import { slugify } from '@/lib/slugify'

export default function BrandCreateModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugEdited) setSlug(slugify(value))
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createBrand(formData)
      if (result.success) {
        onClose()
      } else {
        setError(result.error ?? 'Ошибка создания')
      }
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <form action={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold">Новый бренд</h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Название</label>
            <input
              name="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Slug</label>
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugEdited(true)
              }}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">URL логотипа (необязательно)</label>
            <input name="logoUrl" className="w-full border rounded px-3 py-2" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Создание...' : 'Создать'}
          </button>
        </form>
      </div>
    </div>
  )
}