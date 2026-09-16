'use client'

import { useMemo, useState, useTransition } from 'react'
import ProductCreateModal from './ProductCreateModal'
import ProductEditModal from './ProductEditModal'
import BulkActionsToolbar from './BulkActionsToolbar'
import CategoryTree from './CategoryTree'
import { deleteProduct, duplicateProduct } from '@/lib/actions/product'

type CategoryAttributeSchema = {
  key: string
  label: string
  fieldType: string
  unit: string | null
}

type ProductImage = {
  url: string
  isMain: boolean
}

type ProductVariant = {
  id: string
  name: string
  sku: string
  slug: string
  price: number | null
  stock: number
  attributes: Record<string, unknown> | null
  images: ProductImage[]
}

type Product = {
  id: string
  name: string
  categoryId: string
  brandId: string | null
  description: string | null
  category: {
    name: string
    attributes: CategoryAttributeSchema[]
  }
  variants: ProductVariant[]
  tagIds: string[]
}

type Category = {
  id: string
  name: string
  parentId: string | null
}

type Brand = {
  id: string
  name: string
}

type Tag = {
  id: string
  name: string
}

function formatPrice(price: number | null) {
  if (price === null) return 'Цена по запросу'

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}

function getProductImage(product: Product) {
  for (const variant of product.variants) {
    const mainImage = variant.images.find((image) => image.isMain)

    if (mainImage) {
      return mainImage.url
    }

    if (variant.images[0]) {
      return variant.images[0].url
    }
  }

  return null
}

function getProductPrice(product: Product) {
  const prices = product.variants
    .map((variant) => variant.price)
    .filter((price): price is number => price !== null)

  if (prices.length === 0) return null

  return Math.min(...prices)
}

function getProductStock(product: Product) {
  return product.variants.reduce(
    (sum, variant) => sum + (variant.stock || 0),
    0
  )
}

function getStockLabel(stock: number) {
  if (stock <= 0) {
    return {
      label: 'Нет в наличии',
      className: 'bg-[#fff7f7] text-[#b33a3a] ring-1 ring-[#f0d5d5]',
    }
  }

  if (stock < 5) {
    return {
      label: `${stock} шт.`,
      className: 'bg-[#fff9ed] text-[#9a6b19] ring-1 ring-[#f0dfb8]',
    }
  }

  return {
    label: `${stock} шт.`,
    className: 'bg-[#f1f7f3] text-[#397653] ring-1 ring-[#d5e8dc]',
  }
}

