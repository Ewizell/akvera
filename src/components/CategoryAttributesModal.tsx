'use client'

import { useEffect, useState, useTransition } from 'react'
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
  { value: 'select', label: 'Список' },
  { value: 'boolean', label: 'Да / Нет' },
]

const inputCls =
  'h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15'

const labelCls =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]'

function FieldTypeLabel({ value }: { value: string }) {
  const type = FIELD_TYPES.find((item) => item.value === value)

  return (
    <span className="inline-flex items-center rounded-lg bg-[#f1f3f5] px-2 py-1 text-[10px] font-semibold text-[#687382]">
      {type?.label ?? value}
    </span>
  )
}

function AttributeFormFields({
  attribute,
}: {
  attribute?: Attribute
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className={labelCls}>Ключ</label>

        <input
          name="key"
          defaultValue={attribute?.key}
          placeholder="power_kw"
          required
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Название</label>

        <input
          name="label"
          defaultValue={attribute?.label}
          placeholder="Мощность"
          required
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Тип поля</label>

        <div className="relative">
          <select
            name="fieldType"
            defaultValue={attribute?.fieldType ?? 'number'}
            className={`${inputCls} appearance-none pr-10`}
          >
            {FIELD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
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
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div>
        <label className={labelCls}>Единица измерения</label>

        <input
          name="unit"
          defaultValue={attribute?.unit ?? ''}
          placeholder="кВт"
          className={inputCls}
        />
      </div>
    </div>
  )
}

function AttributeRow({
  attribute,
}: {
  attribute: Attribute
}) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSave(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await updateAttribute(attribute.id, formData)

      if (result.success) {
        setEditing(false)
      } else {
        setError(result.error ?? 'Не удалось сохранить атрибут.')
      }
    })
  }

  function handleDelete() {
    setError(null)

    startTransition(async () => {
      const result = await deleteAttribute(attribute.id)

      if (!result.success) {
        setError(result.error ?? 'Не удалось удалить атрибут.')
        setConfirmingDelete(false)
      }
    })
  }

  if (editing) {
    return (
      <li className="rounded-xl bg-[#fafbfc] p-1 ring-1 ring-[#e3e6ea]">
        <form action={handleSave}>
          <div className="rounded-lg bg-white shadow-sm ring-1 ring-black/[0.03]">
            <div className="flex items-center justify-between gap-3 border-b border-[#eef0f2] px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M4 13.5V16h2.5L15 7.5 12.5 5 4 13.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.5 6L14 8.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#28313d]">
                    Редактирование атрибута
                  </p>

                  <p className="mt-0.5 text-xs text-[#929aa6]">
                    Измените параметры характеристики
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <AttributeFormFields attribute={attribute} />

              {error && (
                <div className="mt-4 rounded-xl border border-[#f0d5d5] bg-[#fff7f7] px-3.5 py-3 text-xs text-[#b33a3a]">
                  {error}
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setError(null)
                  }}
                  disabled={isPending}
                  className="h-10 rounded-xl border border-[#dfe3e8] bg-white px-4 text-xs font-medium text-[#5f6975] shadow-sm transition hover:bg-[#f7f8fa] hover:text-[#28313d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#28394c] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}

                  {isPending ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="group">
      <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-black/[0.04] transition hover:shadow-md sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#687382]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
            >
              <rect
                x="4"
                y="3.5"
                width="12"
                height="13"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M7 7.5H13M7 10H13M7 12.5H10"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold text-[#28313d]">
                {attribute.label}
              </span>

              {attribute.unit && (
                <span className="shrink-0 rounded-full bg-[#f4f5f7] px-2 py-0.5 text-[10px] font-medium text-[#7b8592]">
                  {attribute.unit}
                </span>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <code className="rounded-md bg-[#f7f8fa] px-1.5 py-0.5 font-mono text-[10px] text-[#7d8792]">
                {attribute.key}
              </code>

              <span className="h-1 w-1 rounded-full bg-[#c9ced5]" />

              <FieldTypeLabel value={attribute.fieldType} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!confirmingDelete ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setEditing(true)
                }}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f4f5f7] px-3 text-xs font-medium text-[#687382] transition hover:bg-[#e9ebee] hover:text-[#28394c]"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M4 13.5V16h2.5L15 7.5 12.5 5 4 13.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.5 6L14 8.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>

                <span className="hidden sm:inline">
                  Изменить
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setConfirmingDelete(true)
                }}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-[#fff7f7] px-3 text-xs font-medium text-[#b33a3a] transition hover:bg-[#ffefef]"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 6.5H15M8 6.5V4.5H12V6.5M7 8.5V15.5H13V8.5M9.5 10.5V13.5M10.5 10.5V13.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="hidden sm:inline">
                  Удалить
                </span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-[#f0d5d5] bg-[#fff7f7] px-3 py-2">
              <span className="text-xs text-[#8b5555]">
                Удалить атрибут?
              </span>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-[#b33a3a] transition hover:bg-[#ffeaea] disabled:opacity-50"
              >
                {isPending ? 'Удаление...' : 'Да'}
              </button>

              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isPending}
                className="rounded-lg px-2 py-1 text-xs font-medium text-[#69737f] transition hover:bg-white disabled:opacity-50"
              >
                Нет
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 rounded-xl border border-[#f0d5d5] bg-[#fff7f7] px-3.5 py-2.5 text-xs text-[#b33a3a]">
          {error}
        </div>
      )}
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  function handleAdd(formData: FormData) {
    setAddError(null)

    startTransition(async () => {
      const result = await createAttribute(categoryId, formData)

      if (result.success) {
        setAddError(null)

        const form = document.getElementById(
          'add-attr-form',
        ) as HTMLFormElement | null

        form?.reset()
      } else {
        setAddError(
          result.error ?? 'Не удалось добавить атрибут.',
        )
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18212b]/45 px-4 py-6 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-[#f7f8fa] text-[#28313d] shadow-[0_24px_70px_rgba(24,33,43,0.18)] ring-1 ring-black/[0.06]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="shrink-0 border-b border-[#eef0f2] bg-white px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M4 5.5C4 4.67 4.67 4 5.5 4H14.5C15.33 4 16 4.67 16 5.5V14.5C16 15.33 15.33 16 14.5 16H5.5C4.67 16 4 15.33 4 14.5V5.5Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />

                  <path
                    d="M7 7.5H13M7 10H13M7 12.5H10"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#929aa6]">
                  Характеристики
                </p>

                <h2 className="mt-0.5 truncate text-base font-semibold text-[#28313d] sm:text-lg">
                  {categoryName}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f5f7] text-[#89929d] transition hover:bg-[#e9ebee] hover:text-[#28313d]"
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

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {/* ATTRIBUTE LIST */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
            <div className="flex items-center justify-between gap-4 border-b border-[#eef0f2] px-4 py-4 sm:px-5">
              <div>
                <h3 className="text-sm font-semibold text-[#28313d]">
                  Атрибуты категории
                </h3>

                <p className="mt-0.5 text-xs text-[#929aa6]">
                  {attributes.length === 0
                    ? 'Характеристики не добавлены'
                    : `${attributes.length} ${
                        attributes.length === 1
                          ? 'атрибут'
                          : attributes.length < 5
                            ? 'атрибута'
                            : 'атрибутов'
                      }`}
                </p>
              </div>

              <div className="flex h-8 min-w-8 items-center justify-center rounded-xl bg-[#f1f3f5] px-2 text-xs font-semibold text-[#596572]">
                {attributes.length}
              </div>
            </div>

            {attributes.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f3f5] text-[#9aa2ad]">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M4 5.5C4 4.67 4.67 4 5.5 4H14.5C15.33 4 16 4.67 16 5.5V14.5C16 15.33 15.33 16 14.5 16H5.5C4.67 16 4 15.33 4 14.5V5.5Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />

                    <path
                      d="M7 8H13M7 10.5H13M7 13H10"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p className="mt-4 text-sm font-medium text-[#596572]">
                  Атрибутов пока нет
                </p>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#929aa6]">
                  Добавьте характеристики, которые будут
                  использоваться товарами этой категории.
                </p>
              </div>
            ) : (
              <div className="p-3 sm:p-4">
                <ul className="space-y-2">
                  {attributes.map((attribute) => (
                    <AttributeRow
                      key={attribute.id}
                      attribute={attribute}
                    />
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* ADD ATTRIBUTE */}
          <section className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
            <div className="flex items-center gap-3 border-b border-[#eef0f2] px-4 py-4 sm:px-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M10 4V16M4 10H16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#28313d]">
                  Новый атрибут
                </h3>

                <p className="mt-0.5 text-xs text-[#929aa6]">
                  Добавьте характеристику для товаров категории
                </p>
              </div>
            </div>

            <form
              id="add-attr-form"
              action={handleAdd}
              className="p-4 sm:p-5"
            >
              <AttributeFormFields />

              {addError && (
                <div className="mt-4 rounded-xl border border-[#f0d5d5] bg-[#fff7f7] px-3.5 py-3 text-xs text-[#b33a3a]">
                  {addError}
                </div>
              )}

              <div className="mt-5 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#28394c] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}

                  {isPending
                    ? 'Добавление...'
                    : 'Добавить атрибут'}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#eef0f2] bg-white px-5 py-3.5 sm:px-6">
          <p className="hidden text-[11px] text-[#929aa6] sm:block">
            Изменения применяются сразу после сохранения
          </p>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto h-10 rounded-xl border border-[#dfe3e8] bg-white px-4 text-xs font-medium text-[#596572] shadow-sm transition hover:bg-[#f4f5f7] hover:text-[#28313d]"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}