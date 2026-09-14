'use client'

import { useState, useTransition } from 'react'
import TagFormModal from './TagFormModal'
import { deleteTag } from '@/lib/actions/tag'

type Tag = {
  id: string
  name: string
  slug: string
}

function TagChip({
  tag,
  onEdit,
}: {
  tag: Tag
  onEdit: (t: Tag) => void
}) {
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
      <div className="flex w-full items-center justify-between gap-3 rounded-xl bg-[#fff7f7] px-3.5 py-2.5 ring-1 ring-[#f0d5d5] sm:w-auto">
        <span className="min-w-0 truncate text-xs font-medium text-[#7b4a4a]">
          Удалить «{tag.name}»?
        </span>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#b33a3a] transition hover:bg-[#f9eaea] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Удаление...' : 'Удалить'}
          </button>

          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isPending}
            aria-label="Отмена"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#a5adb7] transition hover:bg-white hover:text-[#596572] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M6 6L14 14M14 6L6 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-2 rounded-xl bg-white p-1.5 pl-3.5 shadow-sm ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={() => onEdit(tag)}
        className="min-w-0 text-left"
      >
        <span className="block truncate text-sm font-medium text-[#28313d] transition group-hover:text-[#28394c]">
          {tag.name}
        </span>

        <span className="mt-0.5 block truncate font-mono text-[10px] text-[#9aa2ad]">
          /{tag.slug}
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          setError(null)
          setConfirming(true)
        }}
        disabled={isPending}
        aria-label={`Удалить тег ${tag.name}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#aeb5be] transition hover:bg-[#fff1f1] hover:text-[#b33a3a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5.5 6.5H14.5M8 6.5V5.25C8 4.56 8.56 4 9.25 4H10.75C11.44 4 12 4.56 12 5.25V6.5M7 8.5V13.5M10 8.5V13.5M13 8.5V13.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M6.5 6.5L7 15C7.05 15.83 7.74 16.5 8.57 16.5H11.43C12.26 16.5 12.95 15.83 13 15L13.5 6.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {error && (
        <div className="absolute mt-20 rounded-lg bg-[#fff7f7] px-2.5 py-1.5 text-[11px] font-medium text-[#b33a3a] ring-1 ring-[#f0d5d5]">
          {error}
        </div>
      )}
    </div>
  )
}

export default function TagList({ tags }: { tags: Tag[] }) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingTag = tags.find((t) => t.id === editingId) ?? null

  return (
    <>
      <div className="space-y-5">
        {/* Stats + action */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M4 5.5C4 4.67 4.67 4 5.5 4H11L16 9L11 14H5.5C4.67 14 4 13.33 4 12.5V5.5Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 7.25H8.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#929aa6]">
                  Всего тегов
                </p>
                <p className="mt-0.5 text-xl font-semibold tracking-tight text-[#28313d]">
                  {tags.length}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCreating(true)}
            className="group flex min-h-[76px] items-center justify-between rounded-2xl bg-[#28394c] px-4 text-left shadow-sm transition hover:bg-[#1e2a38] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M10 4V16M4 10H16"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Добавить тег
                </p>
                <p className="mt-0.5 text-xs text-white/55">
                  Создать новый тег каталога
                </p>
              </div>
            </div>

            <svg
              className="h-4 w-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white/70"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M7.5 4L13.5 10L7.5 16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Tags */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="border-b border-[#e8ebee] px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-[#28313d]">
                  Список тегов
                </h2>
                <p className="mt-0.5 text-xs text-[#929aa6]">
                  Нажмите на тег, чтобы изменить его данные
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[#f1f3f5] px-2.5 py-1 text-[11px] font-semibold text-[#7b8592]">
                {tags.length}
              </span>
            </div>
          </div>

          {tags.length === 0 ? (
            <div className="p-5">
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d9dee4] bg-[#fafbfc] px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef1f4] text-[#8d97a3]">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M4 5.5C4 4.67 4.67 4 5.5 4H11L16 9L11 14H5.5C4.67 14 4 13.33 4 12.5V5.5Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 7.25H8.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p className="mt-4 text-sm font-medium text-[#596572]">
                  Тегов пока нет
                </p>

                <p className="mt-1 max-w-sm text-xs leading-5 text-[#929aa6]">
                  Создайте первый тег, чтобы использовать его для
                  классификации товаров.
                </p>

                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#28394c] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2a38]"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M10 4V16M4 10H16"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  Добавить тег
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex flex-wrap gap-2.5">
                {tags.map((tag) => (
                  <TagChip
                    key={tag.id}
                    tag={tag}
                    onEdit={(t) => setEditingId(t.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {creating && (
        <TagFormModal
          onClose={() => setCreating(false)}
        />
      )}

      {editingTag && (
        <TagFormModal
          tag={editingTag}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  )
}
