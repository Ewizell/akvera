import { NextRequest, NextResponse } from 'next/server';
import { parseCsvImport } from '@/lib/import-export/csv-parser';
import { parseYmlImport } from '@/lib/import-export/yml-parser';
import { importRow } from '@/lib/import-export/import';

export const runtime = 'nodejs';
export const maxDuration = 300; // импорт 350 товаров с картинками может идти пару минут

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const dryRun = formData.get('dryRun') === 'true';
  const downloadImages = formData.get('downloadImages') === 'true';
  const defaultStock = Number(formData.get('defaultStock') ?? 0);
  const modeParam = formData.get('mode');
  const mode: 'update-only' | 'create-only' | 'upsert' =
    modeParam === 'update-only' || modeParam === 'create-only' ? modeParam : 'upsert';

  if (!file) {
    return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
  }

  const fileType = file.name.endsWith('.yml') || file.name.endsWith('.xml') ? 'yml' : 'csv';
  const content = await file.text();
  const rows = fileType === 'csv' ? parseCsvImport(content) : parseYmlImport(content);

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

  return NextResponse.json({
    created: results.filter((r) => r.status === 'created').length,
    updated: results.filter((r) => r.status === 'updated').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
    errors: results.filter((r) => r.status === 'error').length,
    issues: results.filter((r) => r.status === 'error' || r.status === 'skipped'),
  });
}