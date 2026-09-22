'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProduct, applyAttributeTransfers } from '@/lib/actions/product'
import { computeAttributeMigration } from '@/lib/attribute-migration'
import {
  createVariant,
  updateVariant,
  deleteVariant,
} from '@/lib/actions/productVariant'
import VariantImages from './VariantImages'
import DocumentPicker from './DocumentPicker'
import StringListEditor from './StringListEditor'
import {
  attachDocumentToProduct,
  uploadAndAttachToProduct,
  detachDocumentFromProduct,
  attachDocumentToVariant,
  uploadAndAttachToVariant,
  detachDocumentFromVariant,
} from '@/lib/actions/document'
import { slugify } from '@/lib/slugify'
import TagPicker from './TagPicker'

type CategoryAttribute = {
  id: string
  key: string
  label: string
  fieldType: string
  unit: string | null
}

type DocJoin = {
  id: string
  documentId: string
  document: {
    title: string
    type: string
    url: string
  }
}

type Variant = {
  id: string
  name: string
  sku: string
  slug: string
  price: number | null
  stock: number
  attributes: Record<string, unknown>
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  applicationAreas: string[]
  advantages: string[]
  images: {
    id: string
    url: string
    isMain: boolean
  }[]
  documents: DocJoin[]
  tagIds: string[]
}

type Product = {
  id: string
  name: string
  categoryId: string | null
  brandId: string | null
  description: string | null
  shortDescription: string | null
  applicationAreas: string[]
  advantages: string[]
  tagIds: string[]
  documents: DocJoin[]
  variants: Variant[]
}

function toAttached(docs: DocJoin[] | undefined) {
  return (docs ?? []).map((d) => ({
    joinId: d.id,
    documentId: d.documentId,
    title: d.document.title,
    type: d.document.type,
    url: d.document.url,
  }))
}

type Category = {
  id: string
  name: string
  attributes: CategoryAttribute[]
}

type Brand = {
  id: string
  name: string
}

type Tag = {
  id: string
  name: string
}

const inputCls =
  'h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15 disabled:cursor-not-allowed disabled:opacity-60'

const textareaCls =
  'w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 py-3 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15'

const labelCls =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]'

const cardCls =
  'rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]'

const primaryButtonCls =
  'inline-flex h-10 items-center justify-center rounded-xl bg-[#28394c] px-4 text-sm font-semibold text-white transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-50'

const secondaryButtonCls =
  'inline-flex h-10 items-center justify-center rounded-xl bg-[#f4f5f7] px-4 text-sm font-semibold text-[#4f5a67] transition hover:bg-[#e9ecef] disabled:cursor-not-allowed disabled:opacity-50'

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 animate-spin"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        className="opacity-25"
      />
      <path
        strokeLinecap="round"
        d="M21 12a9 9 0 00-9-9"
      />
    </svg>
  )
}

function SectionIcon({
  type,
}: {
  type:
    | 'product'
    | 'attributes'
    | 'content'
    | 'seo'
    | 'images'
    | 'documents'
    | 'tags'
}) {
  if (type === 'product') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6.5L10 3l6 3.5v7L10 17l-6-3.5v-7z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 6.8L10 10l5.5-3.2M10 10v7"
        />
      </svg>
    )
  }

  if (type === 'attributes') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path
          strokeLinecap="round"
          d="M4 5h12M4 10h12M4 15h12"
        />
        <circle cx="8" cy="5" r="1.5" />
        <circle cx="13" cy="10" r="1.5" />
        <circle cx="7" cy="15" r="1.5" />
      </svg>
    )
  }

  if (type === 'content') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 4h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
        />
        <path
          strokeLinecap="round"
          d="M7 8h6M7 11h6M7 14h3"
        />
      </svg>
    )
  }

  if (type === 'seo') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <circle cx="8.5" cy="8.5" r="4.5" />
        <path
          strokeLinecap="round"
          d="M12 12l4 4"
        />
      </svg>
    )
  }

  if (type === 'images') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect
          x="3"
          y="3"
          width="14"
          height="14"
          rx="2"
        />
        <circle
          cx="7.5"
          cy="7.5"
          r="1.2"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 15l4-4 2.5 2 1.5-1.5 3 3"
        />
      </svg>
    )
  }

  if (type === 'documents') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 3.5h5l3 3V16a1 1 0 01-1 1H6a1 1 0 01-1-1V4.5a1 1 0 011-1z"
        />
        <path
          strokeLinecap="round"
          d="M11 3.5V7h3"
        />
        <path
          strokeLinecap="round"
          d="M7.5 10h5M7.5 13h5"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 6h10M5 10h7M5 14h4"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 12.5v4M12 14.5h4"
      />
    </svg>
  )
}

