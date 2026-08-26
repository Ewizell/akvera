'use client'

import { useState, useTransition } from 'react'
import TagFormModal from './TagFormModal'
import { deleteTag } from '@/lib/actions/tag'

type Tag = { id: string; name: string; slug: string }

function TagRow({ tag, onEdit }: { tag: Tag; onEdit: (t: Tag) => void }) {
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTag(tag.id)
      if (!result.success) {
        setError(result.error ?? 'Не удалось удалить тег')
        setConfirming(false)
      }
    })
  }

  return (
    <tr className="border-b">
      <td className="py-3">{tag.name}</td>
      <td className="py-3 text-gray-500">{tag.slug}</td>
      <td className="py-3 text-right">
        {error && <span className="text-xs text-red-600 mr-3">{error}</span>}
        <button onClick={() => onEdit(tag)} className="text-blue-600 hover:underline mr-3">
          Редактировать
        </button>
        {!confirming ? (
          <button
            onClick={() => {
              setError(null)
              setConfirming(true)
            }}
            className="text-red-600 hover:underline"
          >
            Удалить
          </button>
        ) : (
          <span className="text-sm">
            Точно?{' '}
            <button onClick={handleDelete} disabled={isPending} className="text-red-600 font-medium hover:underline">
              Да
            </button>{' '}
            <button onClick={() => setConfirming(false)} className="text-gray-500 hover:underline">
              Отмена
            </button>
          </span>
        )}
      </td>
    </tr>
  )
}

export default function TagList({ tags }: { tags: Tag[] }) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingTag = tags.find((t) => t.id === editingId) ?? null

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Добавить тег
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left text-sm text-gray-500">
            <th className="py-2">Название</th>
            <th className="py-2">Slug</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <TagRow key={tag.id} tag={tag} onEdit={(t) => setEditingId(t.id)} />
          ))}
        </tbody>
      </table>

      {creating && <TagFormModal onClose={() => setCreating(false)} />}
      {editingTag && <TagFormModal tag={editingTag} onClose={() => setEditingId(null)} />}
    </>
  )
}