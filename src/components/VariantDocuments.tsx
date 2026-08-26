'use client'

import { useState, useTransition, useRef } from 'react'
import { addDocument, deleteDocument } from '@/lib/actions/productDocument'

type Doc = {
  id: string
  title: string
  type: string
  url: string
}

const DOC_TYPES = [
  { value: 'datasheet', label: 'Технический паспорт' },
  { value: 'certificate', label: 'Сертификат' },
  { value: 'manual', label: 'Инструкция' },
]

export default function VariantDocuments({ variantId, documents }: { variantId: string; documents: Doc[] }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  function handleUpload(formData: FormData) {
    startTransition(async () => {
      const result = await addDocument(variantId, formData)
      if (result.success) {
        setError(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (titleInputRef.current) titleInputRef.current.value = ''
      } else {
        setError(result.error ?? 'Ошибка загрузки')
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteDocument(id)
      if (!result.success) {
        setError(result.error ?? 'Ошибка удаления')
      }
    })
  }

  return (
    <div>
      <ul className="space-y-1 mb-2">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between text-xs border rounded px-2 py-1">
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {doc.title} ({DOC_TYPES.find((t) => t.value === doc.type)?.label ?? doc.type})
            </a>
            <button
              type="button"
              onClick={() => handleDelete(doc.id)}
              disabled={isPending}
              className="text-red-600 hover:underline ml-2"
            >
              Удалить
            </button>
          </li>
        ))}
        {documents.length === 0 && <p className="text-xs text-gray-400">Документов пока нет</p>}
      </ul>

      <form action={handleUpload} className="flex flex-wrap items-center gap-2 text-xs">
        <input ref={titleInputRef} name="title" placeholder="Название документа" required className="border rounded px-2 py-1" />
        <select name="type" defaultValue="datasheet" className="border rounded px-2 py-1">
          {DOC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input ref={fileInputRef} type="file" name="file" accept=".pdf,.doc,.docx" required />
        <button type="submit" disabled={isPending} className="text-blue-600 hover:underline disabled:opacity-50">
          {isPending ? 'Загрузка...' : 'Загрузить'}
        </button>
      </form>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}