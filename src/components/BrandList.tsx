'use client'

import { useState } from 'react'
import BrandCreateModal from './BrandCreateModal'
import BrandEditModal from './BrandEditModal'

type Brand = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  description: string | null
}

const labelCls =
  'text-[10px] font-semibold uppercase tracking-[0.08em] text-[#929aa6]'

export default function BrandList({ brands }: { brands: Brand[] }) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingBrand =
    brands.find((brand) => brand.id === editingId) ?? null

  const brandsWithLogo = brands.filter((brand) =>
    Boolean(brand.logoUrl),
  ).length

  return (
    <>
      {/* TOOLBAR */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={labelCls}>Каталог</p>

          <h2 className="mt-0.5 text-base font-semibold text-[#28313d] sm:text-lg">
            Бренды
          </h2>

          <p className="mt-0.5 text-xs text-[#929aa6]">
            Управление производителями и страницами брендов
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#28394c] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2a38]"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M10 4V16M4 10H16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          Добавить бренд
        </button>
      </div>

      {/* STATS */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-black/[0.04]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#687382]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
            >
              <rect
                x="3.5"
                y="4"
                width="13"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.4"
              />

              <path
                d="M7 8H13M7 10.5H13M7 13H10"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <p className={labelCls}>Всего брендов</p>

            <p className="mt-0.5 text-xl font-semibold text-[#28313d]">
              {brands.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-black/[0.04]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#687382]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
            >
              <rect
                x="3.5"
                y="4"
                width="13"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.4"
              />

              <path
                d="M6.5 13L9 10.5L10.5 12L12.5 9.5L14 13"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <p className={labelCls}>С логотипом</p>

            <p className="mt-0.5 text-xl font-semibold text-[#28313d]">
              {brandsWithLogo}
            </p>
          </div>
        </div>
      </div>

      {/* LIST */}
      {brands.length === 0 ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="px-5 py-12 text-center sm:py-14">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f3f5] text-[#9aa2ad]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M4 5.5C4 4.67 4.67 4 5.5 4H14.5C15.33 4 16 4.67 16 5.5V14.5C16 15.33 15.33 16 14.5 16H5.5C4.67 16 4 15.33 4 14.5V5.5Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />

                <path
                  d="M7 13L9 10.5L10.5 12L12 10L14 13"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="mt-4 text-sm font-medium text-[#596572]">
              Брендов пока нет
            </p>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#929aa6]">
              Добавьте первого производителя, чтобы начать
              формировать каталог брендов.
            </p>

            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#f1f3f5] px-3.5 text-xs font-semibold text-[#596572] transition hover:bg-[#e9ebee] hover:text-[#28394c]"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M10 4V16M4 10H16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>

              Добавить первый бренд
            </button>
          </div>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
          {/* HEADER */}
          <div className="flex items-center justify-between gap-4 border-b border-[#eef0f2] px-4 py-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <rect
                    x="3.5"
                    y="4"
                    width="13"
                    height="12"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />

                  <path
                    d="M6.5 13L9 10.5L10.5 12L12.5 9.5L14 13"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[#28313d]">
                  Бренды каталога
                </h3>

                <p className="mt-0.5 text-xs text-[#929aa6]">
                  Производители, представленные в каталоге
                </p>
              </div>
            </div>

            <div className="flex h-8 min-w-8 items-center justify-center rounded-xl bg-[#f1f3f5] px-2 text-xs font-semibold text-[#596572]">
              {brands.length}
            </div>
          </div>

          {/* LIST */}
          <div className="p-3 sm:p-4">
            <ul className="space-y-2">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <div className="group flex flex-col gap-4 rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-black/[0.04] transition hover:shadow-md sm:flex-row sm:items-center sm:px-5">
                    {/* BRAND */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {brand.logoUrl ? (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-[#e3e6ea]">
                          <img
                            src={brand.logoUrl}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#89929d]">
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <rect
                              x="3.5"
                              y="4"
                              width="13"
                              height="12"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.4"
                            />

                            <path
                              d="M6.5 13L9 10.5L10.5 12L12.5 9.5L14 13"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold text-[#28313d]">
                            {brand.name}
                          </span>

                          {brand.logoUrl && (
                            <span className="shrink-0 rounded-full bg-[#f1f3f5] px-2 py-0.5 text-[10px] font-medium text-[#7b8592]">
                              Логотип
                            </span>
                          )}
                        </div>

                        {brand.description ? (
                          <p className="mt-1.5 max-w-xl truncate text-xs text-[#929aa6]">
                            {brand.description}
                          </p>
                        ) : (
                          <p className="mt-1.5 text-xs text-[#b0b6bd]">
                            Описание не задано
                          </p>
                        )}

                        <div className="mt-1.5 md:hidden">
                          <code className="rounded-md bg-[#f7f8fa] px-1.5 py-0.5 font-mono text-[10px] text-[#7d8792]">
                            /brands/{brand.slug}
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* SLUG */}
                    <div className="hidden w-[180px] shrink-0 md:block">
                      <code className="block truncate rounded-md bg-[#f7f8fa] px-2 py-1 font-mono text-[10px] text-[#7d8792]">
                        /brands/{brand.slug}
                      </code>
                    </div>

                    {/* ACTION */}
                    <div className="flex shrink-0 items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingId(brand.id)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#f4f5f7] px-3 text-xs font-medium text-[#687382] transition hover:bg-[#e9ebee] hover:text-[#28394c]"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M4 13.5V16h2.5L15 7.5 12.5 5 4 13.5Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />

                          <path
                            d="M11.5 6L14 8.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>

                        <span className="hidden sm:inline">
                          Изменить
                        </span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CREATE MODAL */}
      {creating && (
        <BrandCreateModal
          onClose={() => setCreating(false)}
        />
      )}

      {/* EDIT MODAL */}
      {editingBrand && (
        <BrandEditModal
          brand={editingBrand}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  )
}

