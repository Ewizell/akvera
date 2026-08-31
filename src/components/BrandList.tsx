'use client'

import { useState } from 'react'
import BrandCreateModal from './BrandCreateModal'
import BrandEditModal from './BrandEditModal'

type Brand = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
}

export default function BrandList({ brands }: { brands: Brand[] }) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingBrand = brands.find((b) => b.id === editingId) ?? null

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {brands.length} {brands.length === 1 ? 'бренд' : 'брендов'}
        </p>
        <button
          onClick={() => setCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + Добавить бренд
        </button>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 border border-dashed border-gray-300 bg-white rounded-lg">
          Брендов пока нет
        </div>
      ) : (
        <ul className="space-y-2">
          {brands.map((brand) => (
            <li
              key={brand.id}
              className="flex items-center justify-between gap-4 bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 min-w-0">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt=""
                    className="w-10 h-10 object-contain rounded-md bg-gray-50 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-gray-50 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{brand.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{brand.slug}</p>
                </div>
              </div>

              <button
                onClick={() => setEditingId(brand.id)}
                className="text-sm text-blue-600 hover:underline shrink-0"
              >
                Редактировать
              </button>
            </li>
          ))}
        </ul>
      )}

      {creating && <BrandCreateModal onClose={() => setCreating(false)} />}

      {editingBrand && (
        <BrandEditModal brand={editingBrand} onClose={() => setEditingId(null)} />
      )}
    </>
  )
}