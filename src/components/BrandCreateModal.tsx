'use client'

import { useState, useTransition } from 'react'
import { createBrand } from '@/lib/actions/brand'
import { slugify } from '@/lib/slugify'

const inputCls =
  'w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <form action={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Новый бренд</h2>

          <div>
            <label className={labelCls}>Название</label>
            <input
              name="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Slug</label>
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugEdited(true)
              }}
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>URL логотипа (необязательно)</label>
            <input name="logoUrl" className={inputCls} />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Создание...' : 'Создать'}
          </button>
        </form>
      </div>
    </div>
  )
}