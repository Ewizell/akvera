'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { AttributeFilterOption } from '@/lib/catalog-query'

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
        className="w-full h-[35px] flex items-center justify-between bg-[#e9e9e9] rounded-xl px-2.5 text-sm font-manrope font-medium text-[#1c2126] hover:bg-[#e0e0e0]"
      >
        <span className="truncate underline decoration-from-font">{currentLabel}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`shrink-0 ml-1 transition-transform text-[#1c2126] ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20 max-h-64 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
              className={`block w-full text-left px-3 py-1.5 text-sm font-manrope hover:bg-gray-50 ${
                !value ? 'text-[#1c2126] font-medium' : 'text-[#767d83]'
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
                className={`block w-full text-left px-3 py-1.5 text-sm font-manrope hover:bg-gray-50 ${
                  value === b.slug ? 'text-[#1c2126] font-medium' : 'text-[#767d83]'
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

type Brand = { id: string; name: string; slug: string }

export type CategoryChildrenData = {
  showAllHref: string | null
  items: { id: string; name: string; slug: string; href: string; productCount: number }[]
  activeSlug: string | null
}



export function CategoryFilterSidebar({
  basePath,
  categoryNav,
  categoryChildren,
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
  categoryChildren?: CategoryChildrenData
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
    
    <div className="w-[221px] divide-y divide-[#d9d9d9]">
      {/* Категории — плоский список (лист) */}
      
      {categoryNav && (
        <div className="pb-6">
          <h3 className="font-manrope font-bold text-base text-[#1c2126] mb-2">Категория</h3>
          <div className="flex flex-col gap-2">
            <Link href={categoryNav.allProductsLink.href} className="flex items-start gap-1.5">
              <span
                className={`w-[3px] h-[17px] rounded-xl shrink-0 ${
                  categoryNav.activeSlug === null ? 'bg-[#179146]' : 'bg-[#969393]'
                }`}
              />
              <span
                className={`font-manrope text-sm text-[#1c2126] ${
                  categoryNav.activeSlug === null ? 'font-medium' : 'font-normal'
                }`}
              >
                {categoryNav.allProductsLink.label}
              </span>
            </Link>
            {categoryNav.items.map((item) => (
              <Link key={item.id} href={item.href} className="flex items-start gap-1.5">
                <span
                  className={`w-[3px] h-[17px] rounded-xl shrink-0 ${
                    item.slug === categoryNav.activeSlug ? 'bg-[#179146]' : 'bg-[#969393]'
                  }`}
                />
                <span
                  className={`font-manrope text-sm text-[#1c2126] ${
                    item.slug === categoryNav.activeSlug ? 'font-medium' : 'font-normal'
                  }`}
                >
                  {item.name}
                </span>
                <span className="text-[#969393] text-xs shrink-0"> ({item.productCount})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Категории — дочерние разделы текущей категории */}
      {categoryChildren && categoryChildren.items.length > 0 && (
        <div className="py-6">
          <h3 className="font-manrope font-bold text-base text-[#1c2126] mb-2">Разделы</h3>

          {categoryChildren.showAllHref && (
            <Link
              href={categoryChildren.showAllHref}
              className="inline-block mb-3 text-sm font-manrope text-[#179146] hover:underline"
            >
              Показать все товары раздела
            </Link>
          )}

          <div className="flex flex-col gap-2">
            {categoryChildren.items.map((item) => (
              <Link key={item.id} href={item.href} className="flex items-start gap-1.5">
                <span
                  className={`w-[3px] h-[17px] rounded-xl shrink-0 ${
                    item.slug === categoryChildren.activeSlug ? 'bg-[#179146]' : 'bg-[#969393]'
                  }`}
                />
                <span
                  className={`font-manrope text-sm text-[#1c2126] ${
                    item.slug === categoryChildren.activeSlug ? 'font-medium' : 'font-normal'
                  }`}
                >
                  {item.name}
                </span>
                <span className="text-[#969393] text-xs shrink-0"> ({item.productCount})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Цена */}
      {priceRange.max > priceRange.min && (
        <div className="py-6">
          <h3 className="font-manrope font-bold text-base text-[#1c2126] mb-2">Цена, ₽</h3>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              onBlur={applyPriceInputs}
              placeholder={String(priceRange.min)}
              className="w-24 h-[35px] bg-[#e9e9e9] rounded-xl px-2.5 text-sm font-manrope font-medium text-[#1c2126] outline-none"
            />
            <span className="font-manrope font-bold text-[#1c2126]">—</span>
            <input
              type="number"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              onBlur={applyPriceInputs}
              placeholder={String(priceRange.max)}
              className="w-24 h-[35px] bg-[#e9e9e9] rounded-xl px-2.5 text-sm font-manrope font-medium text-[#1c2126] outline-none"
            />
          </div>
          <div className="relative h-1 bg-[#e9e9e9] rounded">
            <div
              className="absolute h-1 bg-[#179146] rounded"
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
              className="absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#179146] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={sliderTo}
              onChange={(e) => applySlider(sliderFrom, Math.max(Number(e.target.value), sliderFrom))}
              onMouseUp={applyPriceInputs}
              onTouchEnd={applyPriceInputs}
              className="absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#179146] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Бренд */}
      {brands.length > 0 && (
        <div className="py-6">
          <h3 className="font-manrope font-bold text-base text-[#1c2126] mb-2">Бренды</h3>
          <BrandSelect brands={brands} value={brand} onChange={(slug) => router.push(buildHref({ brand: slug }))} />
        </div>
      )}

      {/* Наличие */}
      <div className="py-6">
        <h3 className="font-manrope font-bold text-base text-[#1c2126] mb-2">Наличие</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 cursor-pointer group">
            <input
              type="radio"
              name="stock"
              checked={!inStock}
              onChange={() => router.push(buildHref({ inStock: null }))}
              className="peer sr-only"
            />
            <span className="relative w-[17px] h-[17px] shrink-0 rounded-full border-2 border-[#e9e9e9] peer-checked:border-[#179146] transition-colors flex items-center justify-center">
              <svg
                viewBox="0 0 16 16" fill="none"
                className="w-[10px] h-[10px] text-[#179146] opacity-0 peer-checked:opacity-100 transition-opacity"
              >
                <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-manrope text-sm text-[#1c2126]">Все товары</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer group">
            <input
              type="radio"
              name="stock"
              checked={!!inStock}
              onChange={() => router.push(buildHref({ inStock: true }))}
              className="peer sr-only"
            />
            <span className="relative w-[17px] h-[17px] shrink-0 rounded-full border-2 border-[#e9e9e9] peer-checked:border-[#179146] transition-colors flex items-center justify-center">
              <svg
                viewBox="0 0 16 16" fill="none"
                className="w-[10px] h-[10px] text-[#179146] opacity-0 peer-checked:opacity-100 transition-opacity"
              >
                <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-manrope text-sm text-[#1c2126]">Только в наличии</span>
          </label>
        </div>
      </div>

      {/* Динамические атрибуты категории */}
      {attributeOptions.map((attr) => (
        <div key={attr.key} className="py-6">
          <h3 className="font-manrope font-bold text-base text-[#1c2126] mb-2">
            {attr.label}
            {attr.fieldType === 'number' && attr.unit ? `, ${attr.unit}` : ''}
          </h3>

          {attr.options.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {attr.options.map((opt) => {
                const checked = (attrValues[attr.key] ?? []).includes(opt)
                return (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAttrValue(attr.key, opt)}
                      className="sr-only"
                    />
                    <span
                      className={`flex items-center justify-center w-[17px] h-[17px] shrink-0 rounded-[2px] transition-colors ${
                        checked ? 'bg-[#179146]' : 'bg-[#e9e9e9]'
                      }`}
                    >
                      {checked && (
                        <svg viewBox="0 0 16 16" fill="none" className="w-[13px] h-[13px] text-white">
                          <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className={`font-manrope text-sm text-[#1c2126] ${checked ? 'underline decoration-from-font' : ''}`}>
                      {opt}
                    </span>
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