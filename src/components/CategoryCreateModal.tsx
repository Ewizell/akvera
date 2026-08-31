'use client'

import { useState, useTransition } from 'react'
import { createCategory } from '@/lib/actions/category'
import { slugify } from '@/lib/slugify'

type Category = {
  id: string
  name: string
  slug: string
  parentId: string | null
}

const inputCls =
  'w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

export default function CategoryCreateModal({
  allCategories,
  onClose,
}: {
  allCategories: Category[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugEdited) {
      setSlug(slugify(value))
    }
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createCategory(formData)
      onClose()
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
          <h2 className="text-xl font-bold text-gray-900">Новая категория</h2>

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
            <label className={labelCls}>Родительская категория</label>
            <select name="parentId" defaultValue="" className={inputCls}>
              <option value="">— нет (категория верхнего уровня) —</option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

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