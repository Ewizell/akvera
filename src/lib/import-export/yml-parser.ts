import { XMLParser } from 'fast-xml-parser';
import type { ImportRow } from './types';

export function parseYmlImport(fileContent: string): ImportRow[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
  });
  const doc = parser.parse(fileContent);
  const shop = doc.yml_catalog?.shop;
  if (!shop) return [];

  const rawCategories = Array.isArray(shop.categories?.category)
    ? shop.categories.category
    : shop.categories?.category ? [shop.categories.category] : [];

  const catMap = new Map<string, { name: string; parentId?: string }>();
  for (const c of rawCategories) {
    catMap.set(String(c['@_id']), {
      name: typeof c === 'object' ? (c['#text'] ?? '') : String(c),
      parentId: c['@_parentId'] ? String(c['@_parentId']) : undefined,
    });
  }

  // строим путь до тех пор, пока родитель есть в присланном файле —
  // родительский узел вроде "вторые помои" в этом экспорте отсутствует,
  // так что уровень отсекается сам собой
  function pathFor(categoryId: string): string[] {
    const path: string[] = [];
    let cur: string | undefined = categoryId;
    while (cur && catMap.has(cur)) {
      const node = catMap.get(cur)!;
      path.unshift(node.name);
      cur = node.parentId;
    }
    return path;
  }

  const rawOffers = Array.isArray(shop.offers?.offer)
    ? shop.offers.offer
    : shop.offers?.offer ? [shop.offers.offer] : [];

  return rawOffers.map((o: any): ImportRow => {
    const desc = typeof o.description === 'object' ? (o.description.__cdata ?? '') : (o.description ?? '');
    return {
      externalId: String(o['@_id'] ?? ''),
      sku: (o.vendorCode ?? '').toString().trim(),
      // в этом файле тег назван <n>, не <name> — на всякий случай проверяем оба
      name: (o.n ?? o.name ?? '').toString().trim(),
      brandName: o.vendor ? String(o.vendor).trim() : undefined,
      categoryPath: pathFor(String(o.categoryId ?? '')),
      description: desc.trim() || undefined,
      price: o.price !== undefined ? parseFloat(String(o.price)) : undefined,
      imageUrl: Array.isArray(o.picture) ? o.picture[0] : o.picture,
    };
  });
}