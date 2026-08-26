'use client'

import { useState, useTransition } from 'react'
import { createTag, updateTag } from '@/lib/actions/tag'
import { slugify } from '@/lib/slugify'

type Tag = { id: string; name: string; slug: string }

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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{isEdit ? 'Редактировать тег' : 'Новый тег'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">
            ✕
          </button>
        </div>

        <form action={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Название</label>
            <input
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!slugEdited) setSlug(slugify(e.target.value))
              }}
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full"
          >
            {isPending ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}