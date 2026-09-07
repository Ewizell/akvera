'use client'

import { useState, useTransition, useMemo } from 'react'
import ProductCreateModal from './ProductCreateModal'
import ProductEditModal from './ProductEditModal'
import { deleteProduct } from '@/lib/actions/product'
import { deleteVariant } from '@/lib/actions/productVariant'
import BulkActionsToolbar from './BulkActionsToolbar'
import CategoryTree from './CategoryTree'

type CategoryAttributeSchema = {
  key: string
  label: string
  fieldType: string
  unit?: string | null
}

type Variant = {
  id: string
  name: string
  sku: string
  price: number | null
  stock: number
  attributes: Record<string, unknown> | null
  images: { url: string; isMain: boolean }[]
}

type Product = {
  id: string
  name: string
  categoryId: string
  brandId: string | null
  description: string | null
  category: { name: string; attributes: CategoryAttributeSchema[] }
  variants: Variant[]
  tagIds: string[]
}

function formatPrice(price: number | null) {
  if (price === null) return 'Цена по запросу'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}

function getVariantAttributeEntries(variant: Variant, schema: CategoryAttributeSchema[]) {
  const attrs = (variant.attributes ?? {}) as Record<string, unknown>
  const entries: { label: string; value: string }[] = []

  for (const attr of schema) {
    const raw = attrs[attr.key]
    if (raw === undefined || raw === null || raw === '') continue
    const value = Array.isArray(raw) ? raw.join(', ') : String(raw)
    entries.push({ label: attr.unit ? `${attr.label}, ${attr.unit}` : attr.label, value })
  }

  const custom = attrs.customAttributes as { label: string; value: string }[] | undefined
  if (Array.isArray(custom)) {
    for (const c of custom) {
      if (c.label && c.value) entries.push({ label: c.label, value: c.value })
    }
  }

  return entries
}

