import { NextRequest, NextResponse } from 'next/server';
import { generateYmlFeed } from '@/lib/import-export/export';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const baseUrl = req.nextUrl.origin;
  const xml = await generateYmlFeed(baseUrl);
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': 'attachment; filename="akvera-feed.yml"',
      'Cache-Control': 'no-store',
    },
  });
}