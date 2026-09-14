'use client'

import { useEffect, useState } from 'react'
import { createDocument, updateDocument } from '@/lib/actions/document'

function FileField({
  name,
  required,
}: {
  name: string
  required?: boolean
}) {
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#d7dce2] bg-[#fafbfc] px-3.5 py-3 transition hover:border-[#9ca8b5] hover:bg-[#f4f5f7]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef1f4] text-[#596572] transition group-hover:bg-[#e6e9ed]">
        <svg
          className="h-4.5 w-4.5"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M10 3.5V12.5M10 12.5L6.75 9.25M10 12.5L13.25 9.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 13.5V15.5C4 16.33 4.67 17 5.5 17H14.5C15.33 17 16 16.33 16 15.5V13.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <span className="min-w-0">
        <span className="block text-xs font-semibold text-[#596572]">
          Выбрать файл
        </span>

        <span className="mt-0.5 block truncate text-[11px] text-[#929aa6]">
          {fileName ?? 'Файл не выбран'}
        </span>
      </span>

      <input
        name={name}
        type="file"
        required={required}
        onChange={(event) =>
          setFileName(event.target.files?.[0]?.name ?? null)
        }
        className="hidden"
      />
    </label>
  )
}

type DocumentRow = {
  id: string
  title: string
  type: string
  tags: string[]
}

const DOC_TYPES = [
  { value: 'datasheet', label: 'Технический паспорт' },
  { value: 'certificate', label: 'Сертификат' },
  { value: 'manual', label: 'Инструкция' },
  { value: 'other', label: 'Другое' },
]

const inputCls =
  'h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15 disabled:cursor-not-allowed disabled:opacity-60'

const labelCls =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]'

export default function DocumentFormModal({
  document: documentItem,
  onClose,
  onSaved,
}: {
  document: DocumentRow | null
  onClose: () => void
  onSaved: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) {
        onClose()
      }
    }

    // Используем глобальный DOM document
    globalThis.document.addEventListener('keydown', handleKeyDown)

    return () => {
      globalThis.document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, saving])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const result = documentItem
      ? await updateDocument(documentItem.id, formData)
      : await createDocument(formData)

    setSaving(false)

    if (!result.success) {
      setError(result.error ?? 'Ошибка сохранения')
      return
    }

    onSaved()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18212b]/45 px-4 py-6 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl bg-[#f7f8fa] text-[#28313d] shadow-[0_24px_70px_rgba(24,33,43,0.18)] ring-1 ring-black/[0.06]"
        onClick={(event) => event.stopPropagation()}
      >
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
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
                      d="M6.5 3.5H11.5L15 7V16.5H6.5C5.67 16.5 5 15.83 5 15V5C5 4.17 5.67 3.5 6.5 3.5Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11 3.75V7.5H14.75"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7.5 10H12.5M7.5 12.5H11"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#929aa6]">
                    Медиатека
                  </p>

                  <h2 className="mt-0.5 text-base font-semibold text-[#28313d]">
                    {documentItem
                      ? 'Изменить документ'
                      : 'Загрузить документ'}
                  </h2>

                  <p className="mt-0.5 text-xs text-[#929aa6]">
                    {documentItem
                      ? 'Редактирование данных документа'
                      : 'Добавление документа в медиатеку'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
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
            <div className="space-y-5">
              {/* Main information */}
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M4.5 5.5C4.5 4.67 5.17 4 6 4H11.5L15.5 8V14.5C15.5 15.33 14.83 16 14 16H6C5.17 16 4.5 15.33 4.5 14.5V5.5Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11.5 4V8H15.25"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7.5 10.5H12.5M7.5 13H11"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#28313d]">
                      Основная информация
                    </h3>

                    <p className="mt-0.5 text-xs text-[#929aa6]">
                      Название, тип и классификация документа
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label
                      htmlFor="document-title"
                      className={labelCls}
                    >
                      Название
                    </label>

                    <input
                      id="document-title"
                      name="title"
                      defaultValue={documentItem?.title}
                      placeholder="Например, Технический паспорт насоса"
                      required
                      disabled={saving}
                      className={inputCls}
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label
                      htmlFor="document-type"
                      className={labelCls}
                    >
                      Тип
                    </label>

                    <div className="relative">
                      <select
                        id="document-type"
                        name="type"
                        defaultValue={
                          documentItem?.type ?? 'datasheet'
                        }
                        disabled={saving}
                        className={`${inputCls} appearance-none pr-10`}
                      >
                        {DOC_TYPES.map((type) => (
                          <option
                            key={type.value}
                            value={type.value}
                          >
                            {type.label}
                          </option>
                        ))}
                      </select>

                      <svg
                        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89929d]"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M6 8L10 12L14 8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label
                      htmlFor="document-tags"
                      className={labelCls}
                    >
                      Теги
                    </label>

                    <input
                      id="document-tags"
                      name="tags"
                      defaultValue={documentItem?.tags.join(', ')}
                      placeholder="котлы, паспорт, 2024"
                      disabled={saving}
                      className={inputCls}
                    />

                    <p className="mt-1.5 text-[11px] text-[#929aa6]">
                      Укажите несколько тегов через запятую для
                      удобного поиска.
                    </p>
                  </div>

                  {/* File */}
                  {!documentItem && (
                    <div>
                      <label className={labelCls}>Файл</label>

                      <FileField name="file" required />

                      <p className="mt-1.5 text-[11px] text-[#929aa6]">
                        Выберите файл документа для загрузки в
                        медиатеку.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Existing document */}
              {documentItem && (
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef1f4] text-[#596572]">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M6.5 3.5H11.5L15 7V16.5H6.5C5.67 16.5 5 15.83 5 15V5C5 4.17 5.67 3.5 6.5 3.5Z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M11 3.75V7.5H14.75"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
                        Текущий документ
                      </p>

                      <p className="mt-0.5 truncate text-sm font-medium text-[#28313d]">
                        {documentItem.title}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-[#f4f5f7] px-3.5 py-3">
                    <p className="text-xs text-[#7b8592]">
                      При редактировании изменяются только данные
                      документа. Файл остаётся текущим.
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-[#fff7f7] px-3.5 py-3 ring-1 ring-[#f0d5d5]">
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
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[#e4e7eb] bg-white px-5 py-3.5">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="h-10 rounded-xl border border-[#dfe3e8] bg-white px-4 text-xs font-semibold text-[#596572] shadow-sm transition hover:border-[#cbd1d8] hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Отмена
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#28394c] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {saving
                  ? 'Сохранение...'
                  : documentItem
                    ? 'Сохранить изменения'
                    : 'Загрузить документ'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
