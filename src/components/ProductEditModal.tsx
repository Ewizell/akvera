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
  type Tag = { id: string; name: string }

  function AttributeFields({
    schema,
    values,
  }: {
    schema: CategoryAttribute[]
    values?: Record<string, unknown>
  }) {
    if (schema.length === 0) {
      return <p className="text-xs text-gray-400">У категории нет атрибутов</p>
    }

    return (
      <>
        <input type="hidden" name="attrsSchema" value={JSON.stringify(schema.map((a) => ({ key: a.key, fieldType: a.fieldType })))} />
        <div className="grid grid-cols-2 gap-2">
          {schema.map((attr) => {
            const currentValue = values?.[attr.key]
            if (attr.fieldType === 'boolean') {
              return (
                <label key={attr.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`attr_${attr.key}`}
                    defaultChecked={Boolean(currentValue)}
                  />
                  {attr.label}
                </label>
              )
            }
            return (
              <div key={attr.id}>
                <label className="block text-xs text-gray-500 mb-0.5">
                  {attr.label}
                  {attr.unit ? ` (${attr.unit})` : ''}
                </label>
                <input
                  name={`attr_${attr.key}`}
                  type={attr.fieldType === 'number' ? 'number' : 'text'}
                  step={attr.fieldType === 'number' ? 'any' : undefined}
                  defaultValue={currentValue !== undefined ? String(currentValue) : ''}
                  className="border rounded px-2 py-1 text-sm w-full"
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
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={item.label}
                onChange={(e) => updateItem(i, 'label', e.target.value)}
                placeholder="Название"
                className="border rounded px-2 py-1 text-sm flex-1"
              />
              <input
                value={item.value}
                onChange={(e) => updateItem(i, 'value', e.target.value)}
                placeholder="Значение"
                className="border rounded px-2 py-1 text-sm flex-1"
              />
              <button type="button" onClick={() => removeItem(i)} className="text-red-600 text-xs px-1">
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, { label: '', value: '' }])}
          className="text-xs text-blue-600 hover:underline mt-1"
        >
          + Добавить свой атрибут
        </button>
      </div>
    )
  }

  function PriceField({ defaultValue }: { defaultValue: number | null }) {
  const [onRequest, setOnRequest] = useState(defaultValue === null)

  return (
    <div className="flex flex-col gap-1">
      <input
        name="price"
        type="number"
        step="0.01"
        defaultValue={defaultValue ?? ''}
        disabled={onRequest}
        placeholder="Цена"
        required={!onRequest}
        className="border rounded px-2 py-1 text-sm w-full disabled:bg-gray-100"
      />
      <label className="flex items-center gap-1 text-xs text-gray-500">
        <input
          type="checkbox"
          checked={onRequest}
          onChange={(e) => setOnRequest(e.target.checked)}
        />
        Цена по запросу
      </label>
    </div>
  )
}

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

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (isCreate && !slugEdited) setSlug(slugify(e.target.value))
            }}
            placeholder="Название исполнения"
            required
            className="border rounded px-2 py-1 text-sm col-span-2"
          />
          <input name="sku" defaultValue={variant?.sku} placeholder="Артикул (SKU)" required className="border rounded px-2 py-1 text-sm" />
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              setSlugEdited(true)
            }}
            placeholder="Slug"
            required
            className="border rounded px-2 py-1 text-sm"
          />
          
          <PriceField defaultValue={variant?.price ? Number(variant.price) : null} />
          <input name="stock" type="number" defaultValue={variant?.stock ?? 0} placeholder="Остаток" className="border rounded px-2 py-1 text-sm" />
        </div>
        <div className="border-t pt-2">
          <p className="text-xs font-medium text-gray-600 mb-1">Атрибуты категории</p>
          <AttributeFields schema={attrSchema} values={variant?.attributes} />
        </div>
        <div className="border-t pt-2">
          <p className="text-xs font-medium text-gray-600 mb-1">Собственные атрибуты товара</p>
          <CustomAttributesEditor initial={customInitial} />
        </div>
        <div className="border-t pt-2">
          <p className="text-xs font-medium text-gray-600 mb-1">Дополнительные теги исполнения</p>
          <TagPicker allTags={allTags} selectedIds={variant?.tagIds ?? []} name="variantTagIds" />
        </div>
        <div className="border-t pt-2">
          <p className="text-xs font-medium text-gray-600 mb-1">SEO</p>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Meta Title</label>
              <input
                name="metaTitle"
                defaultValue={variant?.metaTitle ?? ''}
                placeholder="Заголовок страницы (title). Если пусто — используется название"
                className="border rounded px-2 py-1 text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Meta Description</label>
              <textarea
                name="metaDescription"
                defaultValue={variant?.metaDescription ?? ''}
                rows={2}
                maxLength={160}
                placeholder="Краткое описание для поисковых систем (до 160 символов)"
                className="border rounded px-2 py-1 text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Ключевые слова</label>
              <input
                name="metaKeywords"
                defaultValue={variant?.metaKeywords ?? ''}
                placeholder="через запятую: калорифер, отопление склада"
                className="border rounded px-2 py-1 text-sm w-full"
              />
            </div>
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
  }: {
    variant: Variant
    isOnlyVariant: boolean
    attrSchema: CategoryAttribute[]
    allTags: Tag[]
  }) {
    const [editing, setEditing] = useState(false)
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
      startTransition(async () => {
        const result = await deleteVariant(variant.id)
        if (!result.success) {
          setError(result.error ?? 'Ошибка удаления')
        }
      })
    }

    if (editing) {
      return (
        <li className="border rounded p-3 space-y-2">
          <form action={handleSave}>
            <VariantFormFields variant={variant} attrSchema={attrSchema} allTags={allTags} />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            <div className="flex gap-2 mt-2">
              <button type="submit" disabled={isPending} className="text-xs text-blue-600 hover:underline">
                Сохранить
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-xs text-gray-500 hover:underline">
                Отмена
              </button>
            </div>
          </form>
          <div className="border-t pt-2">
            <p className="text-xs font-medium text-gray-600 mb-1">Изображения</p>
            <VariantImages variantId={variant.id} images={variant.images} />
          </div>
          <div className="border-t pt-2">
            <p className="text-xs font-medium text-gray-600 mb-1">Документы</p>
            <VariantDocuments variantId={variant.id} documents={variant.documents} />
          </div>
        </li>
      )
    }

    const categoryAttrSummary = attrSchema
      .filter((a) => variant.attributes?.[a.key] !== undefined && variant.attributes?.[a.key] !== '')
      .map((a) => `${a.label}: ${variant.attributes[a.key]}${a.unit ?? ''}`)

    const customAttrs = (variant.attributes?.customAttributes as { label: string; value: string }[]) ?? []
    const customAttrSummary = customAttrs
      .filter((a) => a.label && a.value)
      .map((a) => `${a.label}: ${a.value}`)

    const attrSummary = [...categoryAttrSummary, ...customAttrSummary].join(', ')

    const mainImage = variant.images.find((img) => img.isMain) ?? variant.images[0]

    return (
      <li className="border rounded p-3 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          {mainImage && (
            <img src={mainImage.url} alt="" className="w-8 h-8 object-cover rounded border" />
          )}
          <strong>{variant.name}</strong>{' '}
          <span className="text-gray-500">
            ({variant.sku}) — {variant.price} ₽, остаток: {variant.stock}
          </span>
          {attrSummary && <span className="text-xs text-gray-400 block">{attrSummary}</span>}
          {error && <span className="text-xs text-red-600 block">{error}</span>}
        </span>
        <div className="flex gap-2 shrink-0 ml-3">
          <button onClick={() => setEditing(true)} className="text-blue-600 hover:underline text-xs">
            Изменить
          </button>
          {!isOnlyVariant && (
            <button onClick={handleDelete} disabled={isPending} className="text-red-600 hover:underline text-xs">
              Удалить
            </button>
          )}
        </div>
      </li>
    )
  }

  type Brand = { id: string; name: string }

  export default function ProductEditModal({
    product,
    categories,
    brands,
    tags,
    onClose,
  }: {
    product: Product
    categories: Category[]
    brands: Brand[]
    tags: Tag[]
    onClose: () => void
  }) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [categoryId, setCategoryId] = useState(product.categoryId)

    const [addError, setAddError] = useState<string | null>(null)
    const [addFormKey, setAddFormKey] = useState(0)

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
        } else {
          setAddError(result.error ?? 'Ошибка добавления')
        }
      })
    }

    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Редактировать товар</h1>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">
              ✕
            </button>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Название модели</label>
              <input name="name" defaultValue={product.name} required className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Категория</label>
              <select
                name="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {categoryId !== product.categoryId && (
                <p className="text-xs text-amber-600 mt-1">
                  При смене категории набор атрибутов ниже изменится, но старые значения атрибутов вариантов не пересчитываются автоматически.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Бренд (необязательно)</label>
              <select name="brandId" defaultValue={product.brandId ?? ''} className="w-full border rounded px-3 py-2">
                <option value="">— без бренда —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Описание</label>
              <textarea name="description" defaultValue={product.description ?? ''} rows={3} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Теги</label>
              <TagPicker allTags={tags} selectedIds={product.tagIds} name="tagIds" />
            </div>
                        <div>
              <label className="block text-xs text-gray-500 mb-0.5">Краткое описание</label>
              <textarea
                name="shortDescription"
                defaultValue={product?.shortDescription ?? ''}
                rows={2}
                maxLength={200}
                placeholder="Коротко о товаре — покажется в каталоге под названием (до 200 символов)"
                className="border rounded px-2 py-1 text-sm w-full"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={isPending} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {isPending ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>

          <div className="border-t mt-8 pt-6">
            <h2 className="text-lg font-semibold mb-3">Исполнения ({product.variants.length})</h2>

            <ul className="space-y-2 mb-6">
              {product.variants.map((v) => (
                <VariantRow
                  key={v.id}
                  variant={v}
                  isOnlyVariant={product.variants.length === 1}
                  attrSchema={attrSchema}
                  allTags={tags}
                />
              ))}
            </ul>

            <form key={addFormKey} id="add-variant-form" action={handleAddVariant} className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Добавить исполнение</p>
              <VariantFormFields attrSchema={attrSchema} allTags={tags} />
              {addError && <p className="text-xs text-red-600 mt-1">{addError}</p>}
              <button type="submit" disabled={isPending} className="mt-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                {isPending ? 'Добавление...' : '+ Добавить исполнение'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }