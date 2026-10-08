'use client'

import { useState } from 'react'

type Cat = { id: string; name: string }

const inputCls =
  'h-10 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition-[background-color,box-shadow] duration-150 placeholder:text-[#a1a8b3] hover:bg-[#f1f3f5] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15'

export default function CategoryMultiSelect({
  categories,
  initial = [],
  excludeId,
  name = 'extraCategoryIds',
}: {
  categories: Cat[]
  initial?: string[]
  excludeId?: string // основная категория — в дополнительных не показываем
  name?: string
}) {
  const [selected, setSelected] = useState<string[]>(initial)
  const [query, setQuery] = useState('')

  const available = categories.filter((c) => c.id !== excludeId)
  const visible = available.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase())
  )
  const effective = selected.filter((id) => id !== excludeId)

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  return (
    <div className="space-y-2">
      {effective.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск категории"
        className={inputCls}
      />

      <div className="max-h-48 overflow-y-auto rounded-xl bg-[#f4f5f7] p-2">
        {visible.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-[#8b949f]">Ничего не найдено</p>
        )}
        {visible.map((c) => (
          <label
            key={c.id}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-[#4f5a67] hover:bg-white"
          >
            <input
              type="checkbox"
              checked={selected.includes(c.id)}
              onChange={() => toggle(c.id)}
              className="h-4 w-4 rounded border-[#cbd1d8] text-[#28394c] focus:ring-[#28394c]/20"
            />
            {c.name}
          </label>
        ))}
      </div>

      <p className="text-[11px] text-[#969faa]">
        Выбрано дополнительных: {effective.length}
      </p>
    </div>
  )
}