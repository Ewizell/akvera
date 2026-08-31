'use client'

import { useState, useTransition } from 'react'
import ProductCreateModal from './ProductCreateModal'
import ProductEditModal from './ProductEditModal'
import { deleteProduct } from '@/lib/actions/product'

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

type Category = { id: string; name: string }
type Brand = { id: string; name: string }
type Tag = { id: string; name: string }

function ProductRow({
  product,
  onEdit,
}: {
  product: Product
  onEdit: (p: Product) => void
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

  const editingProduct = products.find((p) => p.id === editingId) ?? null

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {products.length} {products.length === 1 ? 'товар' : 'товаров'}
        </p>
        <button
          onClick={() => setCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + Добавить товар
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
          Товаров пока нет
        </div>
      ) : (
        <ul className="space-y-2">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} onEdit={(p) => setEditingId(p.id)} />
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
    </>
  )
}