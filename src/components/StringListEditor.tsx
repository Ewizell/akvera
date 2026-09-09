'use client'

import { useState } from 'react'

export default function StringListEditor({
  name,
  initial,
  placeholder,
}: {
  name: string
  initial?: string[]
  placeholder?: string
}) {
  const [items, setItems] = useState<string[]>(initial ?? [])

  function updateItem(index: number, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-4 shrink-0 text-right">{i + 1}</span>
            <input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => moveItem(i, -1)}
              disabled={i === 0}
              className="text-gray-400 hover:text-gray-700 disabled:opacity-30 shrink-0"
              title="Вверх"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveItem(i, 1)}
              disabled={i === items.length - 1}
              className="text-gray-400 hover:text-gray-700 disabled:opacity-30 shrink-0"
              title="Вниз"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-red-600 hover:text-red-800 text-sm px-1 shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, ''])}
        className="text-sm text-blue-600 hover:underline mt-2"
      >
        + Добавить пункт
      </button>
    </div>
  )
}