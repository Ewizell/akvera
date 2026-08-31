'use client'

import { useState, useTransition } from 'react'
import { createTag, updateTag } from '@/lib/actions/tag'
import { slugify } from '@/lib/slugify'

type Tag = { id: string; name: string; slug: string }

const inputCls =
  'w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

export default function TagFormModal({
  tag,
  onClose,
}: {
  tag?: Tag
  onClose: () => void
}) {
  const isEdit = !!tag
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(tag?.name ?? '')
  const [slug, setSlug] = useState(tag?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEdit ? await updateTag(tag.id, formData) : await createTag(formData)
      if (result.success) {
        onClose()
      } else {
        setError(result.error ?? 'Ошибка сохранения')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Редактировать тег' : 'Новый тег'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">
            ✕
          </button>
        </div>

        <form action={handleSubmit} className="space-y-3">
          <div>
            <label className={labelCls}>Название</label>
            <input
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!slugEdited) setSlug(slugify(e.target.value))
              }}
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

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 w-full"
          >
            {isPending ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}