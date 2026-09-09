'use client'

import { useState } from 'react'
import { createDocument, updateDocument } from '@/lib/actions/document'

function FileField({ name, required }: { name: string; required?: boolean }) {
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <label className="flex items-center gap-3 border border-dashed border-slate-300 rounded-md px-3 py-2.5 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
          <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        </svg>
        Выбрать файл
      </span>
      <span className="text-sm text-slate-500 truncate">{fileName ?? 'Файл не выбран'}</span>
      <input
        name={name}
        type="file"
        required={required}
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        className="hidden"
      />
    </label>
  )
}

type DocumentRow = { id: string; title: string; type: string; tags: string[] }

const DOC_TYPES = [
  { value: 'datasheet', label: 'Технический паспорт' },
  { value: 'certificate', label: 'Сертификат' },
  { value: 'manual', label: 'Инструкция' },
  { value: 'other', label: 'Другое' },
]

export default function DocumentFormModal({
  document,
  onClose,
  onSaved,
}: {
  document: DocumentRow | null
  onClose: () => void
  onSaved: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = document
      ? await updateDocument(document.id, formData)
      : await createDocument(formData)

    setSaving(false)
    if (!result.success) {
      setError(result.error ?? 'Ошибка сохранения')
      return
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[480px] border border-slate-200">
        <h2 className="font-medium text-slate-900 mb-4">
          {document ? 'Изменить документ' : 'Загрузить документ'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Название</label>
            <input
              name="title"
              defaultValue={document?.title}
              required
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Тип</label>
            <select
              name="type"
              defaultValue={document?.type ?? 'datasheet'}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900"
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Теги (через запятую)</label>
            <input
              name="tags"
              defaultValue={document?.tags.join(', ')}
              placeholder="котлы, паспорт, 2024"
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {!document && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Файл</label>
              <FileField name="file" required />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-slate-300 text-slate-700 hover:border-slate-400"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}