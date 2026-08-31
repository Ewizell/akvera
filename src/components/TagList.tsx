'use client'

import { useState, useTransition } from 'react'
import TagFormModal from './TagFormModal'
import { deleteTag } from '@/lib/actions/tag'

type Tag = { id: string; name: string; slug: string }

function TagChip({ tag, onEdit }: { tag: Tag; onEdit: (t: Tag) => void }) {
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

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 bg-white border border-red-200 rounded-full pl-3 pr-2 py-1.5 text-sm shadow-sm">
        <span className="text-gray-600">Удалить «{tag.name}»?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-red-600 font-medium hover:underline disabled:opacity-50"
        >
          Да
        </button>
        <button onClick={() => setConfirming(false)} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </span>
    )
  }

  return (
    <span className="group inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-3 pr-1.5 py-1.5 text-sm shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
      <button onClick={() => onEdit(tag)} className="text-gray-900 hover:text-blue-600">
        {tag.name}
        <span className="text-gray-400 ml-1.5 font-normal">{tag.slug}</span>
      </button>
      <button
        onClick={() => {
          setError(null)
          setConfirming(true)
        }}
        aria-label="Удалить тег"
        className="w-5 h-5 flex items-center justify-center rounded-full text-gray-300 hover:text-red-600 hover:bg-red-50 shrink-0"
      >
        ✕
      </button>
      {error && <span className="text-xs text-red-600 ml-1">{error}</span>}
    </span>
  )
}

export default function TagList({ tags }: { tags: Tag[] }) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingTag = tags.find((t) => t.id === editingId) ?? null

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {tags.length} {tags.length === 1 ? 'тег' : 'тегов'}
        </p>
        <button
          onClick={() => setCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + Добавить тег
        </button>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 border border-dashed border-gray-300 bg-white rounded-lg">
          Тегов пока нет
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip key={tag.id} tag={tag} onEdit={(t) => setEditingId(t.id)} />
          ))}
        </div>
      )}

      {creating && <TagFormModal onClose={() => setCreating(false)} />}
      {editingTag && <TagFormModal tag={editingTag} onClose={() => setEditingId(null)} />}
    </>
  )
}