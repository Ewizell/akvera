'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { updateBrand, deleteBrand, uploadBrandLogo } from '@/lib/actions/brand'

type Brand = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  description: string | null
}

const inputCls =
  'h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15'

const labelCls =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]'

export default function BrandEditModal({
  brand,
  onClose,
}: {
  brand: Brand
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [logoUrl, setLogoUrl] = useState(brand.logoUrl ?? '')
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  function handleLogoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setLogoError(null)
    setIsUploadingLogo(true)

    const fd = new FormData()
    fd.set('file', file)

    uploadBrandLogo(fd).then((result) => {
      setIsUploadingLogo(false)

      if (result.success && result.url) {
        setLogoUrl(result.url)
      } else {
        setLogoError(result.error ?? 'Не удалось загрузить логотип')
      }

      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
    })
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (confirmingDelete) {
          setConfirmingDelete(false)
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [confirmingDelete, onClose])

  function handleSubmit(formData: FormData) {
    setSaveError(null)

    startTransition(async () => {
      const result = await updateBrand(brand.id, formData)

      if (result.success) {
        onClose()
      } else {
        setSaveError(
          result.error ?? 'Не удалось сохранить изменения.',
        )
      }
    })
  }

  function handleDelete() {
    setDeleteError(null)

    startTransition(async () => {
      const result = await deleteBrand(brand.id)

      if (result.success) {
        onClose()
      } else {
        setDeleteError(
          result.error ?? 'Не удалось удалить бренд.',
        )
        setConfirmingDelete(false)
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18212b]/45 px-4 py-6 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl bg-[#f7f8fa] text-[#28313d] shadow-[0_24px_70px_rgba(24,33,43,0.18)] ring-1 ring-black/[0.06]"
        onClick={(event) => event.stopPropagation()}
      >
        <form
          action={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* HEADER */}
          <div className="shrink-0 border-b border-[#eef0f2] bg-white px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                {logoUrl ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-[#e3e6ea]">
                    <img
                      src={logoUrl}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
                    <svg
                      className="h-[18px] w-[18px]"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M10 4L11.55 8.45L16 10L11.55 11.55L10 16L8.45 11.55L4 10L8.45 8.45L10 4Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#929aa6]">
                    Каталог • Бренд
                  </p>

                  <h2 className="mt-0.5 truncate text-base font-semibold text-[#28313d] sm:text-lg">
                    Редактирование бренда
                  </h2>

                  <p className="mt-0.5 truncate text-xs text-[#929aa6]">
                    {brand.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f5f7] text-[#89929d] transition hover:bg-[#e9ebee] hover:text-[#28313d]"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 5L15 15M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            {/* BASIC INFO */}
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
              <div className="flex items-center gap-3 border-b border-[#eef0f2] px-4 py-4 sm:px-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
                  <svg
                    className="h-4 w-4"
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
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#28313d]">
                    Основная информация
                  </h3>

                  <p className="mt-0.5 text-xs text-[#929aa6]">
                    Название и данные страницы бренда
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                {/* NAME */}
                <div>
                  <label className={labelCls}>
                    Название
                  </label>

                  <input
                    name="name"
                    defaultValue={brand.name}
                    required
                    autoFocus
                    className={inputCls}
                  />
                </div>

                {/* SLUG */}
                <div>
                  <label className={labelCls}>
                    Slug
                  </label>

                  <div className="flex h-11 overflow-hidden rounded-xl bg-[#f4f5f7] ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-2 focus-within:ring-[#28394c]/15">
                    <span className="flex shrink-0 items-center border-r border-[#e1e4e8] bg-[#eef0f3] px-3.5 text-xs text-[#89929d]">
                      /brands/
                    </span>

                    <input
                      name="slug"
                      defaultValue={brand.slug}
                      required
                      className="min-w-0 flex-1 bg-transparent px-3.5 text-sm text-[#28313d] outline-none"
                    />
                  </div>

                  <p className="mt-1.5 text-[11px] leading-4 text-[#a06f36]">
                    Изменение slug изменит URL страницы бренда.
                  </p>
                </div>

                {/* LOGO */}
                <div>
                  <label className={labelCls}>
                    Логотип
                  </label>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isPending || isUploadingLogo}
                    onChange={handleLogoFileChange}
                  />

                  <input type="hidden" name="logoUrl" value={logoUrl} />

                  {logoUrl ? (
                    <div className="flex items-center gap-3 rounded-xl bg-[#fafbfc] p-3 ring-1 ring-[#eef0f2]">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5 ring-1 ring-[#e3e6ea]">
                        <img src={logoUrl} alt="" className="h-full w-full object-contain" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#596572]">Текущий логотип</p>
                        <p className="mt-0.5 truncate text-[10px] text-[#929aa6]">
                          Отображается в каталоге брендов
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={isPending || isUploadingLogo}
                          className="inline-flex h-8 items-center rounded-lg bg-[#f4f5f7] px-2.5 text-xs font-medium text-[#687382] transition hover:bg-[#e9ebee] hover:text-[#28313d] disabled:opacity-50"
                        >
                          {isUploadingLogo ? 'Загрузка...' : 'Заменить'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          disabled={isPending || isUploadingLogo}
                          className="inline-flex h-8 items-center rounded-lg bg-[#fff7f7] px-2.5 text-xs font-medium text-[#b33a3a] transition hover:bg-[#ffefef] disabled:opacity-50"
                        >
                          Убрать
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isPending || isUploadingLogo}
                      className="flex h-24 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#d5d9de] bg-[#fafbfc] text-xs font-medium text-[#89929d] transition hover:border-[#28394c]/40 hover:text-[#596572] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isUploadingLogo ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#89929d]/30 border-t-[#89929d]" />
                          Загрузка...
                        </>
                      ) : (
                        'Нажмите, чтобы загрузить логотип'
                      )}
                    </button>
                  )}

                  {logoError && (
                    <p className="mt-1.5 text-[11px] text-[#b33a3a]">{logoError}</p>
                  )}
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className={labelCls}>
                    Описание
                  </label>

                  <textarea
                    name="description"
                    defaultValue={brand.description ?? ''}
                    rows={5}
                    placeholder="Краткое описание производителя для страницы бренда"
                    className="w-full resize-none rounded-xl border-0 bg-[#f4f5f7] px-3.5 py-3 text-sm leading-5 text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15"
                  />
                </div>

                {/* ERRORS */}
                {saveError && (
                  <div className="rounded-xl border border-[#f0d5d5] bg-[#fff7f7] px-3.5 py-3 text-xs text-[#b33a3a]">
                    {saveError}
                  </div>
                )}

                {deleteError && (
                  <div className="rounded-xl border border-[#f0d5d5] bg-[#fff7f7] px-3.5 py-3 text-xs text-[#b33a3a]">
                    {deleteError}
                  </div>
                )}
              </div>
            </section>

            {/* DELETE */}
            <section className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
              <div className="border-b border-[#f1e4e4] bg-[#fffafa] px-4 py-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff0f0] text-[#b33a3a]">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M5 6.5H15M8 6.5V4.5H12V6.5M7 8.5V15.5H13V8.5M9.5 10.5V13.5M10.5 10.5V13.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#6e3f3f]">
                      Удаление бренда
                    </h3>

                    <p className="mt-0.5 text-xs text-[#a47777]">
                      Используйте эту операцию только при необходимости
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {!confirmingDelete ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-md text-xs leading-5 text-[#929aa6]">
                      Удаление может быть недоступно, если бренд
                      используется товарами каталога.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null)
                        setConfirmingDelete(true)
                      }}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#fff7f7] px-3 text-xs font-medium text-[#b33a3a] transition hover:bg-[#ffefef]"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M5 6.5H15M8 6.5V4.5H12V6.5M7 8.5V15.5H13V8.5M9.5 10.5V13.5M10.5 10.5V13.5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      Удалить бренд
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#f0d5d5] bg-[#fff7f7] p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffeaea] text-[#b33a3a]">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M10 5V10.5M10 14H10.01"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />

                          <path
                            d="M8.35 3.7L2.7 13.5C2.1 14.54 2.85 15.85 4.05 15.85H15.95C17.15 15.85 17.9 14.54 17.3 13.5L11.65 3.7C11.05 2.66 8.95 2.66 8.35 3.7Z"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#6e3f3f]">
                          Подтвердите удаление
                        </p>

                        <p className="mt-1 text-[11px] leading-4 text-[#947171]">
                          Бренд «{brand.name}» будет удалён. Если он
                          связан с товарами, операция может завершиться
                          ошибкой.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#b33a3a] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#963030] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isPending && (
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            )}

                            {isPending
                              ? 'Удаление...'
                              : 'Да, удалить'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setConfirmingDelete(false)
                            }
                            disabled={isPending}
                            className="h-9 rounded-xl border border-[#dfe3e8] bg-white px-3.5 text-xs font-medium text-[#596572] shadow-sm transition hover:bg-[#f4f5f7] disabled:opacity-50"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#eef0f2] bg-white px-5 py-3.5 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-10 rounded-xl border border-[#dfe3e8] bg-white px-4 text-xs font-medium text-[#596572] shadow-sm transition hover:bg-[#f4f5f7] hover:text-[#28313d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#28394c] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}

              {isPending ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
