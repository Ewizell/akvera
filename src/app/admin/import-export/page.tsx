'use client'

import { useCallback, useState } from 'react'

interface PreviewResult {
  total: number
  invalid: number
}

interface ImportIssue {
  sku: string
  status: 'skipped' | 'error'
  message?: string
}

interface ImportResult {
  created: number
  updated: number
  skipped: number
  errors: number
  issues: ImportIssue[]
}

type Mode = 'upsert' | 'update-only' | 'create-only'

const MODE_OPTIONS: {
  value: Mode
  title: string
  description: string
}[] = [
  {
    value: 'upsert',
    title: 'Создавать и обновлять',
    description:
      'Новых товаров добавит, существующие обновит по SKU',
  },
  {
    value: 'update-only',
    title: 'Только обновлять',
    description:
      'Товары, которых нет в базе, будут пропущены',
  },
  {
    value: 'create-only',
    title: 'Только добавлять новые',
    description:
      'Товары, которые уже есть в базе, будут пропущены',
  },
]

function Icon({ path }: { path: React.ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}

function StepHeading({
  n,
  title,
  description,
}: {
  n: number
  title: string
  description?: string
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#28394c] to-[#3d5570] text-xs font-semibold text-white shadow-sm">
        {n}
      </span>

      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-[#28313d]">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 text-xs leading-5 text-[#929aa6]">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

function UploadIcon() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf0f3] text-[#667383]">
      <Icon
        path={
          <>
            <path d="M12 3v12" />
            <path d="m8 7 4-4 4 4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </>
        }
      />
    </div>
  )
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <Icon
      path={
        <>
          <path d="M12 3v12" />
          <path d="m8 11 4 4 4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </>
      }
    />
  )
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  )
}

