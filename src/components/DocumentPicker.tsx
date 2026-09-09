'use client'

import { useState, useTransition } from 'react'
import { listDocuments } from '@/lib/actions/document'

type AttachedDoc = { joinId: string; documentId: string; title: string; type: string; url: string }
type LibraryDoc = { id: string; title: string; type: string; tags: string[] }
type ActionResult = { success: boolean; item?: AttachedDoc; error?: string }

const DOC_TYPES = [
  { value: 'datasheet', label: 'Тех. паспорт' },
  { value: 'certificate', label: 'Сертификат' },
  { value: 'manual', label: 'Инструкция' },
  { value: 'other', label: 'Другое' },
]

const inputCls =
  'w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'

function TypePill({ type }: { type: string }) {
  const label = DOC_TYPES.find((t) => t.value === type)?.label ?? type
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 shrink-0">
      {label}
    </span>
  )
}

function FileField({ file, onChange }: { file: File | null; onChange: (file: File | null) => void }) {
  return (
    <label className="flex items-center gap-3 border border-dashed border-slate-300 rounded-md px-3 py-2.5 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
          <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        </svg>
        Выбрать файл
      </span>
      <span className="text-sm text-slate-500 truncate">{file?.name ?? 'Файл не выбран'}</span>
      <input type="file" onChange={(e) => onChange(e.target.files?.[0] ?? null)} className="hidden" />
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
  onAttachExisting: (documentId: string) => Promise<ActionResult>
  onUploadNew: (formData: FormData) => Promise<ActionResult>
  onDetach: (joinId: string) => Promise<{ success: boolean; error?: string }>
}) {
  const [attached, setAttached] = useState(initialAttached)
  const [tab, setTab] = useState<'library' | 'upload'>('library')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LibraryDoc[]>([])
  const [isSearching, startSearch] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState('datasheet')
  const [uploadTags, setUploadTags] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
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
    setAttached((prev) => prev.filter((d) => d.joinId !== joinId))
  }

  const attachedIds = new Set(attached.map((a) => a.documentId))

  return (
    <div className="border border-slate-200 rounded-lg bg-white p-4">
      <div className="mb-3">
        {attached.length === 0 && <p className="text-sm text-slate-400">Ничего не прикреплено</p>}
        <ul className="space-y-1.5">
          {attached.map((doc) => (
            <li
              key={doc.joinId}
              className="flex items-center justify-between gap-3 text-sm bg-slate-50 border border-slate-100 rounded-md px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <TypePill type={doc.type} />
                <a href={doc.url} target="_blank" className="text-blue-600 hover:underline truncate">
                  {doc.title}
                </a>
              </div>
              <button type="button" onClick={() => handleDetach(doc.joinId)} className="text-red-600 hover:underline shrink-0">
                Убрать
              </button>
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{error}</p>
      )}

      <div className="flex gap-1 border-b border-slate-200 mb-3">
        <button
          type="button"
          onClick={() => setTab('library')}
          className={`px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
            tab === 'library' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Из медиатеки
        </button>
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
            tab === 'upload' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Загрузить новый
        </button>
      </div>

      {tab === 'library' ? (
        <div>
          <div className="relative mb-2">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Поиск по названию или тегу..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className={`${inputCls} pl-9`}
            />
          </div>
          {isSearching && <p className="text-xs text-slate-400 mb-2">Поиск...</p>}
          <ul className="max-h-48 overflow-y-auto space-y-1.5">
            {results
              .filter((d) => !attachedIds.has(d.id))
              .map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-3 text-sm bg-slate-50 border border-slate-100 rounded-md px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TypePill type={doc.type} />
                    <span className="text-slate-900 truncate">{doc.title}</span>
                  </div>
                  <button type="button" onClick={() => handleAttach(doc.id)} className="text-blue-600 hover:underline shrink-0">
                    Прикрепить
                  </button>
                </li>
              ))}
            {query && !isSearching && results.filter((d) => !attachedIds.has(d.id)).length === 0 && (
              <li className="text-sm text-slate-400 text-center py-3">Ничего не найдено</li>
            )}
          </ul>
        </div>
      ) : (
        <div className="space-y-2.5">
          <input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Название" className={inputCls} />
          <select value={uploadType} onChange={(e) => setUploadType(e.target.value)} className={inputCls}>
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input value={uploadTags} onChange={(e) => setUploadTags(e.target.value)} placeholder="Теги через запятую" className={inputCls} />
          <FileField file={uploadFile} onChange={setUploadFile} />
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Загрузка...' : 'Загрузить и прикрепить'}
          </button>
        </div>
      )}
    </div>
  )
}