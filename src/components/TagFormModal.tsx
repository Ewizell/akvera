'use client'

import { useEffect, useState, useTransition } from 'react'
import { createTag, updateTag } from '@/lib/actions/tag'
import { slugify } from '@/lib/slugify'

type Tag = {
  id: string
  name: string
  slug: string
}

const inputCls =
  'h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15 disabled:cursor-not-allowed disabled:opacity-60'

const labelCls =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]'

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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isPending) {
        onClose()
      }
    }

    globalThis.document.addEventListener('keydown', handleKeyDown)

    return () => {
      globalThis.document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, isPending])

  function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = isEdit
        ? await updateTag(tag.id, formData)
        : await createTag(formData)

      if (result.success) {
        onClose()
      } else {
        setError(result.error ?? 'Ошибка сохранения')
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18212b]/45 px-4 py-6 backdrop-blur-[3px]"
      onClick={() => {
        if (!isPending) onClose()
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-[#f7f8fa] text-[#28313d] shadow-[0_24px_70px_rgba(24,33,43,0.18)] ring-1 ring-black/[0.06]"
        onClick={(event) => event.stopPropagation()}
      >
        <form action={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Header */}
          <div className="shrink-0 border-b border-[#e4e7eb] bg-white px-5 py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
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
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#929aa6]">
                    Каталог
                  </p>

                  <h2 className="mt-0.5 text-base font-semibold text-[#28313d]">
                    {isEdit ? 'Редактировать тег' : 'Новый тег'}
                  </h2>

                  <p className="mt-0.5 text-xs text-[#929aa6]">
                    {isEdit
                      ? 'Изменение данных существующего тега'
                      : 'Добавление нового тега в каталог'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                aria-label="Закрыть"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#89929d] transition hover:bg-[#f3f5f7] hover:text-[#28313d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 5L15 15M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                  <svg
                    className="h-4 w-4"
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
                  <h3 className="text-sm font-semibold text-[#28313d]">
                    Данные тега
                  </h3>

                  <p className="mt-0.5 text-xs text-[#929aa6]">
                    Название и адрес тега в каталоге
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="tag-name" className={labelCls}>
                    Название
                  </label>

                  <input
                    id="tag-name"
                    name="name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value)

                      if (!slugEdited) {
                        setSlug(slugify(event.target.value))
                      }
                    }}
                    placeholder="Например, Популярное"
                    required
                    disabled={isPending}
                    className={inputCls}
                  />

                  <p className="mt-1.5 text-[11px] text-[#929aa6]">
                    Название, которое будет отображаться в интерфейсе каталога.
                  </p>
                </div>

                {/* Slug */}
                <div>
                  <label htmlFor="tag-slug" className={labelCls}>
                    Slug
                  </label>

                  <div className="flex h-11 overflow-hidden rounded-xl bg-[#f4f5f7] ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-2 focus-within:ring-[#28394c]/15">
                    <div className="flex shrink-0 items-center border-r border-[#e3e6ea] px-3 text-xs font-medium text-[#929aa6]">
                      /tags/
                    </div>

                    <input
                      id="tag-slug"
                      name="slug"
                      value={slug}
                      onChange={(event) => {
                        setSlug(event.target.value)
                        setSlugEdited(true)
                      }}
                      placeholder="popular"
                      required
                      disabled={isPending}
                      className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-[#28313d] outline-none placeholder:text-[#a1a8b3]"
                    />
                  </div>

                  <p className="mt-1.5 text-[11px] text-[#929aa6]">
                    Используется в URL и фильтрации каталога.
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#fff7f7] px-3.5 py-3 ring-1 ring-[#f0d5d5]">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f9eaea] text-[#b33a3a]">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M10 6.5V10.5M10 13.5H10.01"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8.75 3.9L2.9 14.1C2.37 15.02 3.04 16.15 4.1 16.15H15.9C16.96 16.15 17.63 15.02 17.1 14.1L11.25 3.9C10.72 2.98 9.28 2.98 8.75 3.9Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#a83232]">
                    Ошибка сохранения
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-[#b33a3a]">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[#e4e7eb] bg-white px-5 py-3.5">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="h-10 rounded-xl border border-[#dfe3e8] bg-white px-4 text-xs font-semibold text-[#596572] shadow-sm transition hover:border-[#cbd1d8] hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Отмена
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#28394c] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {isPending
                  ? 'Сохранение...'
                  : isEdit
                    ? 'Сохранить изменения'
                    : 'Создать тег'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

