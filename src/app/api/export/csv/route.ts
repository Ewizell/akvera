import { NextResponse } from 'next/server';
import { generateCsvExport } from '@/lib/import-export/export';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const csv = await generateCsvExport();
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="akvera-export.csv"',
      'Cache-Control': 'no-store',
    },
  });
}