'use client'

import { useState, useTransition } from 'react'
import { updateBrand, deleteBrand } from '@/lib/actions/brand'

type Brand = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
}

export default function BrandEditModal({
  brand,
  onClose,
}: {
  brand: Brand
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateBrand(brand.id, formData)
      if (result.success) {
        onClose()
      } else {
        setSaveError(result.error ?? 'Ошибка сохранения')
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBrand(brand.id)
      if (result.success) {
        onClose()
      } else {
        setDeleteError(result.error ?? 'Не удалось удалить бренд.')
        setConfirmingDelete(false)
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
          <h2 className="text-xl font-bold">Редактировать бренд</h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Название</label>
            <input name="name" defaultValue={brand.name} required className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Slug</label>
            <input name="slug" defaultValue={brand.slug} required className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">URL логотипа (необязательно)</label>
            <input name="logoUrl" defaultValue={brand.logoUrl ?? ''} className="w-full border rounded px-3 py-2" />
          </div>

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Сохранение...' : 'Сохранить'}
            </button>

            {!confirmingDelete ? (
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null)
                  setConfirmingDelete(true)
                }}
                className="text-red-600 hover:underline text-sm"
              >
                Удалить бренд
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Точно удалить?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-red-600 font-medium hover:underline disabled:opacity-50"
                >
                  Да, удалить
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="text-gray-500 hover:underline"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>

          {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
        </form>
      </div>
    </div>
  )
}