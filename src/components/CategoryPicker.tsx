'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

export type PickerCategory = {
  id: string
  name: string
  parentId: string | null
}

type TreeNode = PickerCategory & { children: TreeNode[] }

export default function CategoryPicker({
  categories,
  primaryId,
  extraIds,
  onChange,
}: {
  categories: PickerCategory[]
  primaryId: string
  extraIds: string[]
  onChange: (primaryId: string, extraIds: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [draftPrimary, setDraftPrimary] = useState(primaryId)
  const [draftExtras, setDraftExtras] = useState<string[]>(extraIds)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')

  const byId = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  )

  const roots = useMemo(() => {
    const nodes = new Map<string, TreeNode>(
      categories.map((c) => [c.id, { ...c, children: [] }])
    )
    const result: TreeNode[] = []
    for (const node of nodes.values()) {
      const parent = node.parentId ? nodes.get(node.parentId) : undefined
      if (parent) parent.children.push(node)
      else result.push(node)
    }
    const sortTree = (list: TreeNode[]) => {
      list.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
      list.forEach((n) => sortTree(n.children))
    }
    sortTree(result)
    return result
  }, [categories])

  function pathOf(id: string) {
    const names: string[] = []
    const seen = new Set<string>()
    let cur = byId.get(id)
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id)
      names.unshift(cur.name)
      cur = cur.parentId ? byId.get(cur.parentId) : undefined
    }
    return names.join(' / ')
  }

  function openPicker() {
    setDraftPrimary(primaryId)
    setDraftExtras(extraIds.filter((id) => id !== primaryId))
    setQuery('')

    // раскрываем ветки, в которых уже есть выбранные категории
    const toOpen = new Set<string>()
    for (const id of [primaryId, ...extraIds]) {
      let cur = byId.get(id)
      while (cur?.parentId) {
        toOpen.add(cur.parentId)
        cur = byId.get(cur.parentId)
      }
    }
    setExpanded(toOpen)
    setOpen(true)
  }

  // Escape закрывает только попап, а не всю модалку товара
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open])

  function selectPrimary(id: string) {
    setDraftPrimary(id)
    setDraftExtras((prev) => prev.filter((x) => x !== id))
  }

  function clearPrimary() {
    setDraftPrimary('')
    setDraftExtras([])
  }

  function toggleExtra(id: string) {
    if (id === draftPrimary) return
    setDraftExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function expandAll() {
    const parents = new Set(
      categories.map((c) => c.parentId).filter((id): id is string => Boolean(id))
    )
    setExpanded(parents)
  }

  function apply() {
    onChange(draftPrimary, draftPrimary ? draftExtras : [])
    setOpen(false)
  }

  const q = query.trim().toLowerCase()

  function matches(node: TreeNode): boolean {
    if (!q) return true
    return node.name.toLowerCase().includes(q) || node.children.some(matches)
  }

  function renderNode(node: TreeNode, depth: number): React.ReactNode {
    if (!matches(node)) return null

    const hasChildren = node.children.length > 0
    const isOpen = q ? true : expanded.has(node.id)
    const isPrimary = draftPrimary === node.id
    const isExtra = draftExtras.includes(node.id)
    const extrasLocked = isPrimary || !draftPrimary

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 rounded-xl py-1.5 pr-2 transition ${
            isPrimary ? 'bg-[#eef1f4]' : 'hover:bg-[#f4f5f7]'
          }`}
          style={{ paddingLeft: 6 + depth * 20 }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(node.id)}
              aria-label={isOpen ? 'Свернуть' : 'Развернуть'}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#8b949f] hover:bg-white hover:text-[#28394c]"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 5l5 5-5 5" />
              </svg>
            </button>
          ) : (
            <span className="h-6 w-6 shrink-0" />
          )}

          <span
            className={`min-w-0 flex-1 truncate text-sm ${
              isPrimary || isExtra
                ? 'font-semibold text-[#28313d]'
                : 'text-[#5f6976]'
            }`}
          >
            {node.name}
          </span>

          <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-[#5f6976]">
            <input
              type="radio"
              checked={isPrimary}
              onChange={() => selectPrimary(node.id)}
              className="h-4 w-4 border-[#cbd1d8] text-[#28394c] focus:ring-[#28394c]/20"
            />
            Основная
          </label>

          <label
            className={`flex w-[62px] shrink-0 items-center gap-1.5 text-xs ${
              extrasLocked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer text-[#5f6976]'
            }`}
          >
            <input
              type="checkbox"
              checked={isExtra}
              disabled={extrasLocked}
              onChange={() => toggleExtra(node.id)}
              className="h-4 w-4 rounded border-[#cbd1d8] text-[#28394c] focus:ring-[#28394c]/20"
            />
            Доп.
          </label>
        </div>

        {hasChildren &&
          isOpen &&
          node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  const visibleExtras = extraIds.filter((id) => id !== primaryId)

  return (
    <div className="relative">
      <input type="hidden" name="categoryId" value={primaryId} />
      {visibleExtras.map((id) => (
        <input key={id} type="hidden" name="extraCategoryIds" value={id} />
      ))}



      <button
        type="button"
        onClick={openPicker}
        className="w-full cursor-pointer rounded-xl bg-[#f4f5f7] px-3.5 py-3 text-left ring-1 ring-transparent transition hover:bg-[#eef1f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28394c]/20"
      >
        <div className="text-[10px] font-semibold uppercase tracking-wide text-[#8b949f]">
          Основная
        </div>
        <div
          className={`mt-0.5 text-sm ${
            primaryId ? 'font-medium text-[#28313d]' : 'text-[#a1a8b3]'
          }`}
        >
          {primaryId ? pathOf(primaryId) : 'Без категории'}
        </div>

        {visibleExtras.length > 0 && (
          <>
            <div className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[#8b949f]">
              Дополнительные ({visibleExtras.length})
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {visibleExtras.map((id) => (
                <span
                  key={id}
                  className="rounded-md bg-white px-2 py-1 text-[11px] text-[#5f6976] ring-1 ring-black/[0.05]"
                >
                  {pathOf(id)}
                </span>
              ))}
            </div>
          </>
        )}
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-[#18212b]/50 p-4 backdrop-blur-[3px]"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false)
            }}
          >
            <div className="flex max-h-[85vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-[#f7f8fa] shadow-2xl ring-1 ring-black/[0.08]">
              <div className="border-b border-[#e7eaed] bg-white px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-[#28313d]">
                      Категории товара
                    </h3>
                    <p className="mt-0.5 text-xs leading-5 text-[#8b949f]">
                      «Основная» задаёт характеристики, хлебные крошки и адрес страницы.
                      «Доп.» — товар дополнительно показывается и в этих категориях.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Закрыть"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#8b949f] transition hover:bg-[#f4f5f7] hover:text-[#28313d]"
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.6">
                      <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
                    </svg>
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.preventDefault()
                    }}
                    placeholder="Поиск категории"
                    autoFocus
                    className="h-10 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15"
                  />
                  <button
                    type="button"
                    onClick={expandAll}
                    className="h-10 shrink-0 rounded-xl bg-[#f4f5f7] px-3 text-xs font-semibold text-[#4f5a67] hover:bg-[#e9ecef]"
                  >
                    Развернуть
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpanded(new Set())}
                    className="h-10 shrink-0 rounded-xl bg-[#f4f5f7] px-3 text-xs font-semibold text-[#4f5a67] hover:bg-[#e9ecef]"
                  >
                    Свернуть
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <label
                  className={`mb-1 flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm transition ${
                    !draftPrimary
                      ? 'bg-[#eef1f4] font-semibold text-[#28313d]'
                      : 'text-[#5f6976] hover:bg-[#f4f5f7]'
                  }`}
                >
                  <input
                    type="radio"
                    checked={!draftPrimary}
                    onChange={clearPrimary}
                    className="h-4 w-4 border-[#cbd1d8] text-[#28394c] focus:ring-[#28394c]/20"
                  />
                  Без категории
                  <span className="text-xs font-normal text-[#8b949f]">
                    (доп. категории доступны только при выбранной основной)
                  </span>
                </label>

                {roots.some(matches) ? (
                  roots.map((node) => renderNode(node, 0))
                ) : (
                  <p className="px-3 py-6 text-center text-sm text-[#8b949f]">
                    Ничего не найдено
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[#e7eaed] bg-white px-5 py-4">
                <div className="min-w-0 text-xs text-[#8b949f]">
                  <div className="truncate">
                    Основная:{' '}
                    <span className="font-semibold text-[#5f6976]">
                      {draftPrimary ? pathOf(draftPrimary) : 'без категории'}
                    </span>
                  </div>
                  <div>
                    Дополнительных:{' '}
                    <span className="font-semibold text-[#5f6976]">
                      {draftExtras.length}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-[#f4f5f7] px-3.5 text-sm font-semibold text-[#4f5a67] transition hover:bg-[#e9ecef]"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={apply}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-[#28394c] px-4 text-sm font-semibold text-white transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Готово
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}