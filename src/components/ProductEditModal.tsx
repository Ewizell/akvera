'use client'

import { useState, useTransition } from 'react'
import { updateProduct } from '@/lib/actions/product'
import { createVariant, updateVariant, deleteVariant } from '@/lib/actions/productVariant'
import VariantImages from './VariantImages'
import VariantDocuments from './VariantDocuments'
import { slugify } from '@/lib/slugify'
import TagPicker from './TagPicker'

type CategoryAttribute = {
  id: string
  key: string
  label: string
  fieldType: string
  unit: string | null
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
  images: { id: string; url: string; isMain: boolean }[]
  documents: { id: string; title: string; type: string; url: string }[]
  tagIds: string[]
}

type Product = {
  id: string
  name: string
  categoryId: string
  brandId: string | null
  description: string | null
  shortDescription: string | null
  tagIds: string[]
  variants: Variant[]
}

type Category = { id: string; name: string; attributes: CategoryAttribute[] }
type Brand = { id: string; name: string }
type Tag = { id: string; name: string }

const inputCls =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
const smallLabelCls = 'block text-xs font-medium text-gray-500 mb-1'
const cardCls = 'bg-white border border-gray-200 rounded-lg p-5'
const cardTitleCls = 'text-base font-semibold text-gray-900 mb-4'

// ── Атрибуты категории ─────────────────────────────────────────

function AttributeFields({
  schema,
  values,
}: {
  schema: CategoryAttribute[]
  values?: Record<string, unknown>
}) {
  if (schema.length === 0) {
    return <p className="text-sm text-gray-400">У категории нет атрибутов</p>
  }

  return (
    <>
      <input
        type="hidden"
        name="attrsSchema"
        value={JSON.stringify(schema.map((a) => ({ key: a.key, fieldType: a.fieldType })))}
      />
      <div className="grid grid-cols-2 gap-4">
        {schema.map((attr) => {
          const currentValue = values?.[attr.key]
          if (attr.fieldType === 'boolean') {
            return (
              <label key={attr.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name={`attr_${attr.key}`} defaultChecked={Boolean(currentValue)} />
                {attr.label}
              </label>
            )
          }
          return (
            <div key={attr.id}>
              <label className={smallLabelCls}>
                {attr.label}
                {attr.unit ? ` (${attr.unit})` : ''}
              </label>
              <input
                name={`attr_${attr.key}`}
                type={attr.fieldType === 'number' ? 'number' : 'text'}
                step={attr.fieldType === 'number' ? 'any' : undefined}
                defaultValue={currentValue !== undefined ? String(currentValue) : ''}
                className={inputCls}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}

function CustomAttributesEditor({ initial }: { initial?: { label: string; value: string }[] }) {
  const [items, setItems] = useState<{ label: string; value: string }[]>(initial ?? [])

  function updateItem(index: number, field: 'label' | 'value', text: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: text } : item)))
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      <input type="hidden" name="customAttributes" value={JSON.stringify(items)} />
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item.label}
              onChange={(e) => updateItem(i, 'label', e.target.value)}
              placeholder="Название"
              className={inputCls}
            />
            <input
              value={item.value}
              onChange={(e) => updateItem(i, 'value', e.target.value)}
              placeholder="Значение"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-red-600 hover:text-red-800 text-sm px-2 shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, { label: '', value: '' }])}
        className="text-sm text-blue-600 hover:underline mt-2"
      >
        + Добавить свой атрибут
      </button>
    </div>
  )
}

function PriceField({ defaultValue }: { defaultValue: number | null }) {
  const [onRequest, setOnRequest] = useState(defaultValue === null)

  return (
    <div>
      <label className={smallLabelCls}>Цена</label>
      <input
        name="price"
        type="number"
        step="0.01"
        defaultValue={defaultValue ?? ''}
        disabled={onRequest}
        required={!onRequest}
        className={`${inputCls} disabled:bg-gray-100 disabled:text-gray-400`}
      />
      <label className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
        <input type="checkbox" checked={onRequest} onChange={(e) => setOnRequest(e.target.checked)} />
        Цена по запросу
      </label>
    </div>
  )
}

// ── Редактор варианта (общая форма для создания и правки) ─────

