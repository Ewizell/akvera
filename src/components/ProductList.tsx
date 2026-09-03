'use client'

import { useState, useTransition, useMemo } from 'react'
import ProductCreateModal from './ProductCreateModal'
import ProductEditModal from './ProductEditModal'
import { deleteProduct } from '@/lib/actions/product'
import BulkActionsToolbar from './BulkActionsToolbar'
import CategoryTree from './CategoryTree'

type Variant = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  images: { url: string; isMain: boolean }[]
}

type Product = {
  id: string
  name: string
  categoryId: string
  brandId: string | null
  description: string | null
  category: { name: string }
  variants: Variant[]
  tagIds: string[]
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
  onEdit: (p: Product) => void
  selected: boolean
  onToggleSelect: (id: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProduct(product.id)
      if (!result.success) {
        setError(result.error ?? 'Не удалось удалить товар')
        setConfirming(false)
      }
    })
  }

  const firstVariantImage = product.variants[0]?.images.find((img) => img.isMain) ?? product.variants[0]?.images[0]

  return (
    <li className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors">
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
          <p className="text-xs text-gray-500 mt-0.5">
            {product.category.name} · {product.variants.length}{' '}
            {product.variants.length === 1 ? 'исполнение' : 'исполнений'}
          </p>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
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
                onEdit={(p) => setEditingId(p.id)}
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
            onClose={() => setEditingId(null)}
          />
        )}
      </div>
    </div>
  )
}