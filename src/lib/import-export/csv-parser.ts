import { parse } from 'csv-parse/sync';
import type { ImportRow } from './types';

export function parseCsvImport(fileContent: string): ImportRow[] {
  const records: Record<string, string>[] = parse(fileContent, {
    delimiter: ';',
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    bom: true,
  });

  return records.map((r) => {
    const deepest = (r['Category'] ?? '').split(';')[0] ?? '';
    // отбрасываем первый уровень breadcrumb ("вторые помои") — по договорённости
    const categoryPath = deepest.split('>>>').map((s) => s.trim()).filter(Boolean).slice(1);

    const imageUrl = (r['Photo'] ?? '').split(';')[0]?.trim() || undefined;
    const price = parseFloat((r['Price'] ?? '').replace(',', '.'));

    return {
      externalId: r['Tilda UID'] ?? '',
      sku: r['SKU']?.trim() ?? '',
      name: r['Title']?.trim() ?? '',
      brandName: r['Brand']?.trim() || undefined,
      categoryPath,
      shortDescription: r['Description']?.trim() || undefined,
      description: r['Text']?.trim() || undefined,
      price: Number.isFinite(price) ? price : undefined,
      imageUrl,
      metaTitle: r['SEO title']?.trim() || undefined,
      metaDescription: r['SEO descr']?.trim() || undefined,
      metaKeywords: r['SEO keywords']?.trim() || undefined,
    };
  });
}