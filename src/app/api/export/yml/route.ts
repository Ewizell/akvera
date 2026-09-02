import { NextRequest, NextResponse } from 'next/server';
import { generateYmlFeed } from '@/lib/import-export/export';

export async function GET(req: NextRequest) {
  const baseUrl = req.nextUrl.origin;
  const xml = await generateYmlFeed(baseUrl);
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': 'attachment; filename="akvera-feed.yml"',
    },
  });
}