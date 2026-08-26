'use client'

import { useState, useTransition } from 'react'
import {
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from '@/lib/actions/categoryAttribute'

type Attribute = {
  id: string
  key: string
  label: string
  fieldType: string
  unit: string | null
}

const FIELD_TYPES = [
  { value: 'number', label: 'Число' },
  { value: 'string', label: 'Текст' },
  { value: 'select', label: 'Список (выбор)' },
  { value: 'boolean', label: 'Да/Нет' },
]

function AttributeFormFields({ attribute }: { attribute?: Attribute }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <input
        name="key"
        defaultValue={attribute?.key}
        placeholder="Ключ (power_kw)"
        required
        className="border rounded px-2 py-1 text-gray-400 text-sm"
      />
      <input
        name="label"
        defaultValue={attribute?.label}
        placeholder="Название (Мощность)"
        required
        className="border rounded px-2 py-1 text-gray-400 text-sm"
      />
      <select
        name="fieldType"
        defaultValue={attribute?.fieldType ?? 'number'}
        className="border rounded px-2 py-1 text-gray-400 text-sm"
      >
        {FIELD_TYPES.map((t) => (
          <option className="text-gray-400" key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        name="unit"
        defaultValue={attribute?.unit ?? ''}
        placeholder="Единица (кВт)"
        className="border rounded px-2 py-1 text-gray-400 text-sm"
      />
    </div>
  )
}

function AttributeRow({ attribute }: { attribute: Attribute }) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateAttribute(attribute.id, formData)
      if (result.success) {
        setEditing(false)
        setError(null)
      } else {
        setError(result.error ?? 'Ошибка сохранения')
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteAttribute(attribute.id)
    })
  }

  if (editing) {
    return (
      <li className="border rounded p-2 space-y-2">
        <form action={handleSave}>
          <AttributeFormFields attribute={attribute} />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={isPending}
              className="text-xs text-blue-600 hover:underline"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-gray-500 hover:underline"
            >
              Отмена
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="border rounded p-2 flex items-center justify-between text-sm">
      <span>
        <strong>{attribute.label}</strong>{' '}
        <span className="text-gray-500">
          ({attribute.key}, {attribute.fieldType}
          {attribute.unit ? `, ${attribute.unit}` : ''})
        </span>
      </span>
      <div className="flex gap-2">
        <button onClick={() => setEditing(true)} className="text-blue-600 hover:underline text-xs">
          Изменить
        </button>
        <button onClick={handleDelete} disabled={isPending} className="text-red-600 hover:underline text-xs">
          Удалить
        </button>
      </div>
    </li>
  )
}

export default function CategoryAttributesModal({
  categoryId,
  categoryName,
  attributes,
  onClose,
}: {
  categoryId: string
  categoryName: string
  attributes: Attribute[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [addError, setAddError] = useState<string | null>(null)

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await createAttribute(categoryId, formData)
      if (result.success) {
        setAddError(null)
        ;(document.getElementById('add-attr-form') as HTMLFormElement)?.reset()
      } else {
        setAddError(result.error ?? 'Ошибка добавления')
      }
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-1">Атрибуты категории</h2>
        <p className="text-sm text-gray-500 mb-4">{categoryName}</p>

        <ul className="space-y-2 mb-6">
          {attributes.length === 0 && (
            <li className="text-sm text-gray-400">Атрибутов пока нет</li>
          )}
          {attributes.map((attr) => (
            <AttributeRow key={attr.id} attribute={attr} />
          ))}
        </ul>

        <form id="add-attr-form" action={handleAdd} className="border-t pt-4">
          <p className="text-sm text-gray-400 font-medium mb-2">Добавить атрибут</p>
          <AttributeFormFields />
          {addError && <p className="text-xs text-red-600 mt-1">{addError}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="mt-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Добавление...' : '+ Добавить'}
          </button>
        </form>

        <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:underline">
          Закрыть
        </button>
      </div>
    </div>
  )
}