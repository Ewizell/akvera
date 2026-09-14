'use client'

import { useState } from 'react'

const inputCls =
  'h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15'

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
    setItems((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    )
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const target = index + direction

      if (target < 0 || target >= prev.length) {
        return prev
      }

      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]

      return next
    })
  }

  return (
    <div>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(items)}
      />

      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-xl bg-white p-1.5 ring-1 ring-black/[0.04]"
          >
            <span className="flex h-9 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4f5f7] text-[11px] font-semibold text-[#8a939f]">
              {i + 1}
            </span>

            <input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={placeholder}
              className={inputCls}
            />

            <button
              type="button"
              onClick={() => moveItem(i, -1)}
              disabled={i === 0}
              title="Вверх"
              aria-label="Переместить вверх"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#8a939f] transition hover:bg-[#f4f5f7] hover:text-[#28394c] disabled:cursor-not-allowed disabled:opacity-25"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => moveItem(i, 1)}
              disabled={i === items.length - 1}
              title="Вниз"
              aria-label="Переместить вниз"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#8a939f] transition hover:bg-[#f4f5f7] hover:text-[#28394c] disabled:cursor-not-allowed disabled:opacity-25"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => removeItem(i)}
              title="Удалить"
              aria-label="Удалить пункт"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#a1a8b3] transition hover:bg-[#fff7f7] hover:text-[#b33a3a]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, ''])}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-sm font-medium text-[#28394c] ring-1 ring-black/[0.05] transition hover:bg-[#f4f5f7]"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#28394c] text-sm leading-none text-white">
          +
        </span>
        Добавить пункт
      </button>
    </div>
  )
}