function VariantDetails({
  variant,
  categoryAttributes,
  onEdit,
}: {
  variant: Variant
  categoryAttributes: CategoryAttributeSchema[]
  onEdit: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const attributeEntries = getVariantAttributeEntries(variant, categoryAttributes)
  const mainImage = variant.images.find((img) => img.isMain) ?? variant.images[0]

  function handleDelete() {
    if (!confirm(`Удалить исполнение «${variant.name}»?`)) return
    startTransition(async () => {
      const result = await deleteVariant(variant.id)
      if (!result.success) {
        setError(result.error ?? 'Ошибка удаления')
      }
    })
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 border-t border-gray-100">
      {mainImage ? (
        <img src={mainImage.url} alt="" className="w-9 h-9 object-cover rounded border border-gray-200 shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded border border-gray-200 bg-gray-50 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-900 font-medium truncate">{variant.name}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
          <span>Артикул: {variant.sku || '—'}</span>
          <span className="text-gray-900 font-medium">{formatPrice(variant.price)}</span>
          <span className={variant.stock > 0 ? 'text-green-600' : 'text-gray-400'}>
            {variant.stock > 0 ? `В наличии: ${variant.stock}` : 'Нет в наличии'}
          </span>
        </div>
        {attributeEntries.length > 0 && (
          <dl className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs">
            {attributeEntries.map((e, i) => (
              <div key={i} className="flex gap-1">
                <dt className="text-gray-400">{e.label}:</dt>
                <dd className="text-gray-700">{e.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <div className="flex gap-3 shrink-0">
        <button onClick={onEdit} className="text-xs text-blue-600 hover:underline">
          Редактировать
        </button>
        <button onClick={handleDelete} disabled={isPending} className="text-xs text-red-600 hover:underline disabled:opacity-50">
          Удалить
        </button>
      </div>
    </div>
  )
}

type Category = { id: string; name: string; parentId: string | null }
type Brand = { id: string; name: string }
type Tag = { id: string; name: string }

function ProductRow({
  product,
  onEdit,
  selected,
  onToggleSelect,
}: {
  product: Product
  onEdit: (p: Product, variantId?: string) => void
  selected: boolean
  onToggleSelect: (id: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProduct(product.id)
      if (!result.success) {
        setError(result.error ?? 'Не удалось удалить товар')
        setConfirming(false)
      }
    })
  }

  const primaryVariant = product.variants[0]
  const firstVariantImage = primaryVariant?.images.find((img) => img.isMain) ?? primaryVariant?.images[0]
  const hasMultipleVariants = product.variants.length > 1

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
  const prices = product.variants.map((v) => v.price).filter((p): p is number => p !== null)
  const priceLabel =
    prices.length === 0
      ? 'Цена по запросу'
      : hasMultipleVariants && new Set(prices).size > 1
        ? `от ${formatPrice(Math.min(...prices))}`
        : formatPrice(prices[0])

  const primaryAttributeEntries = primaryVariant
    ? getVariantAttributeEntries(primaryVariant, product.category.attributes)
    : []

  return (
    <li className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(product.id)}
            className="shrink-0"
          />
          {firstVariantImage ? (
            <img
              src={firstVariantImage.url}
              alt=""
              className="w-10 h-10 object-cover rounded-md border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-md border border-gray-200 bg-gray-50 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-gray-500">
              <span>{product.category.name}</span>

              {!hasMultipleVariants && primaryVariant && (
                <span>Артикул: {primaryVariant.sku || '—'}</span>
              )}

              <span className={(hasMultipleVariants ? totalStock : primaryVariant?.stock ?? 0) > 0 ? 'text-green-600' : 'text-gray-400'}>
                {(hasMultipleVariants ? totalStock : primaryVariant?.stock ?? 0) > 0
                  ? `В наличии: ${hasMultipleVariants ? totalStock : primaryVariant?.stock}`
                  : 'Нет в наличии'}
              </span>

              <span className="text-gray-900 font-medium">{priceLabel}</span>

              {hasMultipleVariants && (
                <span>
                  {product.variants.length} {product.variants.length === 1 ? 'исполнение' : 'исполнений'}
                </span>
              )}
            </div>

            {!hasMultipleVariants && primaryAttributeEntries.length > 0 && (
              <dl className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs">
                {primaryAttributeEntries.map((e, i) => (
                  <div key={i} className="flex gap-1">
                    <dt className="text-gray-400">{e.label}:</dt>
                    <dd className="text-gray-700">{e.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {hasMultipleVariants && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-gray-400 hover:text-gray-600 p-1"
              title={expanded ? 'Свернуть' : 'Показать исполнения'}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          )}

          {confirming ? (
            <span className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Удалить?</span>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-600 font-medium hover:underline disabled:opacity-50"
              >
                Да
              </button>
              <button onClick={() => setConfirming(false)} className="text-gray-500 hover:underline">
                Отмена
              </button>
            </span>
          ) : (
            <>
              <button onClick={() => onEdit(product)} className="text-sm text-blue-600 hover:underline">
                Редактировать
              </button>
              <button
                onClick={() => {
                  setError(null)
                  setConfirming(true)
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Удалить
              </button>
            </>
          )}
        </div>
      </div>

      {hasMultipleVariants && expanded && (
        <div className="divide-y divide-gray-100">
          {product.variants.map((variant) => (
            <VariantDetails
              key={variant.id}
              variant={variant}
              categoryAttributes={product.category.attributes}
              onEdit={() => onEdit(product, variant.id)}
            />
          ))}
        </div>
      )}
    </li>
  )
}

export default function ProductList({
  products,
  categories,
  brands,
  tags,
}: {
  products: Product[]
  categories: Category[]
  brands: Brand[]
  tags: Tag[]
}) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedDescendantIds, setSelectedDescendantIds] = useState<string[] | null>(null)
  const [search, setSearch] = useState('')
  const [treeCollapsed, setTreeCollapsed] = useState(false)

  const editingProduct = products.find((p) => p.id === editingId) ?? null

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    products.forEach((p) => {
      counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1
    })
    return counts
  }, [products])

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleCategorySelect(id: string | null, descendantIds: string[] | null) {
    setSelectedCategoryId(id)
    setSelectedDescendantIds(descendantIds)
  }

  const filteredProducts = useMemo(() => {
    let result = products

    if (selectedDescendantIds) {
      result = result.filter((p) => selectedDescendantIds.includes(p.categoryId))
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((p) => {
        if (p.name.toLowerCase().includes(q)) return true
        return p.variants.some(
          (v) => v.sku?.toLowerCase().includes(q) || v.name?.toLowerCase().includes(q)
        )
      })
    }

    return result
  }, [products, selectedDescendantIds, search])

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.length === filteredProducts.length && filteredProducts.length > 0
        ? []
        : filteredProducts.map((p) => p.id)
    )
  }

    return (
    <div className="relative">
      <aside
        className={`fixed top-0 h-screen bg-white border-r border-gray-200 overflow-y-auto z-10 transition-all duration-200 ${
          treeCollapsed ? 'w-12' : 'w-56'
        }`}
        style={{ left: 'var(--admin-nav-width, 224px)' }}
      >
        <div className="flex items-center justify-between px-2 pt-[68px] pb-2">
          {!treeCollapsed && (
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Категории</span>
          )}
          <button
            onClick={() => setTreeCollapsed((v) => !v)}
            className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
            title={treeCollapsed ? 'Развернуть' : 'Свернуть'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {treeCollapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
            </svg>
          </button>
        </div>
        {!treeCollapsed && (
          <div className="px-3 pb-3">
            <CategoryTree
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={handleCategorySelect}
              productCounts={categoryCounts}
            />
          </div>
        )}
      </aside>

      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Товары</h1>

        <BulkActionsToolbar
          selectedIds={selectedIds}
          categories={categories}
          brands={brands}
          tags={tags}
          onClear={() => setSelectedIds([])}
        />

        <div className="flex items-center gap-4 mb-5 bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-3 shrink-0">
            {filteredProducts.length > 0 && (
              <input
                type="checkbox"
                checked={selectedIds.length === filteredProducts.length}
                onChange={toggleSelectAll}
              />
            )}
            <p className="text-sm text-gray-500 whitespace-nowrap">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'товар' : 'товаров'}
            </p>
          </div>

          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию или артикулу..."
              className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setCreating(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shrink-0"
          >
            + Добавить товар
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
            {products.length === 0 ? 'Товаров пока нет' : 'Ничего не найдено'}
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredProducts.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onEdit={(p, variantId) => {
                  setEditingId(p.id)
                  setEditingVariantId(variantId ?? null)
                }}
                selected={selectedIds.includes(product.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </ul>
        )}

        {creating && (
          <ProductCreateModal categories={categories} brands={brands} onClose={() => setCreating(false)} />
        )}

        {editingProduct && (
          <ProductEditModal
            product={editingProduct}
            categories={categories}
            brands={brands}
            tags={tags}
            initialVariantId={editingVariantId}
            onClose={() => {
              setEditingId(null)
              setEditingVariantId(null)
            }}
          />
        )}
      </div>
    </div>
  )
}