const VARIANT_TABS = ['Общее', 'Характеристики', 'SEO'] as const
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
  const [name, setName] = useState(variant?.name ?? '')
  const [slug, setSlug] = useState(variant?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(!isCreate)
  const customInitial = (variant?.attributes?.customAttributes as { label: string; value: string }[]) ?? []

  const [tab, setTab] = useState<VariantTab>('Общее')

  return (
    <div>
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {VARIANT_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${
              tab === t
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Держим все поля в DOM (только скрываем), чтобы FormData не теряла значения при переключении вкладок */}
      <div className={tab === 'Общее' ? 'space-y-4' : 'hidden'}>
        <div>
          <label className={smallLabelCls}>Название исполнения</label>
          <input
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (isCreate && !slugEdited) setSlug(slugify(e.target.value))
            }}
            required
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={smallLabelCls}>Артикул (SKU)</label>
            <input name="sku" defaultValue={variant?.sku} required className={inputCls} />
          </div>
          <div>
            <label className={smallLabelCls}>Slug</label>
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
          <PriceField defaultValue={variant?.price ? Number(variant.price) : null} />
          <div>
            <label className={smallLabelCls}>Остаток</label>
            <input name="stock" type="number" defaultValue={variant?.stock ?? 0} className={inputCls} />
          </div>
        </div>
      </div>

      <div className={tab === 'Характеристики' ? 'space-y-5' : 'hidden'}>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Атрибуты категории</p>
          <AttributeFields schema={attrSchema} values={variant?.attributes} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Собственные атрибуты товара</p>
          <CustomAttributesEditor initial={customInitial} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Дополнительные теги исполнения</p>
          <TagPicker allTags={allTags} selectedIds={variant?.tagIds ?? []} name="variantTagIds" />
        </div>
      </div>

      <div className={tab === 'SEO' ? 'space-y-4' : 'hidden'}>
        <div>
          <label className={smallLabelCls}>Meta Title</label>
          <input
            name="metaTitle"
            defaultValue={variant?.metaTitle ?? ''}
            placeholder="Если пусто — используется название"
            className={inputCls}
          />
        </div>
        <div>
          <label className={smallLabelCls}>Meta Description</label>
          <textarea
            name="metaDescription"
            defaultValue={variant?.metaDescription ?? ''}
            rows={2}
            maxLength={160}
            placeholder="До 160 символов"
            className={inputCls}
          />
        </div>
        <div>
          <label className={smallLabelCls}>Ключевые слова</label>
          <input
            name="metaKeywords"
            defaultValue={variant?.metaKeywords ?? ''}
            placeholder="через запятую: калорифер, отопление склада"
            className={inputCls}
          />
        </div>
      </div>
    </div>
  )
}

