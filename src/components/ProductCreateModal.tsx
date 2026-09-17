'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/lib/actions/product'
import { slugify } from '@/lib/slugify'
import StringListEditor from './StringListEditor'

type Category = {
  id: string
  name: string
}

type Brand = {
  id: string
  name: string
}

const inputCls =
  'h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15'

const textareaCls =
  'w-full resize-none rounded-xl border-0 bg-[#f4f5f7] px-3.5 py-3 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15'

const labelCls =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]'

const cardCls =
  'rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]'

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  )
}

function SectionIcon({
  type,
}: {
  type: 'product' | 'variant'
}) {
  if (type === 'variant') {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05" />
        <path d="M12 22.08V12" />
      </svg>
    )
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7h-5l-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
      <path d="M2 10h20" />
    </svg>
  )
}

export default function ProductCreateModal({
  categories,
  brands,
  onClose,
}: {
  categories: Category[]
  brands: Brand[]
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isPending) {
        onClose()
      }
    }

    globalThis.document.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      globalThis.document.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [isPending, onClose])

  function handleNameChange(value: string) {
    setName(value)

    if (!slugEdited) {
      setSlug(slugify(value))
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await createProduct(formData)

      if (result.success) {
        onClose()
        router.refresh()
      } else {
        setError(result.error ?? 'Ошибка создания')
      }
    })
  }

  function handleBackdropClick(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    if (
      event.target === event.currentTarget &&
      !isPending
    ) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18212b]/45 p-4 backdrop-blur-[3px] sm:p-6"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-[#f7f8fa] text-[#28313d] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-black/[0.05] bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
                <SectionIcon type="product" />
              </div>

              <div className="min-w-0">
                <h1 className="text-base font-semibold tracking-tight text-[#28313d]">
                  Новый товар
                </h1>
                <p className="mt-0.5 text-xs text-[#8a939f]">
                  Создание товара и первого исполнения
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              aria-label="Закрыть"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#8a939f] transition hover:bg-[#f4f5f7] hover:text-[#28313d] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <form
            id="product-create-form"
            action={handleSubmit}
            className="space-y-4"
          >
            {/* Product */}
            <section className={cardCls}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                  <SectionIcon type="product" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#28313d]">
                    Основная информация
                  </h2>
                  <p className="mt-0.5 text-xs text-[#9aa3ae]">
                    Данные модели товара
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>
                    Название модели
                  </label>

                  <input
                    name="name"
                    value={name}
                    onChange={(e) =>
                      handleNameChange(e.target.value)
                    }
                    required
                    placeholder="Например: Вентилятор ВКК-200"
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>
                      Категория
                    </label>

                    <select
                      name="categoryId"
                      required
                      defaultValue=""
                      className={inputCls}
                    >
                      <option value="">
                        — выберите категорию —
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Бренд
                    </label>

                    <select
                      name="brandId"
                      defaultValue=""
                      className={inputCls}
                    >
                      <option value="">
                        — без бренда —
                      </option>

                      {brands.map((brand) => (
                        <option
                          key={brand.id}
                          value={brand.id}
                        >
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>
                    Описание
                  </label>

                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Краткое описание товара"
                    className={textareaCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Область применения
                  </label>

                  <StringListEditor
                    name="applicationAreas"
                    placeholder="Например: отопление складских помещений"
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Преимущества
                  </label>

                  <StringListEditor
                    name="advantages"
                    placeholder="Например: низкое энергопотребление"
                  />
                </div>
              </div>
            </section>

            {/* First variant */}
            <section className={cardCls}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                  <SectionIcon type="variant" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#28313d]">
                    Первое исполнение
                  </h2>
                  <p className="mt-0.5 text-xs text-[#9aa3ae]">
                    Остальные исполнения можно добавить
                    после создания товара
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>
                    Артикул (SKU)
                  </label>

                  <input
                    name="sku"
                    required
                    placeholder="Например: VKK-200"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Slug
                  </label>

                  <div className="flex h-11 overflow-hidden rounded-xl bg-[#f4f5f7] ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-2 focus-within:ring-[#28394c]/15">
                    <span className="flex items-center border-r border-black/[0.04] px-3 text-xs text-[#9aa3ae]">
                      /
                    </span>

                    <input
                      name="slug"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value)
                        setSlugEdited(true)
                      }}
                      required
                      placeholder="vkk-200"
                      className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-[#28313d] outline-none placeholder:text-[#a1a8b3]"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>
                    Цена
                  </label>

                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-[#fff7f7] px-3.5 py-3 ring-1 ring-[#f0d5d5]">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f8e8e8] text-[#b33a3a]">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                    <path d="M10.3 3.8L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 3.8a2 2 0 00-3.4 0z" />
                  </svg>
                </div>

                <p className="pt-1 text-xs leading-5 text-[#b33a3a]">
                  {error}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-black/[0.05] bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium text-[#66717e] transition hover:bg-[#f4f5f7] hover:text-[#28313d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Отмена
            </button>

            <button
              type="submit"
              form="product-create-form"
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#28394c] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending && <Spinner />}
              {isPending ? 'Создание...' : 'Создать товар'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}