'use client'

import { useState, useTransition } from 'react'
import { createProduct } from '@/lib/actions/product'
import { slugify } from '@/lib/slugify'

type Category = { id: string; name: string }

type Brand = { id: string; name: string }

export default function ProductCreateModal({
  categories,
  brands,
  onClose,
}: {
  categories: Category[]
  brands: Brand[]
  onClose: () => void
}) {
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
      const result = await createProduct(formData)
      if (result.success) {
        onClose()
      } else {
        setError(result.error ?? 'Ошибка создания')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Новый товар</h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">
            ✕
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Название модели</label>
            <input
              name="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Категория</label>
            <select name="categoryId" required className="w-full border rounded px-3 py-2">
              <option value="">— выберите —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Бренд (необязательно)</label>
            <select name="brandId" defaultValue="" className="w-full border rounded px-3 py-2">
              <option value="">— без бренда —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Описание</label>
            <textarea name="description" rows={3} className="w-full border rounded px-3 py-2" />
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Первое исполнение товара (можно будет добавить ещё после создания)
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Артикул (SKU)</label>
                <input name="sku" required className="w-full border rounded px-3 py-2" />
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
                <label className="block text-sm text-gray-600 mb-1">Цена</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Создание...' : 'Создать товар'}
          </button>
        </form>
      </div>
    </div>
  )
}