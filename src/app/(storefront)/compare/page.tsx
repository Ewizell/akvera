'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCompare } from '@/lib/compare-context'
import { getCompareVariants, type CompareVariant } from '@/lib/actions/compare'

function formatAttrValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет'
  return String(value)
}

const ALL_TAB = '__all__'

export default function ComparePage() {
  const { variantIds, removeVariant, replaceVariant, clear } = useCompare()
  const [items, setItems] = useState<CompareVariant[]>([])
  const [isPending, startTransition] = useTransition()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [diffOnly, setDiffOnly] = useState(false)
  const [pinnedKeys, setPinnedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (variantIds.length === 0) {
      setItems([])
      return
    }
    startTransition(async () => {
      const data = await getCompareVariants(variantIds)
      setItems(data)
    })
  }, [variantIds])

  const categories = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>()
    for (const item of items) {
      const entry = map.get(item.categoryId)
      map.set(item.categoryId, { name: item.categoryName, count: (entry?.count ?? 0) + 1 })
    }
    return Array.from(map.entries())
  }, [items])

  useEffect(() => {
    if (categories.length === 0) return
    if (activeCategory !== ALL_TAB && !categories.some(([id]) => id === activeCategory)) {
      setActiveCategory(categories[0][0])
    }
  }, [categories, activeCategory])

  useEffect(() => {
    setPinnedKeys(new Set())
  }, [activeCategory])

  function togglePinned(key: string) {
    setPinnedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function clearCategory() {
    if (activeCategory === ALL_TAB) return
    for (const item of activeItems) removeVariant(item.variantId)
  }

  const activeItems = activeCategory === ALL_TAB ? items : items.filter((i) => i.categoryId === activeCategory)
  const attrSchema = activeItems[0]?.categoryAttributes ?? []

  const baseAttrs = diffOnly
    ? attrSchema.filter((attr) => {
        const values = activeItems.map((i) => formatAttrValue(i.attributes[attr.key]))
        return new Set(values).size > 1
      })
    : attrSchema

  const pinnedAttrs = baseAttrs.filter((a) => pinnedKeys.has(a.key))
  const restAttrs = baseAttrs.filter((a) => !pinnedKeys.has(a.key))

  if (variantIds.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold mb-3">Список сравнения пуст</h1>
        <p className="text-gray-500 mb-6">Добавьте товары из каталога, нажав «Сравнить» на карточке.</p>
        <Link href="/catalog" className="text-blue-600 hover:underline">
          Перейти в каталог
        </Link>
      </main>
    )
  }

  function renderAttrRow(attr: (typeof attrSchema)[number], pinned: boolean) {
    return (
      <tr key={attr.key} className="border-t border-[#e5e7e8]">
        <td className="py-3 pr-4 text-sm text-[#767d83]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pinned}
              onChange={() => togglePinned(attr.key)}
              className="w-[15px] h-[15px] accent-[#179146]"
            />
            <span>
              {attr.label}
              {attr.unit ? `, ${attr.unit}` : ''}
            </span>
          </label>
        </td>
        {activeItems.map((item) => (
          <td key={item.variantId} className="py-3 px-4 text-sm text-[#1c2126]">
            {formatAttrValue(item.attributes[attr.key])}
          </td>
        ))}
      </tr>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <nav className="mb-5 flex flex-wrap items-center gap-3 text-[14px] font-semibold uppercase tracking-[2px] text-[#179146]">
        <Link href="/" className="hover:opacity-80">Главная</Link>
        <span>/</span>
        <span>Сравнение</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[36px] font-bold leading-[1.2] text-[#0f172a]">Сравнение товаров</h1>
        <button onClick={clear} className="flex items-center gap-2 text-sm text-[#767d83] hover:text-[#1c2126]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
          Очистить сравнение
        </button>
      </div>

      {isPending && items.length === 0 ? (
        <p className="text-gray-500">Загрузка…</p>
      ) : (
        <>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-6 mb-6 border-b border-[#e5e7e8]">
              {categories.map(([id, { name, count }]) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`pb-3 text-sm font-manrope border-b-2 -mb-px whitespace-nowrap ${
                    activeCategory === id
                      ? 'border-[#179146] text-[#1c2126] font-medium'
                      : 'border-transparent text-[#767d83] hover:text-[#1c2126]'
                  }`}
                >
                  {name.toUpperCase()} {count}
                </button>
              ))}
              <button
                onClick={() => setActiveCategory(ALL_TAB)}
                className={`pb-3 text-sm font-manrope border-b-2 -mb-px whitespace-nowrap ${
                  activeCategory === ALL_TAB
                    ? 'border-[#179146] text-[#1c2126] font-medium'
                    : 'border-transparent text-[#767d83] hover:text-[#1c2126]'
                }`}
              >
                ВСЕ ТОВАРЫ {items.length}
              </button>
            </div>
          )}

          {activeCategory !== ALL_TAB && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-[#1c2126] cursor-pointer">
                  <input
                    type="radio"
                    name="compare-mode"
                    checked={!diffOnly}
                    onChange={() => setDiffOnly(false)}
                    className="accent-[#179146]"
                  />
                  Все характеристики
                </label>
                <label className="flex items-center gap-2 text-sm text-[#1c2126] cursor-pointer">
                  <input
                    type="radio"
                    name="compare-mode"
                    checked={diffOnly}
                    onChange={() => setDiffOnly(true)}
                    className="accent-[#179146]"
                  />
                  Показать различия
                </label>
              </div>
              <button onClick={clearCategory} className="flex items-center gap-2 text-sm text-[#767d83] hover:text-[#1c2126]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                </svg>
                Очистить категорию
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-sm text-gray-400 font-normal w-40 pb-4 align-bottom">&nbsp;</th>
                  {activeItems.map((item) => (
                    <th key={item.variantId} className="px-4 pb-4 align-bottom min-w-[220px]">
                      <div className="relative">
                        <button
                          onClick={() => removeVariant(item.variantId)}
                          aria-label="Убрать из сравнения"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border text-gray-400 hover:text-gray-700 text-sm"
                        >
                          ×
                        </button>
                        <Link href={`/product/${item.slug}`} className="block">
                          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.productName}
                                fill
                                className="object-contain p-4"
                                sizes="220px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                Нет фото
                              </div>
                            )}
                          </div>
                          {item.brandName && <p className="text-xs text-gray-400">{item.brandName}</p>}
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.productName}</p>
                        </Link>

                        {item.siblingVariants.length > 1 ? (
                          <select
                            value={item.variantId}
                            onChange={(e) => replaceVariant(item.variantId, e.target.value)}
                            className="mt-2 w-full text-xs border rounded px-2 py-1"
                          >
                            {item.siblingVariants.map((sv) => (
                              <option key={sv.id} value={sv.id}>
                                {sv.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="mt-2 text-xs text-gray-400">{item.variantName}</p>
                        )}

                        <p className="mt-2 text-base font-semibold">
                          {item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {activeCategory !== ALL_TAB && (
                <tbody>
                  {baseAttrs.length === 0 ? (
                    <tr>
                      <td colSpan={activeItems.length + 1} className="text-center text-gray-400 py-8">
                        {diffOnly ? 'Различий не найдено' : 'Для этой категории не заданы характеристики'}
                      </td>
                    </tr>
                  ) : (
                    <>
                      <tr>
                        <td colSpan={activeItems.length + 1} className="pt-6 pb-2">
                          <p className="text-base font-manrope font-bold text-[#1c2126]">Важные характеристики</p>
                          {pinnedAttrs.length === 0 && (
                            <p className="text-sm text-[#767d83] mt-1">
                              Отметьте галочкой характеристики ниже, чтобы закрепить их здесь
                            </p>
                          )}
                        </td>
                      </tr>
                      {pinnedAttrs.map((attr) => renderAttrRow(attr, true))}

                      <tr>
                        <td colSpan={activeItems.length + 1} className="pt-6 pb-2">
                          <p className="text-base font-manrope font-bold text-[#1c2126]">Характеристики</p>
                        </td>
                      </tr>
                      {restAttrs.map((attr) => renderAttrRow(attr, false))}
                    </>
                  )}
                </tbody>
              )}
            </table>
          </div>
        </>
      )}
    </main>
  )
}