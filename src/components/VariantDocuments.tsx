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

export default function VariantDocuments({
  variantId,
  documents,
}: {
  variantId: string
  documents: Doc[]
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [fileName, setFileName] = useState<string | null>(null)

  function handleUpload(formData: FormData) {
    startTransition(async () => {
      const result = await addDocument(variantId, formData)

      if (result.success) {
        setError(null)

        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        if (titleInputRef.current) {
          titleInputRef.current.value = ''
        }

        setFileName(null)
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
      <ul className="space-y-2 mb-3">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center justify-between gap-3 text-sm bg-white border border-gray-200 rounded-md pl-3 pr-1.5 py-1.5"
          >
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline min-w-0 truncate"
            >
              {doc.title}{' '}
              <span className="text-gray-400">
                (
                {DOC_TYPES.find((t) => t.value === doc.type)?.label ??
                  doc.type}
                )
              </span>
            </a>

            <button
              type="button"
              onClick={() => handleDelete(doc.id)}
              disabled={isPending}
              aria-label="Удалить документ"
              className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              </svg>
            </button>
          </li>
        ))}

        {documents.length === 0 && (
          <p className="text-sm text-gray-400">
            Документов пока нет
          </p>
        )}
      </ul>

      <form
        ref={formRef}
        action={handleUpload}
        className="flex flex-wrap items-center gap-2 text-sm"
      >
        <input
          ref={titleInputRef}
          name="title"
          placeholder="Название документа"
          required
          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 bg-white"
        />

        <select
          name="type"
          defaultValue="datasheet"
          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 bg-white"
        >
          {DOC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept=".pdf,.doc,.docx"
          required
          className="hidden"
          onChange={(e) => {
            setFileName(e.target.files?.[0]?.name ?? null)
            formRef.current?.requestSubmit()
          }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-white border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>

          {isPending ? 'Загрузка...' : 'Прикрепить файл'}
        </button>

        {fileName && !isPending && (
          <span className="text-xs text-gray-400">
            {fileName}
          </span>
        )}
      </form>

      {error && (
        <p className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}