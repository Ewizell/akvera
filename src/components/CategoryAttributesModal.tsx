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

const inputCls =
  'border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const cardCls = 'bg-white border border-gray-200 rounded-lg p-4'

function AttributeFormFields({ attribute }: { attribute?: Attribute }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        name="key"
        defaultValue={attribute?.key}
        placeholder="Ключ (power_kw)"
        required
        className={inputCls}
      />
      <input
        name="label"
        defaultValue={attribute?.label}
        placeholder="Название (Мощность)"
        required
        className={inputCls}
      />
      <select
        name="fieldType"
        defaultValue={attribute?.fieldType ?? 'number'}
        className={inputCls}
      >
        {FIELD_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        name="unit"
        defaultValue={attribute?.unit ?? ''}
        placeholder="Единица (кВт)"
        className={inputCls}
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
      <li className={cardCls}>
        <form action={handleSave}>
          <AttributeFormFields attribute={attribute} />
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          <div className="flex gap-3 mt-3">
            <button
              type="submit"
              disabled={isPending}
              className="text-sm text-blue-600 hover:underline"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-sm text-gray-500 hover:underline"
            >
              Отмена
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
      <span className="min-w-0">
        <span className="font-medium text-gray-900">{attribute.label}</span>{' '}
        <span className="text-gray-400">
          ({attribute.key}, {attribute.fieldType}
          {attribute.unit ? `, ${attribute.unit}` : ''})
        </span>
      </span>
      <div className="flex gap-3 shrink-0">
        <button onClick={() => setEditing(true)} className="text-blue-600 hover:underline text-sm">
          Изменить
        </button>
        <button onClick={handleDelete} disabled={isPending} className="text-red-600 hover:underline text-sm">
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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 max-w-xl w-full mx-4 max-h-[80vh] overflow-y-auto text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-1">Атрибуты категории</h2>
        <p className="text-sm text-gray-500 mb-4">{categoryName}</p>

        <ul className="space-y-2 mb-6">
          {attributes.length === 0 && (
            <li className="text-sm text-gray-400">Атрибутов пока нет</li>
          )}
          {attributes.map((attr) => (
            <AttributeRow key={attr.id} attribute={attr} />
          ))}
        </ul>

        <form id="add-attr-form" action={handleAdd} className={`${cardCls} bg-gray-50`}>
          <p className="text-sm font-medium text-gray-700 mb-3">Добавить атрибут</p>
          <AttributeFormFields />
          {addError && <p className="text-xs text-red-600 mt-2">{addError}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="mt-3 bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
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