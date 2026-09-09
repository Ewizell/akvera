'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function BrandSelect({
  brands,
  value,
  onChange,
}: {
  brands: { id: string; name: string; slug: string }[]
  value?: string
  onChange: (slug: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const currentLabel = brands.find((b) => b.slug === value)?.name ?? 'Все бренды'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between border rounded px-2 py-1.5 text-gray-900 bg-white hover:bg-gray-50"
      >
        <span className="truncate">{currentLabel}</span>
        <span className={`text-xs text-gray-400 transition-transform shrink-0 ml-1 ${open ? 'rotate-180' : ''}`}>
          ⌄
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-full bg-white border rounded-lg shadow-lg py-1 z-20 max-h-64 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
              className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${
                !value ? 'text-black font-medium' : 'text-gray-700'
              }`}
            >
              Все бренды
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  onChange(b.slug)
                  setOpen(false)
                }}
                className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${
                  value === b.slug ? 'text-black font-medium' : 'text-gray-700'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export type CategoryNavItem = {
  id: string
  name: string
  slug: string
  href: string
  productCount: number
}

export type CategoryNavData = {
  allProductsLink: { label: string; href: string }
  items: CategoryNavItem[]
  activeSlug: string | null
}

export type AttributeFilterOption =
  | { key: string; label: string; unit: string | null; fieldType: 'number'; min: number; max: number }
  | { key: string; label: string; unit: string | null; fieldType: 'select'; options: string[] }

type Brand = { id: string; name: string; slug: string }

export type CategoryTreeNode = {
  id: string
  name: string
  slug: string
  productCount: number
  allProductsHref: string
  ownProductsHref: string | null
  children: CategoryTreeNode[]
}

function CategoryTreeItem({ node, depth = 0 }: { node: CategoryTreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth === 0)
  const hasChildren = node.children.length > 0

  return (
    <li>
      <div className="flex items-center gap-1">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-gray-400 hover:text-gray-600 shrink-0 w-4 text-xs"
          >
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <Link href={node.allProductsHref} className="text-gray-700 hover:underline truncate text-sm">
          {node.name}
        </Link>
        <span className="text-gray-400 text-xs shrink-0">({node.productCount})</span>
      </div>

      {node.ownProductsHref && (
        <Link href={node.ownProductsHref} className="ml-5 text-xs text-blue-600 hover:underline">
          Товары этого раздела
        </Link>
      )}

      {hasChildren && open && (
        <ul className="ml-4 mt-1 space-y-1.5 border-l border-gray-100 pl-2">
          {node.children.map((child) => (
            <CategoryTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

export function CategoryFilterSidebar({
  basePath,
  categoryNav,
  categoryTree,
  priceRange,
  brands,
  attributeOptions,
  q,
  brand,
  tags,
  sort,
  priceMin,
  priceMax,
  inStock,
  attrValues,
  attrRanges,
}: {
  basePath: string
  categoryNav?: CategoryNavData
  categoryTree?: CategoryTreeNode
  priceRange: { min: number; max: number }
  brands: Brand[]
  attributeOptions: AttributeFilterOption[]
  q?: string
  brand?: string
  tags?: string[]
  sort?: string
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  attrValues: Record<string, string[]>
  attrRanges: Record<string, { min?: number; max?: number }>
}) {
  const router = useRouter()

  const [priceFrom, setPriceFrom] = useState(priceMin?.toString() ?? '')
  const [priceTo, setPriceTo] = useState(priceMax?.toString() ?? '')
  const [sliderFrom, setSliderFrom] = useState(priceMin ?? priceRange.min)
  const [sliderTo, setSliderTo] = useState(priceMax ?? priceRange.max)

  function buildHref(overrides: {
    brand?: string | null
    priceMin?: number | null
    priceMax?: number | null
    inStock?: boolean | null
    attrValues?: Record<string, string[]>
    attrRanges?: Record<string, { min?: number; max?: number }>
  }) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)

    const nextBrand = overrides.brand !== undefined ? overrides.brand : brand
    if (nextBrand) params.set('brand', nextBrand)

    if (tags && tags.length > 0) params.set('tags', tags.join(','))
    if (sort) params.set('sort', sort)

    const nextPriceMin = overrides.priceMin !== undefined ? overrides.priceMin : priceMin
    const nextPriceMax = overrides.priceMax !== undefined ? overrides.priceMax : priceMax
    if (nextPriceMin !== null && nextPriceMin !== undefined) params.set('priceMin', String(nextPriceMin))
    if (nextPriceMax !== null && nextPriceMax !== undefined) params.set('priceMax', String(nextPriceMax))

    const nextInStock = overrides.inStock !== undefined ? overrides.inStock : inStock
    if (nextInStock) params.set('stock', '1')

    const nextAttrValues = overrides.attrValues ?? attrValues
    for (const [key, values] of Object.entries(nextAttrValues)) {
      if (values.length > 0) params.set(`attr_${key}`, values.join(','))
    }

    const nextAttrRanges = overrides.attrRanges ?? attrRanges
    for (const [key, range] of Object.entries(nextAttrRanges)) {
      if (range.min !== undefined) params.set(`attr_${key}_min`, String(range.min))
      if (range.max !== undefined) params.set(`attr_${key}_max`, String(range.max))
    }

    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  function applyPriceInputs() {
    const from = priceFrom ? Number(priceFrom) : null
    const to = priceTo ? Number(priceTo) : null
    router.push(buildHref({ priceMin: from, priceMax: to }))
  }

  function applySlider(from: number, to: number) {
    setSliderFrom(from)
    setSliderTo(to)
    setPriceFrom(String(from))
    setPriceTo(String(to))
  }

  function toggleAttrValue(key: string, value: string) {
    const current = attrValues[key] ?? []
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    router.push(buildHref({ attrValues: { ...attrValues, [key]: next } }))
  }

  return (
    <div className="space-y-6 text-sm">
      {/* Категории — плоский список (лист) */}
      {categoryNav && (
        <div>
          <Link
            href={categoryNav.allProductsLink.href}
            className={`block mb-2 ${
              categoryNav.activeSlug === null ? 'font-semibold text-black' : 'text-gray-600 hover:underline'
            }`}
          >
            {categoryNav.allProductsLink.label}
          </Link>
          <ul className="space-y-1">
            {categoryNav.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={
                    item.slug === categoryNav.activeSlug
                      ? 'font-semibold text-black'
                      : 'text-gray-600 hover:underline'
                  }
                >
                  {item.name}
                </Link>
                <span className="text-gray-400 text-xs"> ({item.productCount})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Категории — раскрывающееся дерево (режим "все товары") */}
      {categoryTree && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Категории</h3>
          <ul className="space-y-1.5">
            <CategoryTreeItem node={categoryTree} />
          </ul>
        </div>
      )}

      {/* Цена */}
      {priceRange.max > priceRange.min && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Цена, ₽</h3>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              onBlur={applyPriceInputs}
              placeholder={String(priceRange.min)}
              className="w-full border rounded px-2 py-1 text-gray-900"
            />
            <span className="text-gray-400">—</span>
            <input
              type="number"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              onBlur={applyPriceInputs}
              placeholder={String(priceRange.max)}
              className="w-full border rounded px-2 py-1 text-gray-900"
            />
          </div>
          <div className="relative h-1 bg-gray-200 rounded">
            <div
              className="absolute h-1 bg-blue-600 rounded"
              style={{
                left: `${((sliderFrom - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                right: `${100 - ((sliderTo - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
              }}
            />
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={sliderFrom}
              onChange={(e) => applySlider(Math.min(Number(e.target.value), sliderTo), sliderTo)}
              onMouseUp={applyPriceInputs}
              onTouchEnd={applyPriceInputs}
              className="absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={sliderTo}
              onChange={(e) => applySlider(sliderFrom, Math.max(Number(e.target.value), sliderFrom))}
              onMouseUp={applyPriceInputs}
              onTouchEnd={applyPriceInputs}
              className="absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Бренд */}
      {brands.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Бренд</h3>
          <BrandSelect brands={brands} value={brand} onChange={(slug) => router.push(buildHref({ brand: slug }))} />
        </div>
      )}

      {/* Наличие */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Наличие</h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="stock"
              checked={!inStock}
              onChange={() => router.push(buildHref({ inStock: null }))}
              className="peer sr-only"
            />
            <span className="relative w-4 h-4 shrink-0 rounded-full border border-gray-300 peer-checked:border-blue-600 transition-colors">
              <span className="absolute inset-0.5 rounded-full bg-blue-600 scale-0 peer-checked:scale-100 transition-transform" />
            </span>
            <span className="text-gray-900">Все товары</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="stock"
              checked={!!inStock}
              onChange={() => router.push(buildHref({ inStock: true }))}
              className="peer sr-only"
            />
            <span className="relative w-4 h-4 shrink-0 rounded-full border border-gray-300 peer-checked:border-blue-600 transition-colors">
              <span className="absolute inset-0.5 rounded-full bg-blue-600 scale-0 peer-checked:scale-100 transition-transform" />
            </span>
            <span className="text-gray-900">Только в наличии</span>
          </label>
        </div>
      </div>

      {/* Динамические атрибуты категории */}
      {attributeOptions.map((attr) => (
        <div key={attr.key}>
          <h3 className="font-semibold text-gray-900 mb-2">
            {attr.label}
            {attr.fieldType === 'number' && attr.unit ? `, ${attr.unit}` : ''}
          </h3>

          {attr.options.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {attr.options.map((opt) => {
                const checked = (attrValues[attr.key] ?? []).includes(opt)
                return (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAttrValue(attr.key, opt)}
                      className="sr-only"
                    />
                    <span
                      className={`flex items-center justify-center w-4 h-4 shrink-0 rounded border transition-colors ${
                        checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}
                    >
                      {checked && (
                        <svg viewBox="0 0 16 16" fill="none" className="w-full h-full p-0.5 text-white">
                          <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-gray-900">{opt}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}