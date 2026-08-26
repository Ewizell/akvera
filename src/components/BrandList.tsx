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
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Добавить бренд
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left text-sm text-gray-500">
            <th className="py-2"></th>
            <th className="py-2">Название</th>
            <th className="py-2">Slug</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id} className="border-b">
              <td className="py-3">
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt="" className="w-8 h-8 object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded bg-gray-100" />
                )}
              </td>
              <td className="py-3">{brand.name}</td>
              <td className="py-3 text-gray-500">{brand.slug}</td>
              <td className="py-3 text-right">
                <button
                  onClick={() => setEditingId(brand.id)}
                  className="text-blue-600 hover:underline"
                >
                  Редактировать
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {creating && <BrandCreateModal onClose={() => setCreating(false)} />}

      {editingBrand && (
        <BrandEditModal brand={editingBrand} onClose={() => setEditingId(null)} />
      )}
    </>
  )
}