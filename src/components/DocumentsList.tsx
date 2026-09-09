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

function TypePill({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

function UsageBadge({ count }: { count: number }) {
  if (count === 0) {
    return <span className="text-xs text-slate-400">не используется</span>
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
      {count}
    </span>
  )
}

export default function DocumentsList({ initialDocuments }: { initialDocuments: DocumentRow[] }) {
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

  return (
    <div>
      <section className="border border-slate-200 rounded-lg bg-white p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <input
            type="text"
            placeholder="Поиск по названию или тегу..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 w-80 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => setEditing('new')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            + Загрузить документ
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {isPending && <p className="text-xs text-slate-400 mb-2">Обновление...</p>}

        <div className="border border-slate-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-3 py-2">Название</th>
                <th className="text-left font-medium px-3 py-2">Тип</th>
                <th className="text-left font-medium px-3 py-2">Теги</th>
                <th className="text-left font-medium px-3 py-2">Используется</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-3 py-2.5">
                    <a href={doc.url} target="_blank" className="text-blue-600 hover:underline font-medium">
                      {doc.title}
                    </a>
                  </td>
                  <td className="px-3 py-2.5">
                    <TypePill type={doc.type} />
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">{doc.tags.join(', ') || '—'}</td>
                  <td className="px-3 py-2.5">
                    <UsageBadge count={doc._count.products + doc._count.variants} />
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(doc)} className="text-blue-600 hover:underline mr-3">
                      Изменить
                    </button>
                    <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:underline">
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Ничего не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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