'use client'

import { useState, useTransition } from 'react'
import { listDocuments, deleteDocument } from '@/lib/actions/document'
import DocumentFormModal from './DocumentFormModal'

type DocumentRow = {
  id: string
  title: string
  type: string
  url: string
  tags: string[]
  createdAt: Date
  _count: { products: number; variants: number }
}

const TYPE_LABELS: Record<string, string> = {
  datasheet: 'Тех. паспорт',
  certificate: 'Сертификат',
  manual: 'Инструкция',
  other: 'Другое',
}

const labelCls =
  'text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]'

function TypePill({ type }: { type: string }) {
  const label = TYPE_LABELS[type] ?? type

  return (
    <span className="inline-flex items-center rounded-lg bg-[#eef1f4] px-2.5 py-1 text-[11px] font-semibold text-[#596572] ring-1 ring-black/[0.03]">
      {label}
    </span>
  )
}

function UsageBadge({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="inline-flex items-center rounded-lg bg-[#f4f5f7] px-2.5 py-1 text-[11px] font-medium text-[#929aa6]">
        Не используется
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f1f6f3] px-2.5 py-1 text-[11px] font-semibold text-[#4f7561] ring-1 ring-[#dce9e1]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#6d987d]" />
      {count}
    </span>
  )
}

function DocumentIcon() {
  return (
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
        d="M7.5 10H12.5M7.5 12.5H12.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
    >
      <circle
        cx="8.75"
        cy="8.75"
        r="4.75"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12.25 12.25L16 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M10 13.5V4.5M10 4.5L6.75 7.75M10 4.5L13.25 7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 11.5V15C4.5 15.83 5.17 16.5 6 16.5H14C14.83 16.5 15.5 15.83 15.5 15V11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M11.5 5.25L14.75 8.5M5 15L5.65 11.75L13.6 3.8C14.15 3.25 15.05 3.25 15.6 3.8L16.2 4.4C16.75 4.95 16.75 5.85 16.2 6.4L8.25 14.35L5 15Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M4.5 6H15.5M8 6V4.5H12V6M6 6.5L6.5 15.5H13.5L14 6.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function DocumentsList({
  initialDocuments,
}: {
  initialDocuments: DocumentRow[]
}) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<DocumentRow | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSearch(value: string) {
    setQuery(value)

    startTransition(async () => {
      setDocuments(await listDocuments(value))
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить документ?')) return

    setError(null)

    const result = await deleteDocument(id)

    if (!result.success) {
      setError(result.error ?? 'Не удалось удалить')
      return
    }

    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  function handleSaved() {
    setEditing(null)

    startTransition(async () => {
      setDocuments(await listDocuments(query))
    })
  }

  const totalUsage = documents.reduce(
    (sum, document) =>
      sum + document._count.products + document._count.variants,
    0,
  )

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
          <div className="flex items-center justify-between">
            <span className={labelCls}>Документы</span>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef1f4] text-[#596572]">
              <DocumentIcon />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#28313d]">
            {documents.length}
          </p>

          <p className="mt-1 text-xs text-[#929aa6]">
            Доступно в медиатеке
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
          <div className="flex items-center justify-between">
            <span className={labelCls}>Использований</span>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f6f3] text-[#5d806b]">
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M6 10L8.5 12.5L14 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 3.5C13.59 3.5 16.5 6.41 16.5 10C16.5 13.59 13.59 16.5 10 16.5C6.41 16.5 3.5 13.59 3.5 10C3.5 8.81 3.82 7.69 4.38 6.72"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#28313d]">
            {totalUsage}
          </p>

          <p className="mt-1 text-xs text-[#929aa6]">
            Связей с товарами и исполнениями
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
          <div className="flex items-center justify-between">
            <span className={labelCls}>Статус</span>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef1f4] text-[#596572]">
              <span className="h-2 w-2 rounded-full bg-[#6d987d]" />
            </div>
          </div>

          <p className="mt-3 text-sm font-semibold text-[#28313d]">
            Медиатека активна
          </p>

          <p className="mt-1 text-xs text-[#929aa6]">
            Документы доступны для повторного использования
          </p>
        </div>
      </div>

      {/* Main card */}
      <section className="overflow-hidden rounded-2xl bg-[#f7f8fa] shadow-sm ring-1 ring-black/[0.04]">
        {/* Toolbar */}
        <div className="border-b border-[#e4e7eb] bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#28313d]">
                Все документы
              </h2>

              <p className="mt-0.5 text-xs text-[#929aa6]">
                Управление технической документацией каталога
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Search */}
              <div className="relative sm:w-[300px]">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#929aa6]">
                  <SearchIcon />
                </span>

                <input
                  type="text"
                  placeholder="Поиск по названию или тегу..."
                  value={query}
                  onChange={(event) => handleSearch(event.target.value)}
                  className="h-10 w-full rounded-xl border-0 bg-[#f4f5f7] pl-9 pr-3 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setEditing('new')
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#28394c] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2a38]"
              >
                <UploadIcon />
                Загрузить документ
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        {(error || isPending) && (
          <div className="border-b border-[#e4e7eb] bg-[#fafbfc] px-4 py-3">
            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-[#fff7f7] px-3.5 py-3 ring-1 ring-[#f0d5d5]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f9eaea] text-[#b33a3a]">
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

                <div>
                  <p className="text-xs font-semibold text-[#a83232]">
                    Ошибка
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-[#b33a3a]">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {isPending && !error && (
              <div className="flex items-center gap-2 text-xs text-[#929aa6]">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#cfd4da] border-t-[#28394c]" />
                Обновление...
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        <div className="p-4">
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => {
                const usageCount =
                  doc._count.products + doc._count.variants

                return (
                  <div
                    key={doc.id}
                    className="rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-black/[0.04] transition hover:ring-black/[0.07]"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                      {/* Document info */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
                          <DocumentIcon />
                        </div>

                        <div className="min-w-0">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-sm font-semibold text-[#28394c] transition hover:text-[#1e2a38] hover:underline"
                          >
                            {doc.title}
                          </a>

                          <p className="mt-0.5 truncate text-[11px] text-[#a1a8b3]">
                            Документ медиатеки
                          </p>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="xl:w-[130px]">
                        <p className={`${labelCls} mb-1.5`}>
                          Тип
                        </p>
                        <TypePill type={doc.type} />
                      </div>

                      {/* Tags */}
                      <div className="min-w-0 xl:w-[250px]">
                        <p className={`${labelCls} mb-1.5`}>
                          Теги
                        </p>

                        {doc.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {doc.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="max-w-[120px] truncate rounded-lg bg-[#f4f5f7] px-2 py-1 text-[11px] font-medium text-[#697482]"
                              >
                                {tag}
                              </span>
                            ))}

                            {doc.tags.length > 4 && (
                              <span className="rounded-lg bg-[#f4f5f7] px-2 py-1 text-[11px] font-medium text-[#929aa6]">
                                +{doc.tags.length - 4}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[#a1a8b3]">
                            —
                          </span>
                        )}
                      </div>

                      {/* Usage */}
                      <div className="xl:w-[130px]">
                        <p className={`${labelCls} mb-1.5`}>
                          Используется
                        </p>

                        <UsageBadge count={usageCount} />
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-2 border-t border-[#eef0f2] pt-3 xl:border-0 xl:pt-0">
                        <button
                          type="button"
                          onClick={() => {
                            setError(null)
                            setEditing(doc)
                          }}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#dfe3e8] bg-white px-3 text-xs font-semibold text-[#596572] shadow-sm transition hover:border-[#cbd1d8] hover:bg-[#f4f5f7] hover:text-[#28313d]"
                        >
                          <EditIcon />
                          Изменить
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#f0d5d5] bg-[#fff7f7] px-3 text-xs font-semibold text-[#b33a3a] transition hover:bg-[#fceeee]"
                        >
                          <TrashIcon />
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dfe3e8] bg-white px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f3f5] text-[#89929d]">
                <DocumentIcon />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#596572]">
                Документы не найдены
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-[#929aa6]">
                {query
                  ? 'Попробуйте изменить поисковый запрос или очистить поле поиска.'
                  : 'Здесь будут храниться технические паспорта, сертификаты и инструкции.'}
              </p>

              {!query && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setEditing('new')
                  }}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-[#28394c] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2a38]"
                >
                  <UploadIcon />
                  Загрузить первый документ
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {editing && (
        <DocumentFormModal
          document={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
