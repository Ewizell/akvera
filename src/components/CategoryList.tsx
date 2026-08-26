'use client'

import { useState } from 'react'
import CategoryEditModal from './CategoryEditModal'
import CategoryCreateModal from './CategoryCreateModal'
import CategoryAttributesModal from './CategoryAttributesModal'

type Attribute = {
  id: string
  key: string
  label: string
  fieldType: string
  unit: string | null
}

type Category = {
  id: string
  name: string
  slug: string
  parentId: string | null
  attributes: Attribute[]
}

type CategoryWithChildren = Category & { children: CategoryWithChildren[] }

function buildTree(categories: Category[], parentId: string | null = null): CategoryWithChildren[] {
  return categories
    .filter((c) => c.parentId === parentId)
    .map((c) => ({ ...c, children: buildTree(categories, c.id) }))
}

function CategoryRow({
  category,
  depth,
  onEdit,
  onAttributes,
}: {
  category: CategoryWithChildren
  depth: number
  onEdit: (c: Category) => void
  onAttributes: (c: Category) => void
}) {
  return (
    <>
      <tr className="border-b">
        <td className="py-3" style={{ paddingLeft: `${depth * 24 + 12}px` }}>
          {category.name}
        </td>
        <td className="py-3 text-gray-500">{category.slug}</td>
        <td className="py-3 text-right space-x-3">
          <button onClick={() => onAttributes(category)} className="text-gray-600 hover:underline">
            Атрибуты ({category.attributes.length})
          </button>
          <button onClick={() => onEdit(category)} className="text-blue-600 hover:underline">
            Редактировать
          </button>
        </td>
      </tr>
      {category.children.map((child) => (
        <CategoryRow key={child.id} category={child} depth={depth + 1} onEdit={onEdit} onAttributes={onAttributes} />
      ))}
    </>
  )
}

export default function CategoryList({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [attributesFor, setAttributesFor] = useState<Category | null>(null)
  const tree = buildTree(categories)

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Добавить категорию
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left text-sm text-gray-500">
            <th className="py-2">Название</th>
            <th className="py-2">Slug</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {tree.map((c) => (
            <CategoryRow
              key={c.id}
              category={c}
              depth={0}
              onEdit={setEditing}
              onAttributes={setAttributesFor}
            />
          ))}
        </tbody>
      </table>

      {editing && (
        <CategoryEditModal
          category={editing}
          allCategories={categories}
          onClose={() => setEditing(null)}
        />
      )}

      {creating && (
        <CategoryCreateModal
          allCategories={categories}
          onClose={() => setCreating(false)}
        />
      )}

      {attributesFor && (
        <CategoryAttributesModal
          categoryId={attributesFor.id}
          categoryName={attributesFor.name}
          attributes={
            categories.find((c) => c.id === attributesFor.id)?.attributes ?? []
          }
          onClose={() => setAttributesFor(null)}
        />
      )}
    </>
  )
}