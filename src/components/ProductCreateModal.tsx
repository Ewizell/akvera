'use client'

import { useState, useTransition } from 'react'
import { createProduct } from '@/lib/actions/product'
import { slugify } from '@/lib/slugify'

type Category = { id: string; name: string }
type Brand = { id: string; name: string }

const inputCls =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
const cardCls = 'bg-white border border-gray-200 rounded-lg p-5'
const cardTitleCls = 'text-base font-semibold text-gray-900 mb-4'

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
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto text-gray-900">
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-3xl mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Новый товар</h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <form action={handleSubmit} className="space-y-5">
          <div className={cardCls}>
            <h2 className={cardTitleCls}>Модель</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Название модели</label>
                <input
                  name="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Категория</label>
                  <select name="categoryId" required className={inputCls}>
                    <option value="">— выберите —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Бренд</label>
                  <select name="brandId" defaultValue="" className={inputCls}>
                    <option value="">— без бренда —</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Описание</label>
                <textarea name="description" rows={3} className={inputCls} />
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <h2 className={cardTitleCls}>Первое исполнение</h2>
            <p className="text-xs text-gray-500 -mt-2 mb-4">
              Остальные исполнения можно будет добавить после создания товара
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Артикул (SKU)</label>
                <input name="sku" required className={inputCls} />
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
                <label className={labelCls}>Цена</label>
                <input name="price" type="number" step="0.01" required className={inputCls} />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Создание...' : 'Создать товар'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}