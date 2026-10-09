import { NextRequest, NextResponse } from 'next/server';
import { parseCsvImport } from '@/lib/import-export/csv-parser';
import { parseYmlImport } from '@/lib/import-export/yml-parser';
import { importRow } from '@/lib/import-export/import';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';

export const runtime = 'nodejs';
export const maxDuration = 300; // импорт 350 товаров с картинками может идти пару минут

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 МБ
const MAX_ROWS = 2000;

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const dryRun = formData.get('dryRun') === 'true';
  const downloadImages = formData.get('downloadImages') === 'true';

  const rawStock = Number(formData.get('defaultStock') ?? 0);
  const defaultStock = Number.isFinite(rawStock)
    ? Math.min(Math.max(Math.trunc(rawStock), 0), 1_000_000)
    : 0;

  const modeParam = formData.get('mode');
  const mode: 'update-only' | 'create-only' | 'upsert' =
    modeParam === 'update-only' || modeParam === 'create-only' ? modeParam : 'upsert';

  if (!file) {
    return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  if (!/\.(csv|yml|xml)$/.test(name)) {
    return NextResponse.json({ error: 'Допустимы только .csv, .yml, .xml' }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'Файл больше 10 МБ' }, { status: 413 });
  }

  const fileType = name.endsWith('.yml') || name.endsWith('.xml') ? 'yml' : 'csv';
  const content = await file.text();

  let rows: ReturnType<typeof parseCsvImport>;
  try {
    rows = fileType === 'csv' ? parseCsvImport(content) : parseYmlImport(content);
  } catch {
    return NextResponse.json({ error: 'Не удалось разобрать файл' }, { status: 400 });
  }

  if (rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Не больше ${MAX_ROWS} позиций за один импорт` },
      { status: 413 },
    );
  }

  if (dryRun) {
    return NextResponse.json({
      total: rows.length,
      invalid: rows.filter((r) => !r.sku || !r.categoryPath.length).length,
    });
  }

  const results = [];
  for (const row of rows) {
    results.push(await importRow(row, { downloadImages, defaultStock, mode }));
  }

  revalidatePath('/admin/products');
  revalidatePath('/catalog/all');
  revalidatePath('/category', 'layout');

  return NextResponse.json({
    created: results.filter((r) => r.status === 'created').length,
    updated: results.filter((r) => r.status === 'updated').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
    errors: results.filter((r) => r.status === 'error').length,
    issues: results.filter((r) => r.status === 'error' || r.status === 'skipped'),
  });
}