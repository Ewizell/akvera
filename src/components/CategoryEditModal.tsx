'use client'

import { useState, useTransition } from 'react'
import { updateCategory, deleteCategory } from '@/lib/actions/category'

type Category = {
  id: string
  name: string
  slug: string
  parentId: string | null
}

const inputCls =
  'w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

export default function CategoryEditModal({
  category,
  allCategories,
  onClose,
}: {
  category: Category
  allCategories: Category[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateCategory(category.id, formData)
      onClose()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if (result.success) {
        onClose()
      } else {
        setDeleteError(result.error ?? 'Не удалось удалить категорию.')
        setConfirmingDelete(false)
      }
    })
  }

  const possibleParents = allCategories.filter((c) => c.id !== category.id)

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
          <h2 className="text-xl font-bold text-gray-900">Редактировать категорию</h2>

          <div>
            <label className={labelCls}>Название</label>
            <input name="name" defaultValue={category.name} required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Slug</label>
            <input name="slug" defaultValue={category.slug} required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Родительская категория</label>
            <select name="parentId" defaultValue={category.parentId ?? ''} className={inputCls}>
              <option value="">— нет (категория верхнего уровня) —</option>
              {possibleParents.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
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
                Удалить категорию
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
        </form>
      </div>
    </div>
  )
}