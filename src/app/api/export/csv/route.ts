import { NextResponse } from 'next/server';
import { generateCsvExport } from '@/lib/import-export/export';

export async function GET() {
  const csv = await generateCsvExport();
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="akvera-export.csv"',
    },
  });
}