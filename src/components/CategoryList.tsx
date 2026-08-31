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
      <li
        className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors"
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {depth > 0 && <span className="text-gray-300 shrink-0">└</span>}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{category.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{category.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => onAttributes(category)} className="text-sm text-gray-600 hover:underline">
            Атрибуты ({category.attributes.length})
          </button>
          <button onClick={() => onEdit(category)} className="text-sm text-blue-600 hover:underline">
            Редактировать
          </button>
        </div>
      </li>
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
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {categories.length} {categories.length === 1 ? 'категория' : 'категорий'}
        </p>
        <button
          onClick={() => setCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + Добавить категорию
        </button>
      </div>

      {tree.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
          Категорий пока нет
        </div>
      ) : (
        <ul className="space-y-2">
          {tree.map((c) => (
            <CategoryRow
              key={c.id}
              category={c}
              depth={0}
              onEdit={setEditing}
              onAttributes={setAttributesFor}
            />
          ))}
        </ul>
      )}

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