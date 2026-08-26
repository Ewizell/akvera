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
}

type Category = { id: string; name: string }
type Brand = { id: string; name: string }

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
    <tr className="border-b">
      <td className="py-3">
        <div className="flex items-center gap-2">
          {firstVariantImage ? (
            <img src={firstVariantImage.url} alt="" className="w-8 h-8 object-cover rounded border" />
          ) : (
            <div className="w-8 h-8 rounded border bg-gray-100" />
          )}
          {product.name}
        </div>
      </td>
      <td className="py-3 text-gray-500">{product.category.name}</td>
      <td className="py-3">{product.variants.length}</td>
      <td className="py-3 text-right">
        {error && <span className="text-xs text-red-600 mr-3">{error}</span>}
        <button onClick={() => onEdit(product)} className="text-blue-600 hover:underline mr-3">
          Редактировать
        </button>
        {!confirming ? (
          <button
            onClick={() => {
              setError(null)
              setConfirming(true)
            }}
            className="text-red-600 hover:underline"
          >
            Удалить
          </button>
        ) : (
          <span className="text-sm">
            Точно?{' '}
            <button onClick={handleDelete} disabled={isPending} className="text-red-600 font-medium hover:underline">
              Да
            </button>{' '}
            <button onClick={() => setConfirming(false)} className="text-gray-500 hover:underline">
              Отмена
            </button>
          </span>
        )}
      </td>
    </tr>
  )
}

export default function ProductList({
  products,
  categories,
  brands,
}: {
  products: Product[]
  categories: Category[]
  brands: Brand[]
}) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingProduct = products.find((p) => p.id === editingId) ?? null

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Добавить товар
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left text-sm text-gray-500">
            <th className="py-2">Название</th>
            <th className="py-2">Категория</th>
            <th className="py-2">Вариантов</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow key={product.id} product={product} onEdit={(p) => setEditingId(p.id)} />
          ))}
        </tbody>
      </table>

      {creating && (
        <ProductCreateModal categories={categories} brands={brands} onClose={() => setCreating(false)} />
      )}

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          brands={brands}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  )
}