'use client';

import { useCallback, useState } from 'react';

interface PreviewResult {
  total: number;
  invalid: number;
}

interface ImportIssue {
  sku: string;
  status: 'skipped' | 'error';
  message?: string;
}

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  issues: ImportIssue[];
}

type Mode = 'upsert' | 'update-only' | 'create-only';

const MODE_OPTIONS: { value: Mode; title: string; description: string }[] = [
  { value: 'upsert', title: 'Создавать и обновлять', description: 'Новых товаров добавит, существующие обновит по SKU' },
  { value: 'update-only', title: 'Только обновлять', description: 'Товары, которых нет в базе, будут пропущены' },
  { value: 'create-only', title: 'Только добавлять новые', description: 'Товары, которые уже есть в базе, будут пропущены' },
];

function Icon({ path }: { path: React.ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}

function StepHeading({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-medium shrink-0">
        {n}
      </span>
      <h2 className="font-medium text-slate-900">{title}</h2>
    </div>
  );
}

export default function ImportExportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [results, setResults] = useState<ImportResult | null>(null);
  const [downloadImages, setDownloadImages] = useState(true);
  const [defaultStock, setDefaultStock] = useState(0);
  const [mode, setMode] = useState<Mode>('upsert');
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function loadPreview(selected: File) {
    setFile(selected);
    setResults(null);
    setPreview(null);
    setBusy(true);

    const formData = new FormData();
    formData.append('file', selected);
    formData.append('dryRun', 'true');
    const res = await fetch('/api/import', { method: 'POST', body: formData });
    setPreview(await res.json());
    setBusy(false);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) loadPreview(selected);
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) loadPreview(dropped);
  }, []);

  async function handleImport() {
    if (!file) return;
    setBusy(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('downloadImages', String(downloadImages));
    formData.append('defaultStock', String(defaultStock));
    formData.append('mode', mode);
    const res = await fetch('/api/import', { method: 'POST', body: formData });
    setResults(await res.json());
    setBusy(false);
  }

  const fileExt = file?.name.split('.').pop()?.toUpperCase();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900">Импорт и экспорт товаров</h1>
        <p className="text-sm text-slate-500 mt-1">Загрузка каталога из CSV или YML, выгрузка текущего фида</p>
      </div>

      <div className="space-y-4">
        {/* Шаг 1 — загрузка */}
        <section className="border border-slate-200 rounded-lg bg-white p-5">
          <StepHeading n={1} title="Файл каталога" />

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
            }`}
          >
            <span className="text-slate-400">
              <Icon path={<><path d="M12 3v12m0 0l-4-4m4 4l4-4" /><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></>} />
            </span>
            {file ? (
              <p className="text-sm text-slate-900 font-mono">{file.name}</p>
            ) : (
              <p className="text-sm text-slate-600">
                Перетащи файл сюда или{' '}
                <span className="text-blue-600 underline underline-offset-2">выбери на диске</span>
              </p>
            )}
            <p className="text-xs text-slate-400">CSV или YML, до 10 МБ</p>
            <input
              type="file"
              accept=".csv,.yml,.xml"
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {file && fileExt && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600">{fileExt}</span>
              {preview && (
                <span>
                  {preview.total} строк{preview.invalid > 0 && <> · {preview.invalid} без SKU или категории — будут пропущены</>}
                </span>
              )}
            </div>
          )}
        </section>

        {/* Шаг 2 — настройки */}
        {preview && !results && (
          <section className="border border-slate-200 rounded-lg bg-white p-5">
            <StepHeading n={2} title="Режим и параметры" />

            <div className="grid gap-2 sm:grid-cols-3 mb-5">
              {MODE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    mode === opt.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={opt.value}
                    checked={mode === opt.value}
                    onChange={() => setMode(opt.value)}
                    className="sr-only"
                  />
                  <p className="text-sm font-medium text-slate-900">{opt.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                </label>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-700 border-t border-slate-100 pt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={downloadImages}
                  onChange={(e) => setDownloadImages(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Скачивать изображения
              </label>
              {mode !== 'update-only' && (
                <label className="flex items-center gap-2">
                  Остаток по умолчанию для новых товаров
                  <input
                    type="number"
                    value={defaultStock}
                    onChange={(e) => setDefaultStock(Number(e.target.value))}
                    className="w-16 border border-slate-300 rounded px-2 py-1 text-slate-900"
                  />
                </label>
              )}
            </div>
          </section>
        )}

        {/* Шаг 3 — запуск и результат */}
        {preview && (
          <section className="border border-slate-200 rounded-lg bg-white p-5">
            <StepHeading n={3} title="Запуск" />

            {!results && (
              <button
                onClick={handleImport}
                disabled={busy}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
              >
                {busy
                  ? 'Импортирую…'
                  : mode === 'update-only'
                    ? `Обновить существующие (из ${preview.total} строк)`
                    : mode === 'create-only'
                      ? `Добавить новые (из ${preview.total} строк)`
                      : `Импортировать ${preview.total} товаров`}
              </button>
            )}

            {results && (
              <div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <StatTile label="Создано" value={results.created} tone="emerald" />
                  <StatTile label="Обновлено" value={results.updated} tone="blue" />
                  <StatTile label="Пропущено" value={results.skipped} tone="amber" />
                  <StatTile label="Ошибок" value={results.errors} tone="red" />
                </div>

                {results.issues.length > 0 && (
                  <div className="border border-slate-200 rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="text-left font-medium px-3 py-2">SKU</th>
                          <th className="text-left font-medium px-3 py-2">Статус</th>
                          <th className="text-left font-medium px-3 py-2">Причина</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 max-h-60">
                        {results.issues.map((r, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 font-mono text-slate-900">{r.sku}</td>
                            <td className="px-3 py-2">
                              <StatusPill status={r.status} />
                            </td>
                            <td className="px-3 py-2 text-slate-600">{r.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <button
                  onClick={() => { setFile(null); setPreview(null); setResults(null); }}
                  className="mt-4 text-sm text-blue-600 hover:underline"
                >
                  Импортировать ещё один файл
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Экспорт */}
      <section className="mt-8 border border-slate-200 rounded-lg bg-white p-5">
        <h2 className="font-medium text-slate-900 mb-1">Экспорт</h2>
        <p className="text-sm text-slate-500 mb-4">Текущий каталог из базы, в формате для Яндекс.Маркета или для CSV-редактирования</p>
        <div className="flex gap-3">
          <a
            href="/api/export/yml"
            className="flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-900 text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            <Icon path={<><path d="M12 15V3m0 0l-4 4m4-4l4 4" /><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></>} />
            Скачать YML
          </a>
          <a
            href="/api/export/csv"
            className="flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-900 text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            <Icon path={<><path d="M12 15V3m0 0l-4 4m4-4l4 4" /><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></>} />
            Скачать CSV
          </a>
        </div>
      </section>
    </div>
  );
}

function StatTile({ label, value, tone }: { label: string; value: number; tone: 'emerald' | 'blue' | 'amber' | 'red' }) {
  const toneClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <div className={`rounded-md px-3 py-2.5 ${toneClasses[tone]}`}>
      <p className="text-lg font-semibold font-mono leading-none">{value}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  );
}

function StatusPill({ status }: { status: ImportIssue['status'] }) {
  const isError = status === 'error';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        isError ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {isError ? 'Ошибка' : 'Пропущено'}
    </span>
  );
}