export default function ImportExportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [results, setResults] = useState<ImportResult | null>(null)
  const [downloadImages, setDownloadImages] = useState(true)
  const [defaultStock, setDefaultStock] = useState(0)
  const [mode, setMode] = useState<Mode>('upsert')
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  async function loadPreview(selected: File) {
    setFile(selected)
    setResults(null)
    setPreview(null)
    setBusy(true)

    try {
      const formData = new FormData()
      formData.append('file', selected)
      formData.append('dryRun', 'true')

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      setPreview(await res.json())
    } finally {
      setBusy(false)
    }
  }

  function handleFileInput(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selected = e.target.files?.[0]

    if (selected) {
      loadPreview(selected)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragOver(false)

      const dropped = e.dataTransfer.files?.[0]

      if (dropped) {
        loadPreview(dropped)
      }
    },
    [],
  )

  async function handleImport() {
    if (!file) return

    setBusy(true)

    try {
      const formData = new FormData()

      formData.append('file', file)
      formData.append(
        'downloadImages',
        String(downloadImages),
      )
      formData.append(
        'defaultStock',
        String(defaultStock),
      )
      formData.append('mode', mode)

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      setResults(await res.json())
    } finally {
      setBusy(false)
    }
  }

  const fileExt = file?.name
    .split('.')
    .pop()
    ?.toUpperCase()

  const hasInvalidRows =
    preview && preview.invalid > 0

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-6xl p-6">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#929aa6]">
            <span>Каталог</span>
            <span className="text-[#c4c9cf]">/</span>
            <span>Импорт и экспорт</span>
          </div>

          <div className="mt-1.5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[#28313d]">
                Импорт и экспорт товаров
              </h1>

              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[#7b8592]">
                Загрузка каталога из CSV или YML и выгрузка
                текущего каталога из базы данных.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* STEP 1 */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
            <div className="p-5 sm:p-6">
              <StepHeading
                n={1}
                title="Файл каталога"
                description="Загрузите CSV или YML-файл с товарами"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center transition-all ${
                  dragOver
                    ? 'border-[#28394c] bg-[#f1f4f6]'
                    : 'border-[#d8dde3] bg-[#f7f8fa] hover:border-[#b9c1ca] hover:bg-[#f4f5f7]'
                }`}
              >
                {file ? (
                  <>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9edf1] text-[#28394c]">
                      <Icon
                        path={
                          <>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                            <path d="M14 2v6h6" />
                            <path d="M8 13h8" />
                            <path d="M8 17h6" />
                          </>
                        }
                      />
                    </div>

                    <p className="mt-3 max-w-full truncate px-4 font-mono text-sm font-medium text-[#28313d]">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-[#929aa6]">
                      Файл выбран для импорта
                    </p>
                  </>
                ) : (
                  <>
                    <UploadIcon />

                    <p className="mt-3 text-sm font-medium text-[#4b5663]">
                      Перетащите файл сюда
                    </p>

                    <p className="mt-1 text-sm text-[#929aa6]">
                      или{' '}
                      <span className="font-medium text-[#28394c] underline underline-offset-2">
                        выберите на диске
                      </span>
                    </p>
                  </>
                )}

                <p className="mt-3 text-[11px] text-[#a1a8b3]">
                  CSV или YML · до 10 МБ
                </p>

                <input
                  type="file"
                  accept=".csv,.yml,.xml"
                  onChange={handleFileInput}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={busy}
                />
              </div>

              {file && fileExt && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-[#edf0f3] px-2 py-1 font-mono text-[10px] font-semibold text-[#667383]">
                    {fileExt}
                  </span>

                  {busy && !preview ? (
                    <span className="text-xs text-[#929aa6]">
                      Проверяем файл…
                    </span>
                  ) : preview ? (
                    <>
                      <span className="text-xs text-[#7b8592]">
                        {preview.total} строк
                      </span>

                      {hasInvalidRows && (
                        <>
                          <span className="text-[#c5cbd2]">·</span>

                          <span className="text-xs text-[#b36a32]">
                            {preview.invalid} без SKU или категории —
                            будут пропущены
                          </span>
                        </>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </section>

          {/* STEP 2 */}
          {preview && !results && (
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
              <div className="p-5 sm:p-6">
                <StepHeading
                  n={2}
                  title="Режим и параметры"
                  description="Выберите, как обрабатывать существующие товары"
                />

                <div className="grid gap-3 sm:grid-cols-3">
                  {MODE_OPTIONS.map((opt) => {
                    const selected = mode === opt.value

                    return (
                      <label
                        key={opt.value}
                        className={`group relative cursor-pointer rounded-xl p-4 transition-all ${
                          selected
                            ? 'bg-[#f0f3f5] ring-2 ring-[#28394c]/15'
                            : 'bg-[#f7f8fa] ring-1 ring-black/[0.04] hover:bg-[#f3f4f6]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="mode"
                          value={opt.value}
                          checked={selected}
                          onChange={() =>
                            setMode(opt.value)
                          }
                          className="sr-only"
                        />

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#28313d]">
                              {opt.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#7b8592]">
                              {opt.description}
                            </p>
                          </div>

                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                              selected
                                ? 'bg-[#28394c] text-white'
                                : 'bg-white text-transparent ring-1 ring-[#d8dde3]'
                            }`}
                          >
                            <CheckIcon />
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>

                <div className="mt-5 border-t border-[#edf0f2] pt-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Download images */}
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#f7f8fa] px-4 py-3.5 ring-1 ring-black/[0.04]">
                      <input
                        type="checkbox"
                        checked={downloadImages}
                        onChange={(e) =>
                          setDownloadImages(
                            e.target.checked,
                          )
                        }
                        className="peer sr-only"
                      />

                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors ${
                          downloadImages
                            ? 'bg-[#28394c] text-white'
                            : 'bg-white ring-1 ring-[#d8dde3]'
                        }`}
                      >
                        {downloadImages && <CheckIcon />}
                      </span>

                      <span>
                        <span className="block text-sm font-medium text-[#3d4753]">
                          Скачивать изображения
                        </span>
                        <span className="mt-0.5 block text-xs text-[#929aa6]">
                          Загружать изображения товаров при импорте
                        </span>
                      </span>
                    </label>

                    {/* Default stock */}
                    {mode !== 'update-only' && (
                      <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f7f8fa] px-4 py-3.5 ring-1 ring-black/[0.04]">
                        <div>
                          <p className="text-sm font-medium text-[#3d4753]">
                            Остаток по умолчанию
                          </p>

                          <p className="mt-0.5 text-xs text-[#929aa6]">
                            Для новых товаров
                          </p>
                        </div>

                        <input
                          type="number"
                          min={0}
                          value={defaultStock}
                          onChange={(e) =>
                            setDefaultStock(
                              Number(e.target.value),
                            )
                          }
                          className="h-10 w-20 rounded-xl border-0 bg-white px-3 text-center text-sm font-medium text-[#28313d] outline-none ring-1 ring-black/[0.05] transition focus:ring-2 focus:ring-[#28394c]/15"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* STEP 3 */}
          {preview && (
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
              <div className="p-5 sm:p-6">
                <StepHeading
                  n={3}
                  title={results ? 'Результат импорта' : 'Запуск'}
                  description={
                    results
                      ? 'Итоги обработки загруженного файла'
                      : 'Проверьте настройки и запустите импорт'
                  }
                />

                {!results && (
                  <div className="rounded-xl bg-[#f7f8fa] p-4 ring-1 ring-black/[0.04]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#28313d]">
                          {file?.name}
                        </p>

                        <p className="mt-1 text-xs text-[#929aa6]">
                          Будет обработано {preview.total}{' '}
                          строк
                        </p>
                      </div>

                      <button
                        onClick={handleImport}
                        disabled={busy}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#28394c] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? (
                          <>
                            <Spinner />
                            Импортирую…
                          </>
                        ) : (
                          <>
                            <Icon
                              path={
                                <>
                                  <path d="M12 3v12" />
                                  <path d="m8 11 4 4 4-4" />
                                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                                </>
                              }
                            />

                            {mode === 'update-only'
                              ? `Обновить существующие · ${preview.total}`
                              : mode === 'create-only'
                                ? `Добавить новые · ${preview.total}`
                                : `Импортировать · ${preview.total}`}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {results && (
                  <div>
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                      <StatTile
                        label="Создано"
                        value={results.created}
                        tone="emerald"
                      />

                      <StatTile
                        label="Обновлено"
                        value={results.updated}
                        tone="blue"
                      />

                      <StatTile
                        label="Пропущено"
                        value={results.skipped}
                        tone="amber"
                      />

                      <StatTile
                        label="Ошибок"
                        value={results.errors}
                        tone="red"
                      />
                    </div>

                    {/* Issues */}
                    {results.issues.length > 0 && (
                      <div className="mt-5 overflow-hidden rounded-xl bg-[#f7f8fa] ring-1 ring-black/[0.04]">
                        <div className="border-b border-[#e8ebee] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#7b8592]">
                            Проблемы импорта
                          </p>
                        </div>

                        <div className="max-h-72 overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-[#f7f8fa]">
                              <tr className="border-b border-[#e8ebee]">
                                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#929aa6]">
                                  SKU
                                </th>

                                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#929aa6]">
                                  Статус
                                </th>

                                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#929aa6]">
                                  Причина
                                </th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-[#e8ebee]">
                              {results.issues.map(
                                (r, i) => (
                                  <tr
                                    key={`${r.sku}-${i}`}
                                    className="bg-white"
                                  >
                                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-[#28313d]">
                                      {r.sku || '—'}
                                    </td>

                                    <td className="px-4 py-3">
                                      <StatusPill
                                        status={r.status}
                                      />
                                    </td>

                                    <td className="px-4 py-3 text-xs leading-5 text-[#667383]">
                                      {r.message || '—'}
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* New import */}
                    <button
                      onClick={() => {
                        setFile(null)
                        setPreview(null)
                        setResults(null)
                        setBusy(false)
                      }}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#28394c] transition-colors hover:bg-[#f1f3f5]"
                    >
                      <Icon
                        path={
                          <>
                            <path d="M3 12a9 9 0 0 0 15.3 6.4" />
                            <path d="M3 12V6" />
                            <path d="M3 6h6" />
                            <path d="M21 12a9 9 0 0 0-15.3-6.4" />
                            <path d="M21 12v6" />
                            <path d="M21 18h-6" />
                          </>
                        }
                      />
                      Импортировать ещё один файл
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* EXPORT */}
        <section className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
                <DownloadIcon />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#28313d]">
                  Экспорт
                </h2>

                <p className="mt-0.5 text-xs leading-5 text-[#929aa6]">
                  Выгрузите текущий каталог из базы данных
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="/api/export/yml"
                className="group flex items-center justify-between rounded-xl bg-[#f7f8fa] px-4 py-3.5 ring-1 ring-black/[0.04] transition-all hover:bg-[#f1f3f5] hover:ring-black/[0.07]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#28394c] shadow-sm ring-1 ring-black/[0.04]">
                    <DownloadIcon />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-[#3d4753]">
                      Скачать YML
                    </p>

                    <p className="mt-0.5 text-xs text-[#929aa6]">
                      Для Яндекс.Маркета
                    </p>
                  </div>
                </div>

                <span className="text-[#a1a8b3] transition-transform group-hover:translate-x-0.5">
                  <Icon
                    path={
                      <path d="m9 18 6-6-6-6" />
                    }
                  />
                </span>
              </a>

              <a
                href="/api/export/csv"
                className="group flex items-center justify-between rounded-xl bg-[#f7f8fa] px-4 py-3.5 ring-1 ring-black/[0.04] transition-all hover:bg-[#f1f3f5] hover:ring-black/[0.07]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#28394c] shadow-sm ring-1 ring-black/[0.04]">
                    <DownloadIcon />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-[#3d4753]">
                      Скачать CSV
                    </p>

                    <p className="mt-0.5 text-xs text-[#929aa6]">
                      Для редактирования
                    </p>
                  </div>
                </div>

                <span className="text-[#a1a8b3] transition-transform group-hover:translate-x-0.5">
                  <Icon
                    path={
                      <path d="m9 18 6-6-6-6" />
                    }
                  />
                </span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'emerald' | 'blue' | 'amber' | 'red'
}) {
  const toneClasses: Record<
    'emerald' | 'blue' | 'amber' | 'red',
    {
      wrapper: string
      value: string
      label: string
    }
  > = {
    emerald: {
      wrapper: 'bg-[#f1f8f4] ring-[#dcefe4]',
      value: 'text-[#2f7652]',
      label: 'text-[#5c9275]',
    },
    blue: {
      wrapper: 'bg-[#f1f5f9] ring-[#dfe7ee]',
      value: 'text-[#3d5e7c]',
      label: 'text-[#71869a]',
    },
    amber: {
      wrapper: 'bg-[#fff8ed] ring-[#f3e6cc]',
      value: 'text-[#a66d25]',
      label: 'text-[#b28b58]',
    },
    red: {
      wrapper: 'bg-[#fff7f7] ring-[#f0d5d5]',
      value: 'text-[#b33a3a]',
      label: 'text-[#c27a7a]',
    },
  }

  const styles = toneClasses[tone]

  return (
    <div
      className={`rounded-xl px-4 py-4 ring-1 ${styles.wrapper}`}
    >
      <p
        className={`font-mono text-xl font-semibold leading-none ${styles.value}`}
      >
        {value}
      </p>

      <p
        className={`mt-1.5 text-[11px] font-medium ${styles.label}`}
      >
        {label}
      </p>
    </div>
  )
}

function StatusPill({
  status,
}: {
  status: ImportIssue['status']
}) {
  const isError = status === 'error'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        isError
          ? 'bg-[#fff0f0] text-[#b33a3a]'
          : 'bg-[#fff7e8] text-[#a66d25]'
      }`}
    >
      {isError ? 'Ошибка' : 'Пропущено'}
    </span>
  )
}

