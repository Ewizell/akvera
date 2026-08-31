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

export default function ComparePage() {
  const { variantIds, removeVariant, replaceVariant, clear } = useCompare()
  const [items, setItems] = useState<CompareVariant[]>([])
  const [isPending, startTransition] = useTransition()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [diffOnly, setDiffOnly] = useState(false)

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
    const map = new Map<string, string>()
    for (const item of items) map.set(item.categoryId, item.categoryName)
    return Array.from(map.entries())
  }, [items])

  useEffect(() => {
    if (categories.length === 0) return
    if (!categories.some(([id]) => id === activeCategory)) {
      setActiveCategory(categories[0][0])
    }
  }, [categories, activeCategory])

  const activeItems = items.filter((i) => i.categoryId === activeCategory)
  const attrSchema = activeItems[0]?.categoryAttributes ?? []

  const visibleAttrs = diffOnly
    ? attrSchema.filter((attr) => {
        const values = activeItems.map((i) => formatAttrValue(i.attributes[attr.key]))
        return new Set(values).size > 1
      })
    : attrSchema

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

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Сравнение товаров</h1>
        <button onClick={clear} className="text-sm text-gray-500 hover:underline">
          Очистить всё
        </button>
      </div>

      {isPending && items.length === 0 ? (
        <p className="text-gray-500">Загрузка…</p>
      ) : (
        <>
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6 border-b">
              {categories.map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`px-4 py-2 text-sm border-b-2 -mb-px ${
                    activeCategory === id
                      ? 'border-blue-600 text-blue-600 font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={diffOnly}
                onChange={(e) => setDiffOnly(e.target.checked)}
              />
              Показать только различия
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-sm text-gray-400 font-normal w-40 pb-4 align-bottom">
                    &nbsp;
                  </th>
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
                          {item.brandName && (
                            <p className="text-xs text-gray-400">{item.brandName}</p>
                          )}
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.productName}
                          </p>
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
              <tbody>
                {visibleAttrs.length === 0 ? (
                  <tr>
                    <td colSpan={activeItems.length + 1} className="text-center text-gray-400 py-8">
                      {diffOnly ? 'Различий не найдено' : 'Для этой категории не заданы характеристики'}
                    </td>
                  </tr>
                ) : (
                  visibleAttrs.map((attr) => (
                    <tr key={attr.key} className="border-t">
                      <td className="py-3 text-sm text-gray-500 pr-4">
                        {attr.label}
                        {attr.unit ? `, ${attr.unit}` : ''}
                      </td>
                      {activeItems.map((item) => (
                        <td key={item.variantId} className="py-3 px-4 text-sm">
                          {formatAttrValue(item.attributes[attr.key])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}