// ── Строка варианта в списке ────────────────────────────────

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
  const [editing, setEditing] = useState(startEditing ?? false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateVariant(variant.id, formData)
      if (result.success) {
        setEditing(false)
        setError(null)
      } else {
        setError(result.error ?? 'Ошибка сохранения')
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Удалить исполнение «${variant.name}»?`)) return
    startTransition(async () => {
      const result = await deleteVariant(variant.id)
      if (!result.success) {
        setError(result.error ?? 'Ошибка удаления')
      }
    })
  }

  if (editing) {
    return (
      <li className={`${cardCls} border-blue-200`}>
        <form action={handleSave}>
          <VariantFormFields variant={variant} attrSchema={attrSchema} allTags={allTags} />
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              Отмена
            </button>
          </div>
        </form>

        <div className="border-t border-gray-100 mt-4 pt-4 space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Изображения</p>
            <VariantImages variantId={variant.id} images={variant.images} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Документы</p>
            <VariantDocuments variantId={variant.id} documents={variant.documents} />
          </div>
        </div>
      </li>
    )
  }

  const categoryAttrSummary = attrSchema
    .filter((a) => variant.attributes?.[a.key] !== undefined && variant.attributes?.[a.key] !== '')
    .map((a) => `${a.label}: ${variant.attributes[a.key]}${a.unit ?? ''}`)

  const customAttrs = (variant.attributes?.customAttributes as { label: string; value: string }[]) ?? []
  const customAttrSummary = customAttrs.filter((a) => a.label && a.value).map((a) => `${a.label}: ${a.value}`)
  const attrSummary = [...categoryAttrSummary, ...customAttrSummary].join(' · ')

  const mainImage = variant.images.find((img) => img.isMain) ?? variant.images[0]

  return (
    <li className="border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-3 bg-white">
      <div className="flex gap-3 min-w-0">
        {mainImage ? (
          <img src={mainImage.url} alt="" className="w-12 h-12 object-cover rounded border border-gray-200 shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded border border-gray-200 bg-gray-50 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{variant.name}</p>
          <p className="text-sm text-gray-500">
            {variant.sku} · {variant.price ? `${variant.price} ₽` : 'цена по запросу'} · остаток: {variant.stock}
          </p>
          {attrSummary && <p className="text-xs text-gray-400 mt-1 truncate">{attrSummary}</p>}
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
      </div>
      <div className="flex gap-3 shrink-0">
        <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:underline">
          Изменить
        </button>
        {!isOnlyVariant && (
          <button onClick={handleDelete} disabled={isPending} className="text-sm text-red-600 hover:underline">
            Удалить
          </button>
        )}
      </div>
    </li>
  )
}

// ── Модалка ─────────────────────────────────────────────────

const TOP_TABS = ['Основное', 'Исполнения'] as const
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
  const [topTab, setTopTab] = useState<TopTab>(initialVariantId ? 'Исполнения' : 'Основное')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState(product.categoryId)

  const [addError, setAddError] = useState<string | null>(null)
  const [addFormKey, setAddFormKey] = useState(0)
  const [addingVariant, setAddingVariant] = useState(false)

  const currentCategory = categories.find((c) => c.id === categoryId)
  const attrSchema = currentCategory?.attributes ?? []

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProduct(product.id, formData)
      if (result.success) {
        onClose()
      } else {
        setError('Не удалось сохранить изменения')
      }
    })
  }

  function handleAddVariant(formData: FormData) {
    startTransition(async () => {
      const result = await createVariant(product.id, formData)
      if (result.success) {
        setAddError(null)
        setAddFormKey((k) => k + 1)
        setAddingVariant(false)
      } else {
        setAddError(result.error ?? 'Ошибка добавления')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto text-gray-900">
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-3xl mx-auto px-8 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">
              ✕
            </button>
          </div>
          <div className="flex gap-1">
            {TOP_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTopTab(t)}
                className={`px-4 py-2 text-sm border-b-2 -mb-px ${
                  topTab === t
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
                {t === 'Исполнения' ? ` (${product.variants.length})` : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        {topTab === 'Основное' && (
          <form action={handleSubmit} className="space-y-5">
            <div className={cardCls}>
              <h2 className={cardTitleCls}>Модель</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Название модели</label>
                  <input name="name" defaultValue={product.name} required className={inputCls} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Категория</label>
                    <select
                      name="categoryId"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      className={inputCls}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {categoryId !== product.categoryId && (
                      <p className="text-xs text-amber-600 mt-1.5">
                        Атрибуты вариантов не пересчитываются автоматически при смене категории.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Бренд</label>
                    <select name="brandId" defaultValue={product.brandId ?? ''} className={inputCls}>
                      <option value="">— без бренда —</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Описание</label>
                  <textarea name="description" defaultValue={product.description ?? ''} rows={4} className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Краткое описание</label>
                  <textarea
                    name="shortDescription"
                    defaultValue={product.shortDescription ?? ''}
                    rows={2}
                    maxLength={200}
                    placeholder="Покажется в каталоге под названием (до 200 символов)"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Теги</label>
                  <TagPicker allTags={tags} selectedIds={product.tagIds} name="tagIds" />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                Отмена
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        )}

        {topTab === 'Исполнения' && (
          <div>
            <ul className="space-y-3 mb-6">
              {product.variants.map((v) => (
                <VariantRow
                  key={v.id}
                  variant={v}
                  isOnlyVariant={product.variants.length === 1}
                  attrSchema={attrSchema}
                  allTags={tags}
                  startEditing={v.id === initialVariantId}
                />
              ))}
            </ul>

            {addingVariant ? (
              <div className={cardCls}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={cardTitleCls + ' mb-0'}>Новое исполнение</h2>
                  <button
                    type="button"
                    onClick={() => setAddingVariant(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Отмена
                  </button>
                </div>
                <form key={addFormKey} action={handleAddVariant}>
                  <VariantFormFields attrSchema={attrSchema} allTags={tags} />
                  {addError && <p className="text-sm text-red-600 mt-3">{addError}</p>}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="mt-4 bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isPending ? 'Добавление...' : 'Добавить исполнение'}
                  </button>
                </form>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingVariant(true)}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
              >
                + Добавить исполнение
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}