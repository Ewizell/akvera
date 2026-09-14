'use client'

import { useState, useTransition } from 'react'
import { listDocuments } from '@/lib/actions/document'

type AttachedDoc = {
  joinId: string
  documentId: string
  title: string
  type: string
  url: string
}

type LibraryDoc = {
  id: string
  title: string
  type: string
  tags: string[]
}

type ActionResult = {
  success: boolean
  item?: AttachedDoc
  error?: string
}

const DOC_TYPES = [
  { value: 'datasheet', label: 'Тех. паспорт' },
  { value: 'certificate', label: 'Сертификат' },
  { value: 'manual', label: 'Инструкция' },
  { value: 'other', label: 'Другое' },
]

const inputCls =
  'h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15'

const secondaryButtonCls =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-sm font-medium text-[#4d5866] ring-1 ring-black/[0.05] transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-50'

const primaryButtonCls =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#28394c] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-50'

function TypePill({ type }: { type: string }) {
  const label =
    DOC_TYPES.find((t) => t.value === type)?.label ?? type

  return (
    <span className="inline-flex shrink-0 items-center rounded-lg bg-[#eef1f4] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#66717e]">
      {label}
    </span>
  )
}

function FileIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 20h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}

function FileField({
  file,
  onChange,
}: {
  file: File | null
  onChange: (file: File | null) => void
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#cfd5dc] bg-white px-3.5 py-2.5 transition hover:border-[#28394c]/40 hover:bg-[#f7f8fa]">
      <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[#28394c]">
        <UploadIcon />
        Выбрать файл
      </span>

      <span className="min-w-0 truncate text-sm text-[#8a939f]">
        {file?.name ?? 'Файл не выбран'}
      </span>

      <input
        type="file"
        onChange={(e) =>
          onChange(e.target.files?.[0] ?? null)
        }
        className="hidden"
      />
    </label>
  )
}

export default function DocumentPicker({
  attached: initialAttached,
  onAttachExisting,
  onUploadNew,
  onDetach,
}: {
  attached: AttachedDoc[]
  onAttachExisting: (
    documentId: string
  ) => Promise<ActionResult>
  onUploadNew: (
    formData: FormData
  ) => Promise<ActionResult>
  onDetach: (
    joinId: string
  ) => Promise<{ success: boolean; error?: string }>
}) {
  const [attached, setAttached] = useState(initialAttached)
  const [tab, setTab] = useState<'library' | 'upload'>(
    'library'
  )
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LibraryDoc[]>([])
  const [isSearching, startSearch] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState('datasheet')
  const [uploadTags, setUploadTags] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(
    null
  )
  const [uploading, setUploading] = useState(false)

  function handleSearch(value: string) {
    setQuery(value)

    startSearch(async () => {
      setResults(await listDocuments(value))
    })
  }

  async function handleAttach(documentId: string) {
    setError(null)

    const result = await onAttachExisting(documentId)

    if (!result.success || !result.item) {
      setError(result.error ?? 'Не удалось прикрепить')
      return
    }

    setAttached((prev) => [...prev, result.item!])
  }

  async function handleUpload() {
    setError(null)

    if (!uploadTitle.trim()) {
      setError('Укажите название')
      return
    }

    if (!uploadFile) {
      setError('Выберите файл')
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.set('title', uploadTitle)
    formData.set('type', uploadType)
    formData.set('tags', uploadTags)
    formData.set('file', uploadFile)

    const result = await onUploadNew(formData)

    setUploading(false)

    if (!result.success || !result.item) {
      setError(result.error ?? 'Ошибка загрузки')
      return
    }

    setAttached((prev) => [...prev, result.item!])
    setUploadTitle('')
    setUploadTags('')
    setUploadFile(null)
  }

  async function handleDetach(joinId: string) {
    setError(null)

    const result = await onDetach(joinId)

    if (!result.success) {
      setError(result.error ?? 'Не удалось убрать')
      return
    }

    setAttached((prev) =>
      prev.filter((d) => d.joinId !== joinId)
    )
  }

  const attachedIds = new Set(
    attached.map((a) => a.documentId)
  )

  const availableResults = results.filter(
    (d) => !attachedIds.has(d.id)
  )

  return (
    <div className="rounded-2xl bg-[#f7f8fa] p-4 ring-1 ring-black/[0.04]">
      {/* Attached documents */}
      <div className="mb-4">
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#7b8592]">
              Прикреплённые документы
            </h4>
            <p className="mt-0.5 text-xs text-[#a1a8b3]">
              Документы, связанные с этим исполнением
            </p>
          </div>

          {attached.length > 0 && (
            <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-[#66717e] ring-1 ring-black/[0.04]">
              {attached.length}
            </span>
          )}
        </div>

        {attached.length === 0 ? (
          <div className="rounded-xl bg-white px-4 py-4 text-center ring-1 ring-black/[0.04]">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f5f7] text-[#8a939f]">
              <FileIcon />
            </div>

            <p className="text-xs text-[#8a939f]">
              Ничего не прикреплено
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {attached.map((doc) => (
              <li
                key={doc.joinId}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-black/[0.04]"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f4f5f7] text-[#66717e]">
                    <FileIcon />
                  </div>

                  <div className="flex min-w-0 items-center gap-2">
                    <TypePill type={doc.type} />

                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 truncate text-sm font-medium text-[#28394c] hover:underline"
                    >
                      {doc.title}
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDetach(doc.joinId)}
                  disabled={uploading}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-[#8a939f] transition hover:bg-[#fff7f7] hover:text-[#b33a3a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CloseIcon />
                  Убрать
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-[#fff7f7] px-3.5 py-3 ring-1 ring-[#f0d5d5]">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f8e8e8] text-[#b33a3a]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.3 3.8L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 3.8a2 2 0 00-3.4 0z" />
            </svg>
          </div>

          <p className="pt-1 text-xs leading-5 text-[#b33a3a]">
            {error}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex rounded-xl bg-[#eef0f3] p-1">
        <button
          type="button"
          onClick={() => setTab('library')}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
            tab === 'library'
              ? 'bg-white text-[#28394c] shadow-sm'
              : 'text-[#7b8592] hover:text-[#28313d]'
          }`}
        >
          Из медиатеки
        </button>

        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
            tab === 'upload'
              ? 'bg-white text-[#28394c] shadow-sm'
              : 'text-[#7b8592] hover:text-[#28313d]'
          }`}
        >
          Загрузить новый
        </button>
      </div>

      {/* Library */}
      {tab === 'library' ? (
        <div>
          <div className="relative mb-3">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa3ae]">
              <SearchIcon />
            </div>

            <input
              type="text"
              placeholder="Поиск по названию или тегу..."
              value={query}
              onChange={(e) =>
                handleSearch(e.target.value)
              }
              className={`${inputCls} pl-10`}
            />
          </div>

          {isSearching && (
            <div className="mb-2 flex items-center gap-2 text-xs text-[#8a939f]">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#d7dbe0] border-t-[#28394c]" />
              Поиск...
            </div>
          )}

          <ul className="max-h-52 space-y-2 overflow-y-auto">
            {availableResults.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-black/[0.04]"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f4f5f7] text-[#66717e]">
                    <FileIcon />
                  </div>

                  <div className="flex min-w-0 items-center gap-2">
                    <TypePill type={doc.type} />

                    <span className="truncate text-sm font-medium text-[#28313d]">
                      {doc.title}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAttach(doc.id)}
                  disabled={uploading}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#28394c] transition hover:bg-[#eef1f4]"
                >
                  Прикрепить
                </button>
              </li>
            ))}

            {query &&
              !isSearching &&
              availableResults.length === 0 && (
                <li className="rounded-xl bg-white px-4 py-5 text-center text-xs text-[#8a939f] ring-1 ring-black/[0.04]">
                  Ничего не найдено
                </li>
              )}
          </ul>
        </div>
      ) : (
        /* Upload */
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
              Название
            </label>

            <input
              value={uploadTitle}
              onChange={(e) =>
                setUploadTitle(e.target.value)
              }
              placeholder="Название документа"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
              Тип документа
            </label>

            <select
              value={uploadType}
              onChange={(e) =>
                setUploadType(e.target.value)
              }
              className={inputCls}
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
              Теги
            </label>

            <input
              value={uploadTags}
              onChange={(e) =>
                setUploadTags(e.target.value)
              }
              placeholder="Теги через запятую"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
              Файл
            </label>

            <FileField
              file={uploadFile}
              onChange={setUploadFile}
            />
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className={`${primaryButtonCls} w-full`}
          >
            <UploadIcon />
            {uploading
              ? 'Загрузка...'
              : 'Загрузить и прикрепить'}
          </button>
        </div>
      )}
    </div>
  )
}