function ProductRow({
  product,
  selected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  product: Product
  selected: boolean
  onSelect: (id: string) => void
  onEdit: (product: Product) => void
  onDuplicate: (product: Product) => void
  onDelete: (product: Product) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const image = getProductImage(product)
  const price = getProductPrice(product)
  const stock = getProductStock(product)
  const stockInfo = getStockLabel(stock)

  return (
    <div
      className={`rounded-2xl bg-white ring-1 ring-black/[0.04] shadow-sm transition ${
        selected ? 'ring-2 ring-[#28394c]/20' : ''
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <label className="mt-1 shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect(product.id)}
              className="h-4 w-4 rounded border-[#cbd1d8] text-[#28394c] focus:ring-[#28394c]/20"
            />
          </label>

          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f4f5f7] ring-1 ring-black/[0.04]">
            {image ? (
              <img
                src={image}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#a1a8b3]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-8 w-8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.5-4.5a2 2 0 012.828 0L16 16m-2-2l1.5-1.5a2 2 0 012.828 0L20 16M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                </svg>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-[#28313d] sm:text-base">
                    {product.name}
                  </h3>

                  <span className="rounded-lg bg-[#eef1f4] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#687382]">
                    {product.category.name}
                  </span>
                </div>

                <p className="mt-1 text-xs text-[#8b949f]">
                  ID: {product.id}
                </p>

                {product.description && (
                  <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-5 text-[#687382]">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${stockInfo.className}`}
                >
                  {stockInfo.label}
                </span>

                <span className="rounded-lg bg-[#f4f5f7] px-2.5 py-1.5 text-xs font-semibold text-[#5f6976]">
                  {product.variants.length}{' '}
                  {product.variants.length === 1
                    ? 'вариант'
                    : product.variants.length < 5
                      ? 'варианта'
                      : 'вариантов'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-[#edf0f2] pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[#8b949f]">
                    Цена от
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-[#28313d]">
                    {formatPrice(price)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[#8b949f]">
                    Варианты
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-[#28313d]">
                    {product.variants.length}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[#8b949f]">
                    Остаток
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-[#28313d]">
                    {stock}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {product.variants.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#f4f5f7] px-3 text-xs font-semibold text-[#4f5a67] transition hover:bg-[#e9ecef]"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className={`h-4 w-4 transition-transform ${
                        expanded ? 'rotate-180' : ''
                      }`}
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 7.5l5 5 5-5"
                      />
                    </svg>
                    {expanded ? 'Скрыть' : 'Варианты'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#eef1f4] px-3 text-xs font-semibold text-[#28394c] transition hover:bg-[#e3e7eb]"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.8 3.2a1.7 1.7 0 012.4 2.4L7 14.8l-3.2.8.8-3.2 7.8-9.2z"
                    />
                    <path
                      strokeLinecap="round"
                      d="M11.8 5.2l3 3"
                    />
                  </svg>
                  Изменить
                </button>

                <button
                  type="button"
                  onClick={() => onDuplicate(product)}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#f4f5f7] px-3 text-xs font-semibold text-[#4f5a67] transition hover:bg-[#e9ecef]"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <rect
                      x="7"
                      y="7"
                      width="9"
                      height="9"
                      rx="1.5"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7V5.5A1.5 1.5 0 0011.5 4h-6A1.5 1.5 0 004 5.5v6A1.5 1.5 0 005.5 13H7"
                    />
                  </svg>
                  Дублировать
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff7f7] text-[#b33a3a] ring-1 ring-[#f0d5d5] transition hover:bg-[#ffefef]"
                  title="Удалить"
                  aria-label="Удалить товар"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      strokeLinecap="round"
                      d="M4 6h12"
                    />
                    <path
                      strokeLinecap="round"
                      d="M8 3.5h4"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6l.7 10.5h6.6L14 6"
                    />
                    <path
                      strokeLinecap="round"
                      d="M8.5 9v5M11.5 9v5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {expanded && product.variants.length > 0 && (
        <div className="border-t border-[#edf0f2] bg-[#fafbfc] px-4 py-4 sm:px-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[#687382]">
                Варианты товара
              </h4>
              <p className="mt-0.5 text-xs text-[#9aa2ac]">
                SKU, цена, остаток и атрибуты исполнений
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="rounded-xl bg-white p-3 ring-1 ring-black/[0.04]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[#28313d]">
                        {variant.name}
                      </span>

                      {variant.sku && (
                        <span className="rounded-md bg-[#f4f5f7] px-2 py-1 font-mono text-[10px] text-[#727c88]">
                          {variant.sku}
                        </span>
                      )}
                    </div>

                    {variant.attributes &&
                      Object.keys(variant.attributes).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {Object.entries(variant.attributes).map(
                            ([key, value]) => (
                              <span
                                key={key}
                                className="rounded-md bg-[#f4f5f7] px-2 py-1 text-[10px] text-[#6f7985]"
                              >
                                {key}: {String(value)}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#9aa2ac]">
                        Цена
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-[#28313d]">
                        {formatPrice(variant.price)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#9aa2ac]">
                        Остаток
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-[#28313d]">
                        {variant.stock}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductList({
  products,
  categories,
  brands,
  tags,
}: {
  products: Product[]
  categories: Category[]
  brands: Brand[]
  tags: Tag[]
}) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  )

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<
    'default' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'stock'
  >('default')

  const [isPending, startTransition] = useTransition()

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}

    for (const product of products) {
      counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1
    }

    return counts
  }, [products])

  const selectedCategoryDescendants = useMemo(() => {
    if (!selectedCategoryId) return null

    const ids = new Set<string>([selectedCategoryId])

    function collect(parentId: string) {
      for (const category of categories) {
        if (category.parentId === parentId) {
          ids.add(category.id)
          collect(category.id)
        }
      }
    }

    collect(selectedCategoryId)

    return ids
  }, [categories, selectedCategoryId])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    let result = products.filter((product) => {
      if (
        selectedCategoryDescendants &&
        !selectedCategoryDescendants.has(product.categoryId)
      ) {
        return false
      }

      if (!query) return true

      const searchable = [
        product.name,
        product.description ?? '',
        product.category.name,
        ...product.variants.flatMap((variant) => [
          variant.name,
          variant.sku ?? '',
        ]),
      ]
        .join(' ')
        .toLowerCase()

      return searchable.includes(query)
    })

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'name_asc':
          return a.name.localeCompare(b.name, 'ru')

        case 'name_desc':
          return b.name.localeCompare(a.name, 'ru')

        case 'price_asc': {
          const aPrice = getProductPrice(a)
          const bPrice = getProductPrice(b)

          if (aPrice === null && bPrice === null) return 0
          if (aPrice === null) return 1
          if (bPrice === null) return -1

          return aPrice - bPrice
        }

        case 'price_desc': {
          const aPrice = getProductPrice(a)
          const bPrice = getProductPrice(b)

          if (aPrice === null && bPrice === null) return 0
          if (aPrice === null) return 1
          if (bPrice === null) return -1

          return bPrice - aPrice
        }

        case 'stock':
          return getProductStock(b) - getProductStock(a)

        default:
          return 0
      }
    })

    return result
  }, [
    products,
    search,
    sort,
    selectedCategoryDescendants,
  ])

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + getProductStock(product), 0),
    [products]
  )

  const productsWithStock = useMemo(
    () =>
      products.filter((product) => getProductStock(product) > 0).length,
    [products]
  )

  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product) => selectedIds.includes(product.id))

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredProducts.map((product) => product.id))

      setSelectedIds((prev) =>
        prev.filter((id) => !filteredIds.has(id))
      )

      return
    }

    setSelectedIds((prev) => {
      const next = new Set(prev)

      for (const product of filteredProducts) {
        next.add(product.id)
      }

      return Array.from(next)
    })
  }

  function handleDelete(product: Product) {
    if (
      !confirm(
        `Удалить товар «${product.name}»? Это действие необратимо.`
      )
    ) {
      return
    }

    startTransition(async () => {
      await deleteProduct(product.id)

      setSelectedIds((prev) =>
        prev.filter((id) => id !== product.id)
      )
    })
  }

  function handleDuplicate(product: Product) {
    startTransition(async () => {
      await duplicateProduct(product.id)
    })
  }

  function handleEdit(product: Product) {
    setEditing(product)
  }

  function handleCategorySelect(id: string | null) {
    setSelectedCategoryId(id)
    setSelectedIds([])
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#28313d]">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-[#8a939e]">
            <span>Каталог</span>
            <span>/</span>
            <span className="text-[#5f6976]">Товары</span>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[#28313d]">
                Товары
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-5 text-[#7b8592]">
                Управление товарами, категориями, вариантами, ценами и
                остатками.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#28394c] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e2a38]"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  strokeLinecap="round"
                  d="M10 4v12M4 10h12"
                />
              </svg>
              Добавить товар
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
              Всего товаров
            </div>

            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#28313d]">
              {products.length}
            </div>

            <div className="mt-1 text-xs text-[#969faa]">
              В каталоге
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
              Варианты
            </div>

            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#28313d]">
              {products.reduce(
                (sum, product) => sum + product.variants.length,
                0
              )}
            </div>

            <div className="mt-1 text-xs text-[#969faa]">
              Исполнения товаров
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
              Остаток
            </div>

            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#28313d]">
              {totalStock}
            </div>

            <div className="mt-1 text-xs text-[#969faa]">
              Единиц на складе
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
              С остатком
            </div>

            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#28313d]">
              {productsWithStock}
            </div>

            <div className="mt-1 text-xs text-[#969faa]">
              Из {products.length} товаров
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/[0.04] xl:sticky xl:top-5">
            <div className="mb-3 px-2 pt-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
                Категории
              </div>
            </div>

            <CategoryTree
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={handleCategorySelect}
              productCounts={categoryCounts}
            />
          </aside>

          <main className="min-w-0">
            <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa2ac]"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <circle cx="8.5" cy="8.5" r="5.5" />
                    <path
                      strokeLinecap="round"
                      d="M13 13l4 4"
                    />
                  </svg>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по названию, SKU, описанию..."
                    className="h-11 w-full rounded-xl border-0 bg-[#f4f5f7] pl-10 pr-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15"
                  />
                </div>

                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(
                      e.target.value as
                        | 'default'
                        | 'name_asc'
                        | 'name_desc'
                        | 'price_asc'
                        | 'price_desc'
                        | 'stock'
                    )
                  }
                  className="h-11 rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#4f5a67] outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-2 focus:ring-[#28394c]/15"
                >
                  <option value="default">По умолчанию</option>
                  <option value="name_asc">По названию А–Я</option>
                  <option value="name_desc">По названию Я–А</option>
                  <option value="price_asc">Сначала дешевле</option>
                  <option value="price_desc">Сначала дороже</option>
                  <option value="stock">По остатку</option>
                </select>

                <button
                  type="button"
                  onClick={toggleSelectAll}
                  disabled={filteredProducts.length === 0}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#f4f5f7] px-3.5 text-sm font-semibold text-[#4f5a67] transition hover:bg-[#e9ecef] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded border border-[#aeb6c0] bg-white">
                    {allFilteredSelected && (
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="h-3 w-3 text-[#28394c]"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 8l3 3 7-7"
                        />
                      </svg>
                    )}
                  </span>
                  {allFilteredSelected
                    ? 'Снять выбор'
                    : 'Выбрать все'}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8b949f]">
                <span>
                  Показано:{' '}
                  <span className="font-semibold text-[#5f6976]">
                    {filteredProducts.length}
                  </span>{' '}
                  из {products.length}
                </span>

                {selectedCategoryId && (
                  <button
                    type="button"
                    onClick={() => handleCategorySelect(null)}
                    className="font-semibold text-[#28394c] hover:underline"
                  >
                    Сбросить категорию
                  </button>
                )}
              </div>
            </div>

            {selectedIds.length > 0 && (
              <BulkActionsToolbar
                selectedIds={selectedIds}
                categories={categories}
                brands={brands}
                tags={tags}
                onClear={() => setSelectedIds([])}
              />
            )}

            {isPending && (
              <div className="mb-4 rounded-xl bg-white px-4 py-3 text-sm text-[#687382] shadow-sm ring-1 ring-black/[0.04]">
                Выполняется операция...
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/[0.04] sm:p-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef1f4] text-[#7d8792]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-7 w-7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 12H4M12 20V4"
                    />
                  </svg>
                </div>

                <h2 className="mt-4 text-base font-semibold text-[#28313d]">
                  Товары не найдены
                </h2>

                <p className="mx-auto mt-1 max-w-md text-sm leading-5 text-[#8b949f]">
                  {search || selectedCategoryId
                    ? 'Измените параметры поиска или сбросьте фильтры.'
                    : 'В каталоге пока нет товаров. Добавьте первый товар, чтобы начать работу.'}
                </p>

                {(search || selectedCategoryId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      setSelectedCategoryId(null)
                    }}
                    className="mt-5 rounded-xl bg-[#28394c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e2a38]"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    selected={selectedIds.includes(product.id)}
                    onSelect={toggleSelect}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {creating && (
        <ProductCreateModal
          categories={categories}
          brands={brands}
          tags={tags}
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <ProductEditModal
          product={editing}
          categories={categories}
          brands={brands}
          tags={tags}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