function AttributeFields({
  schema,
  values,
}: {
  schema: CategoryAttribute[]
  values?: Record<string, unknown>
}) {
  if (schema.length === 0) {
    return (
      <div className="rounded-xl bg-[#f4f5f7] px-4 py-3 text-sm text-[#8b949f]">
        У категории нет атрибутов.
      </div>
    )
  }

  return (
    <>
      <input
        type="hidden"
        name="attrsSchema"
        value={JSON.stringify(
          schema.map((a) => ({
            key: a.key,
            fieldType: a.fieldType,
          }))
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {schema.map((attr) => {
          const currentValue = values?.[attr.key]

          if (attr.fieldType === 'boolean') {
            return (
              <label
                key={attr.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#f4f5f7] px-3.5 py-3 text-sm text-[#4f5a67] transition hover:bg-[#eef1f4]"
              >
                <input
                  type="checkbox"
                  name={`attr_${attr.key}`}
                  defaultChecked={Boolean(currentValue)}
                  className="h-4 w-4 rounded border-[#cbd1d8] text-[#28394c] focus:ring-[#28394c]/20"
                />

                <span className="font-medium">
                  {attr.label}
                </span>
              </label>
            )
          }

          return (
            <div key={attr.id}>
              <label className={labelCls}>
                {attr.label}
                {attr.unit ? ` (${attr.unit})` : ''}
              </label>

              <input
                name={`attr_${attr.key}`}
                type={
                  attr.fieldType === 'number'
                    ? 'number'
                    : 'text'
                }
                step={
                  attr.fieldType === 'number'
                    ? 'any'
                    : undefined
                }
                defaultValue={
                  currentValue !== undefined
                    ? String(currentValue)
                    : ''
                }
                className={inputCls}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}

function CustomAttributesEditor({
  initial,
}: {
  initial?: {
    label: string
    value: string
  }[]
}) {
  const [items, setItems] = useState<
    {
      label: string
      value: string
    }[]
  >(initial ?? [])

  function updateItem(
    index: number,
    field: 'label' | 'value',
    text: string
  ) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: text,
            }
          : item
      )
    )
  }

  function removeItem(index: number) {
    setItems((prev) =>
      prev.filter((_, i) => i !== index)
    )
  }

  return (
    <div>
      <input
        type="hidden"
        name="customAttributes"
        value={JSON.stringify(items)}
      />

      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              value={item.label}
              onChange={(e) =>
                updateItem(
                  i,
                  'label',
                  e.target.value
                )
              }
              placeholder="Название"
              className={inputCls}
            />

            <input
              value={item.value}
              onChange={(e) =>
                updateItem(
                  i,
                  'value',
                  e.target.value
                )
              }
              placeholder="Значение"
              className={inputCls}
            />

            <button
              type="button"
              onClick={() => removeItem(i)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff7f7] text-[#b33a3a] ring-1 ring-[#f0d5d5] transition hover:bg-[#ffefef]"
              title="Удалить атрибут"
              aria-label="Удалить атрибут"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  strokeLinecap="round"
                  d="M4 6h12"
                />
                <path
                  strokeLinecap="round"
                  d="M8 3.5h4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l.7 10.5h6.6L14 6"
                />
                <path
                  strokeLinecap="round"
                  d="M8.5 9v5M11.5 9v5"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setItems((prev) => [
            ...prev,
            {
              label: '',
              value: '',
            },
          ])
        }
        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#28394c] hover:underline"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#eef1f4]">
          +
        </span>
        Добавить свой атрибут
      </button>
    </div>
  )
}

function PriceField({
  defaultValue,
}: {
  defaultValue: number | null
}) {
  const [onRequest, setOnRequest] = useState(
    defaultValue === null
  )

  return (
    <div>
      <label className={labelCls}>Цена</label>

      <input
        name="price"
        type="number"
        step="0.01"
        defaultValue={defaultValue ?? ''}
        disabled={onRequest}
        required={!onRequest}
        className={`${inputCls} disabled:bg-[#eef0f2] disabled:text-[#a1a8b3]`}
      />

      <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-[#7b8592]">
        <input
          type="checkbox"
          checked={onRequest}
          onChange={(e) =>
            setOnRequest(e.target.checked)
          }
          className="h-4 w-4 rounded border-[#cbd1d8] text-[#28394c] focus:ring-[#28394c]/20"
        />
        Цена по запросу
      </label>
    </div>
  )
}

const VARIANT_TABS = [
  'Общее',
  'Характеристики',
  'Контент',
  'SEO',
] as const

type VariantTab = (typeof VARIANT_TABS)[number]

function VariantFormFields({
  variant,
  attrSchema,
  allTags,
}: {
  variant?: Variant
  attrSchema: CategoryAttribute[]
  allTags: Tag[]
}) {
  const isCreate = !variant

  const [name, setName] = useState(
    variant?.name ?? ''
  )

  const [slug, setSlug] = useState(
    variant?.slug ?? ''
  )

  const [slugEdited, setSlugEdited] = useState(
    !isCreate
  )

  const customInitial =
    (variant?.attributes?.customAttributes as {
      label: string
      value: string
    }[]) ?? []

  const [tab, setTab] =
    useState<VariantTab>('Общее')

  return (
    <div>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-[#e7eaed]">
        {VARIANT_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition ${
              tab === t
                ? 'border-[#28394c] text-[#28394c]'
                : 'border-transparent text-[#8b949f] hover:text-[#4f5a67]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div
        className={
          tab === 'Общее'
            ? 'space-y-5'
            : 'hidden'
        }
      >
        <div>
          <label className={labelCls}>
            Название исполнения
          </label>

          <input
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)

              if (
                isCreate &&
                !slugEdited
              ) {
                setSlug(
                  slugify(e.target.value)
                )
              }
            }}
            required
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>
              Артикул (SKU)
            </label>

            <input
              name="sku"
              defaultValue={variant?.sku}
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Slug
            </label>

            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugEdited(true)
              }}
              required
              className={inputCls}
            />
          </div>

          <PriceField
            defaultValue={
              variant?.price !== null &&
              variant?.price !== undefined
                ? Number(variant.price)
                : null
            }
          />

          <div>
            <label className={labelCls}>
              Остаток
            </label>

            <input
              name="stock"
              type="number"
              defaultValue={
                variant?.stock ?? 0
              }
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div
        className={
          tab === 'Характеристики'
            ? 'space-y-6'
            : 'hidden'
        }
      >
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef1f4] text-[#28394c]">
              <SectionIcon type="attributes" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#28313d]">
                Атрибуты категории
              </p>
              <p className="text-xs text-[#969faa]">
                Поля определяются выбранной категорией
              </p>
            </div>
          </div>

          <AttributeFields
            schema={attrSchema}
            values={variant?.attributes}
          />
        </div>

        <div>
          <div className="mb-3">
            <p className="text-sm font-semibold text-[#28313d]">
              Собственные атрибуты
            </p>
            <p className="mt-0.5 text-xs text-[#969faa]">
              Дополнительные характеристики конкретного исполнения
            </p>
          </div>

          <CustomAttributesEditor
            initial={customInitial}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef1f4] text-[#28394c]">
              <SectionIcon type="tags" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#28313d]">
                Теги исполнения
              </p>
              <p className="text-xs text-[#969faa]">
                Дополнительные теги только для этого варианта
              </p>
            </div>
          </div>

          <TagPicker
            allTags={allTags}
            selectedIds={
              variant?.tagIds ?? []
            }
            name="variantTagIds"
          />
        </div>
      </div>

      <div
        className={
          tab === 'Контент'
            ? 'space-y-6'
            : 'hidden'
        }
      >
        <div>
          <p className="text-sm font-semibold text-[#28313d]">
            Область применения
          </p>

          <p className="mb-3 mt-1 text-xs leading-5 text-[#969faa]">
            Если пусто — на странице покажется список товара.
          </p>

          <StringListEditor
            name="applicationAreas"
            initial={
              variant?.applicationAreas ?? []
            }
            placeholder="Например: отопление складских помещений"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#28313d]">
            Преимущества
          </p>

          <p className="mb-3 mt-1 text-xs leading-5 text-[#969faa]">
            Если пусто — на странице покажется список товара.
          </p>

          <StringListEditor
            name="advantages"
            initial={
              variant?.advantages ?? []
            }
            placeholder="Например: низкое энергопотребление"
          />
        </div>
      </div>

      <div
        className={
          tab === 'SEO'
            ? 'space-y-5'
            : 'hidden'
        }
      >
        <div>
          <label className={labelCls}>
            Meta Title
          </label>

          <input
            name="metaTitle"
            defaultValue={
              variant?.metaTitle ?? ''
            }
            placeholder="Если пусто — используется название"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            Meta Description
          </label>

          <textarea
            name="metaDescription"
            defaultValue={
              variant?.metaDescription ?? ''
            }
            rows={3}
            maxLength={160}
            placeholder="До 160 символов"
            className={textareaCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            Ключевые слова
          </label>

          <input
            name="metaKeywords"
            defaultValue={
              variant?.metaKeywords ?? ''
            }
            placeholder="через запятую: калорифер, отопление склада"
            className={inputCls}
          />
        </div>
      </div>
    </div>
  )
}

function VariantRow({
  variant,
  isOnlyVariant,
  attrSchema,
  allTags,
  startEditing,
}: {
  variant: Variant
  isOnlyVariant: boolean
  attrSchema: CategoryAttribute[]
  allTags: Tag[]
  startEditing?: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(
    startEditing ?? false
  )

  const [isPending, startTransition] =
    useTransition()

  const [error, setError] =
    useState<string | null>(null)

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateVariant(
        variant.id,
        formData
      )

      if (result.success) {
        setEditing(false)
        setError(null)
        router.refresh()
      } else {
        setError(
          result.error ?? 'Ошибка сохранения'
        )
      }
    })
  }

  function handleDelete() {
    if (
      !confirm(
        `Удалить исполнение «${variant.name}»?`
      )
    ) {
      return
    }

    startTransition(async () => {
      const result = await deleteVariant(
        variant.id
      )

      if (result.success) {
        router.refresh()
      } else {
        setError(
          result.error ?? 'Ошибка удаления'
        )
      }
    })
  }

  if (editing) {
    return (
      <li
        className={`${cardCls} overflow-hidden ring-2 ring-[#28394c]/10`}
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
            <SectionIcon type="product" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#28313d]">
              Редактирование исполнения
            </p>

            <p className="text-xs text-[#8b949f]">
              {variant.name}
            </p>
          </div>
        </div>

        <form action={handleSave}>
          <VariantFormFields
            variant={variant}
            attrSchema={attrSchema}
            allTags={allTags}
          />

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#fff7f7] p-3.5 text-sm text-[#b33a3a] ring-1 ring-[#f0d5d5]">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="mt-0.5 h-4 w-4 shrink-0"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 3.5l7 12.5H3L10 3.5z"
                />
                <path
                  strokeLinecap="round"
                  d="M10 8v3.5M10 14.2v.1"
                />
              </svg>

              <span>{error}</span>
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-[#edf0f2] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={isPending}
              className={secondaryButtonCls}
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isPending}
              className={primaryButtonCls}
            >
              {isPending && (
                <span className="mr-2">
                  <Spinner />
                </span>
              )}

              {isPending
                ? 'Сохранение...'
                : 'Сохранить'}
            </button>
          </div>
        </form>

        <div className="mt-5 space-y-5 border-t border-[#edf0f2] pt-5">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef1f4] text-[#28394c]">
                <SectionIcon type="images" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#28313d]">
                  Изображения
                </p>

                <p className="text-xs text-[#969faa]">
                  Изображения конкретного исполнения
                </p>
              </div>
            </div>

            <VariantImages
              variantId={variant.id}
              images={variant.images}
            />
          </div>

          <div className="border-t border-[#edf0f2] pt-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef1f4] text-[#28394c]">
                <SectionIcon type="documents" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#28313d]">
                  Документы исполнения
                </p>

                <p className="text-xs leading-5 text-[#969faa]">
                  Специфичные для этого исполнения — плюс к общим документам товара
                </p>
              </div>
            </div>

            <DocumentPicker
              attached={toAttached(
                variant.documents
              )}
              onAttachExisting={(documentId) =>
                attachDocumentToVariant(
                  variant.id,
                  documentId
                )
              }
              onUploadNew={(formData) =>
                uploadAndAttachToVariant(
                  variant.id,
                  formData
                )
              }
              onDetach={(joinId) =>
                detachDocumentFromVariant(
                  joinId
                )
              }
            />
          </div>
        </div>
      </li>
    )
  }

  const categoryAttrSummary = attrSchema
    .filter(
      (a) =>
        variant.attributes?.[a.key] !==
          undefined &&
        variant.attributes?.[a.key] !== ''
    )
    .map(
      (a) =>
        `${a.label}: ${variant.attributes[a.key]}${a.unit ?? ''}`
    )

  const customAttrs =
    (variant.attributes?.customAttributes as {
      label: string
      value: string
    }[]) ?? []

  const customAttrSummary = customAttrs
    .filter(
      (a) => a.label && a.value
    )
    .map(
      (a) => `${a.label}: ${a.value}`
    )

  const attrSummary = [
    ...categoryAttrSummary,
    ...customAttrSummary,
  ].join(' · ')

  const mainImage =
    variant.images.find(
      (img) => img.isMain
    ) ?? variant.images[0]

  return (
    <li className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          {mainImage ? (
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f4f5f7] ring-1 ring-black/[0.04]">
              <img
                src={mainImage.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f4f5f7] text-[#a1a8b3]">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect
                  x="3"
                  y="3"
                  width="14"
                  height="14"
                  rx="2"
                />
                <circle
                  cx="7.5"
                  cy="7.5"
                  r="1.2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 15l4-4 2.5 2 1.5-1.5 3 3"
                />
              </svg>
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[#28313d]">
                {variant.name}
              </p>

              <span className="rounded-md bg-[#f4f5f7] px-2 py-1 font-mono text-[10px] text-[#727c88]">
                {variant.sku}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#687382]">
              <span className="font-semibold text-[#28313d]">
                {variant.price !== null
                  ? `${variant.price} ₽`
                  : 'Цена по запросу'}
              </span>

              <span>
                Остаток: {variant.stock}
              </span>
            </div>

            {attrSummary && (
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#969faa]">
                {attrSummary}
              </p>
            )}

            {error && (
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#b33a3a]">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-3.5 w-3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 3.5l7 12.5H3L10 3.5z"
                  />
                  <path
                    strokeLinecap="round"
                    d="M10 8v3.5M10 14.2v.1"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:ml-4">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#eef1f4] px-3 text-xs font-semibold text-[#28394c] transition hover:bg-[#e3e7eb]"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.8 3.2a1.7 1.7 0 012.4 2.4L7 14.8l-3.2.8.8-3.2 7.8-9.2z"
              />
              <path
                strokeLinecap="round"
                d="M11.8 5.2l3 3"
              />
            </svg>
            Изменить
          </button>

          {!isOnlyVariant && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff7f7] text-[#b33a3a] ring-1 ring-[#f0d5d5] transition hover:bg-[#ffefef] disabled:cursor-not-allowed disabled:opacity-50"
              title="Удалить исполнение"
              aria-label="Удалить исполнение"
            >
              {isPending ? (
                <Spinner />
              ) : (
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    strokeLinecap="round"
                    d="M4 6h12"
                  />
                  <path
                    strokeLinecap="round"
                    d="M8 3.5h4"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l.7 10.5h6.6L14 6"
                  />
                  <path
                    strokeLinecap="round"
                    d="M8.5 9v5M11.5 9v5"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

const TOP_TABS = [
  'Основное',
  'Исполнения',
] as const

type TopTab = (typeof TOP_TABS)[number]

export default function ProductEditModal({
  product,
  categories,
  brands,
  tags,
  onClose,
  initialVariantId,
}: {
  product: Product
  categories: Category[]
  brands: Brand[]
  tags: Tag[]
  onClose: () => void
  initialVariantId?: string | null
}) {
  const router = useRouter()

  const [topTab, setTopTab] =
    useState<TopTab>(
      initialVariantId
        ? 'Исполнения'
        : 'Основное'
    )

  const [isPending, startTransition] =
    useTransition()

  const [error, setError] =
    useState<string | null>(null)

  const [categoryId, setCategoryId] =
    useState(product.categoryId ?? '')

  const [addError, setAddError] =
    useState<string | null>(null)

  const [addFormKey, setAddFormKey] =
    useState(0)

  const [addingVariant, setAddingVariant] =
    useState(false)

  const currentCategory =
    categories.find(
      (c) => c.id === categoryId
    )

  const attrSchema =
    currentCategory?.attributes ?? []

  const categoryChanged = categoryId !== (product.categoryId ?? '')

  const [transferChoices, setTransferChoices] = useState<Record<string, Set<string>>>({})

  const migrationPreview = categoryChanged
    ? product.variants.map((v) => {
        const oldSchema =
          categories.find((c) => c.id === product.categoryId)?.attributes ?? []
        const plan = computeAttributeMigration(oldSchema, attrSchema, v.attributes)
        return { variantId: v.id, variantName: v.name, ...plan }
      })
    : null

  useEffect(() => {
    if (!categoryChanged || !migrationPreview) return

    setTransferChoices((prev) => {
      // не перетираем уже сделанный админом выбор, только добавляем новые варианты по умолчанию
      const next = { ...prev }
      for (const v of migrationPreview) {
        if (!next[v.variantId]) {
          next[v.variantId] = new Set(v.unmatchedAttributes.map((a) => a.key))
        }
      }
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  function toggleTransfer(variantId: string, key: string) {
    setTransferChoices((prev) => {
      const next = { ...prev }
      const set = new Set(next[variantId] ?? [])
      if (set.has(key)) {
        set.delete(key)
      } else {
        set.add(key)
      }
      next[variantId] = set
      return next
    })
  }

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === 'Escape' &&
        !isPending
      ) {
        onClose()
      }
    }

    globalThis.document.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      globalThis.document.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [isPending, onClose])

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProduct(
        product.id,
        formData
      )

      if (!result.success) {
        setError(
          'Не удалось сохранить изменения'
        )
        return
      }

      if (categoryChanged && migrationPreview) {
        const transfers = migrationPreview.map((v) => ({
          variantId: v.variantId,
          keys: v.unmatchedAttributes.filter((a) => transferChoices[v.variantId]?.has(a.key)),
        }))

        if (transfers.some((t) => t.keys.length > 0)) {
          await applyAttributeTransfers(transfers)
        }
      }

      onClose()
      router.refresh()
    })
  }

  function handleAddVariant(
    formData: FormData
  ) {
    startTransition(async () => {
      const result = await createVariant(
        product.id,
        formData
      )

      if (result.success) {
        setAddError(null)
        setAddFormKey((k) => k + 1)
        setAddingVariant(false)
        router.refresh()
      } else {
        setAddError(
          result.error ?? 'Ошибка добавления'
        )
      }
    })
  }

  function handleBackdropClick(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    if (
      event.target === event.currentTarget &&
      !isPending
    ) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18212b]/45 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={handleBackdropClick}
    >
      <div className="flex h-full max-h-[94vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl bg-[#f7f8fa] shadow-2xl ring-1 ring-black/[0.08]">
        <div className="shrink-0 border-b border-[#e7eaed] bg-white">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                  <SectionIcon type="product" />
                </div>

                <div className="min-w-0">
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#8b949f]">
                    Редактирование товара
                  </div>

                  <h1 className="truncate text-base font-semibold text-[#28313d] sm:text-lg">
                    {product.name}
                  </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#8b949f] transition hover:bg-[#f4f5f7] hover:text-[#28313d] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Закрыть"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    strokeLinecap="round"
                    d="M5 5l10 10M15 5L5 15"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex gap-1 overflow-x-auto">
              {TOP_TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopTab(t)}
                  className={`shrink-0 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                    topTab === t
                      ? 'border-[#28394c] text-[#28394c]'
                      : 'border-transparent text-[#8b949f] hover:text-[#4f5a67]'
                  }`}
                >
                  {t}

                  {t === 'Исполнения' && (
                    <span
                      className={`ml-1.5 rounded-md px-1.5 py-0.5 text-[10px] ${
                        topTab === t
                          ? 'bg-[#eef1f4] text-[#28394c]'
                          : 'bg-[#f4f5f7] text-[#8b949f]'
                      }`}
                    >
                      {product.variants.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[900px] p-4 sm:p-6">
            {topTab === 'Основное' && (
              <form
                action={handleSubmit}
                className="space-y-4"
              >
                <div className={cardCls}>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                      <SectionIcon type="product" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-[#28313d]">
                        Основная информация
                      </h2>

                      <p className="mt-0.5 text-xs text-[#969faa]">
                        Название, категория, бренд и описание товара
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className={labelCls}>
                        Название модели
                      </label>

                      <input
                        name="name"
                        defaultValue={
                          product.name
                        }
                        required
                        className={inputCls}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>
                          Категория
                        </label>

                        <select
                          name="categoryId"
                          value={categoryId}
                          onChange={(e) =>
                            setCategoryId(
                              e.target.value
                            )
                          }
                          required
                          className={inputCls}
                        >
                          {categories.map((c) => (
                            <option
                              key={c.id}
                              value={c.id}
                            >
                              {c.name}
                            </option>
                          ))}
                        </select>

                        {categoryChanged && migrationPreview && (
                          <div className="mt-2 space-y-2">
                            {migrationPreview.every(
                              (v) => v.unmatchedAttributes.length === 0 && v.missingAttributes.length === 0
                            ) ? (
                              <div className="rounded-xl bg-[#f1f7f3] px-3 py-2.5 text-xs leading-5 text-[#397653] ring-1 ring-[#d5e8dc]">
                                Атрибуты совпадают с новой категорией, ничего переносить не нужно.
                              </div>
                            ) : (
                              migrationPreview.map((v) =>
                                v.unmatchedAttributes.length === 0 && v.missingAttributes.length === 0 ? null : (
                                  <div
                                    key={v.variantId}
                                    className="rounded-xl bg-[#fff9ed] px-3 py-2.5 text-xs leading-5 text-[#9a6b19] ring-1 ring-[#f0dfb8]"
                                  >
                                    <p className="mb-1.5 font-semibold">{v.variantName}</p>

                                    {v.unmatchedAttributes.length > 0 && (
                                      <div className="mb-1.5 space-y-1">
                                        <p>Не входят в новую категорию — перенести в собственные атрибуты?</p>
                                        {v.unmatchedAttributes.map((attr) => (
                                          <label key={attr.key} className="flex cursor-pointer items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={transferChoices[v.variantId]?.has(attr.key) ?? false}
                                              onChange={() => toggleTransfer(v.variantId, attr.key)}
                                              className="h-3.5 w-3.5 rounded border-[#cbd1d8] text-[#28394c] focus:ring-[#28394c]/20"
                                            />
                                            {attr.label}: <span className="font-medium">{String(attr.value)}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}

                                    {v.missingAttributes.length > 0 && (
                                      <p>
                                        Потребуют заполнения (вкладка «Исполнения»):{' '}
                                        {v.missingAttributes.map((a) => a.label).join(', ')}
                                      </p>
                                    )}
                                  </div>
                                )
                              )
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className={labelCls}>
                          Бренд
                        </label>

                        <select
                          name="brandId"
                          defaultValue={
                            product.brandId ?? ''
                          }
                          className={inputCls}
                        >
                          <option value="">
                            — без бренда —
                          </option>

                          {brands.map(
                            (b) => (
                              <option
                                key={b.id}
                                value={b.id}
                              >
                                {b.name}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Описание
                      </label>

                      <textarea
                        name="description"
                        defaultValue={
                          product.description ?? ''
                        }
                        rows={5}
                        className={textareaCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        Краткое описание
                      </label>

                      <textarea
                        name="shortDescription"
                        defaultValue={
                          product.shortDescription ?? ''
                        }
                        rows={3}
                        maxLength={200}
                        placeholder="Покажется в каталоге под названием (до 200 символов)"
                        className={textareaCls}
                      />

                      <p className="mt-1.5 text-[11px] text-[#969faa]">
                        Краткое описание используется в карточке каталога.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={cardCls}>
                  <div className="mb-5">
                    <h2 className="text-sm font-semibold text-[#28313d]">
                      Контент товара
                    </h2>

                    <p className="mt-0.5 text-xs text-[#969faa]">
                      Общая информация для всех исполнений
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className={labelCls}>
                        Область применения
                      </label>

                      <p className="mb-3 text-xs leading-5 text-[#969faa]">
                        Если пусто — на странице покажется список товара.
                      </p>

                      <StringListEditor
                        name="applicationAreas"
                        initial={
                          product.applicationAreas
                        }
                        placeholder="Например: отопление складских помещений"
                      />
                    </div>

                    <div className="border-t border-[#edf0f2] pt-5">
                      <label className={labelCls}>
                        Преимущества
                      </label>

                      <p className="mb-3 text-xs leading-5 text-[#969faa]">
                        Общие для всех исполнений, если для конкретного исполнения не заданы свои.
                      </p>

                      <StringListEditor
                        name="advantages"
                        initial={
                          product.advantages
                        }
                        placeholder="Например: низкое энергопотребление"
                      />
                    </div>
                  </div>
                </div>

                <div className={cardCls}>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef1f4] text-[#28394c]">
                      <SectionIcon type="tags" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-[#28313d]">
                        Теги
                      </h2>

                      <p className="mt-0.5 text-xs text-[#969faa]">
                        Общие теги товара
                      </p>
                    </div>
                  </div>

                  <TagPicker
                    allTags={tags}
                    selectedIds={
                      product.tagIds
                    }
                    name="tagIds"
                  />
                </div>

                <div className={cardCls}>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef1f4] text-[#28394c]">
                      <SectionIcon type="documents" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-[#28313d]">
                        Документы товара
                      </h2>

                      <p className="mt-0.5 text-xs leading-5 text-[#969faa]">
                        Общие для всех исполнений: сертификаты, инструкции и другие документы.
                      </p>
                    </div>
                  </div>

                  <DocumentPicker
                    attached={toAttached(
                      product.documents
                    )}
                    onAttachExisting={(
                      documentId
                    ) =>
                      attachDocumentToProduct(
                        product.id,
                        documentId
                      )
                    }
                    onUploadNew={(formData) =>
                      uploadAndAttachToProduct(
                        product.id,
                        formData
                      )
                    }
                    onDetach={(joinId) =>
                      detachDocumentFromProduct(
                        joinId
                      )
                    }
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-xl bg-[#fff7f7] px-4 py-3.5 text-sm text-[#b33a3a] ring-1 ring-[#f0d5d5]">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="mt-0.5 h-4 w-4 shrink-0"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 3.5l7 12.5H3L10 3.5z"
                      />
                      <path
                        strokeLinecap="round"
                        d="M10 8v3.5M10 14.2v.1"
                      />
                    </svg>

                    <span>{error}</span>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className={secondaryButtonCls}
                  >
                    Отмена
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className={primaryButtonCls}
                  >
                    {isPending && (
                      <span className="mr-2">
                        <Spinner />
                      </span>
                    )}

                    {isPending
                      ? 'Сохранение...'
                      : 'Сохранить изменения'}
                  </button>
                </div>
              </form>
            )}

            {topTab === 'Исполнения' && (
              <div>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-[#28313d]">
                      Исполнения товара
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[#969faa]">
                      Отдельные SKU с собственными ценами,
                      остатками, характеристиками и контентом.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#5f6976] shadow-sm ring-1 ring-black/[0.04]">
                    {product.variants.length}{' '}
                    {product.variants.length === 1
                      ? 'исполнение'
                      : product.variants.length < 5
                        ? 'исполнения'
                        : 'исполнений'}
                  </div>
                </div>

                <ul className="mb-4 space-y-3">
                  {product.variants.map(
                    (v) => (
                      <VariantRow
                        key={v.id}
                        variant={v}
                        isOnlyVariant={
                          product.variants.length ===
                          1
                        }
                        attrSchema={
                          attrSchema
                        }
                        allTags={tags}
                        startEditing={
                          v.id ===
                          initialVariantId
                        }
                      />
                    )
                  )}
                </ul>

                {addingVariant ? (
                  <div className={cardCls}>
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className="h-5 w-5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10 4v12M4 10h12"
                            />
                          </svg>
                        </div>

                        <div>
                          <h2 className="text-sm font-semibold text-[#28313d]">
                            Новое исполнение
                          </h2>

                          <p className="mt-0.5 text-xs text-[#969faa]">
                            Добавьте новый SKU для товара
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setAddingVariant(
                            false
                          )
                        }
                        disabled={isPending}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8b949f] transition hover:bg-[#f4f5f7] hover:text-[#28313d]"
                        aria-label="Отменить добавление"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-5 w-5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        >
                          <path
                            strokeLinecap="round"
                            d="M5 5l10 10M15 5L5 15"
                          />
                        </svg>
                      </button>
                    </div>

                    <form
                      key={addFormKey}
                      action={handleAddVariant}
                    >
                      <VariantFormFields
                        attrSchema={
                          attrSchema
                        }
                        allTags={tags}
                      />

                      {addError && (
                        <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#fff7f7] px-4 py-3.5 text-sm text-[#b33a3a] ring-1 ring-[#f0d5d5]">
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className="mt-0.5 h-4 w-4 shrink-0"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10 3.5l7 12.5H3L10 3.5z"
                            />
                            <path
                              strokeLinecap="round"
                              d="M10 8v3.5M10 14.2v.1"
                            />
                          </svg>

                          <span>
                            {addError}
                          </span>
                        </div>
                      )}

                      <div className="mt-5 flex flex-col-reverse gap-2 border-t border-[#edf0f2] pt-4 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setAddingVariant(
                              false
                            )
                          }
                          disabled={isPending}
                          className={secondaryButtonCls}
                        >
                          Отмена
                        </button>

                        <button
                          type="submit"
                          disabled={isPending}
                          className={primaryButtonCls}
                        >
                          {isPending && (
                            <span className="mr-2">
                              <Spinner />
                            </span>
                          )}

                          {isPending
                            ? 'Добавление...'
                            : 'Добавить исполнение'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setAddingVariant(true)
                    }
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d9dee3] bg-white py-5 text-sm font-semibold text-[#687382] transition hover:border-[#9da8b3] hover:bg-[#fbfcfc] hover:text-[#28394c]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef1f4] text-lg leading-none text-[#28394c] transition group-hover:bg-[#e4e8ec]">
                      +
                    </span>

                    Добавить исполнение
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {isPending && (
          <div className="flex shrink-0 items-center gap-2 border-t border-[#e7eaed] bg-white px-4 py-2.5 text-xs font-medium text-[#687382] sm:px-6">
            <Spinner />
            Сохранение изменений...
          </div>
        )}
      </div>
    </div>
  )
}