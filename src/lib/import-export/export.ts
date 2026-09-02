import { prisma } from '@/lib/prisma';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function generateYmlFeed(baseUrl: string): Promise<string> {
  const variants = await prisma.productVariant.findMany({
    where: { price: { not: null } },
    include: { product: { include: { brand: true } }, images: { orderBy: { sortOrder: 'asc' } } },
  });
  const categories = await prisma.category.findMany();

  const categoriesXml = categories
    .map((c) => `<category id="${c.id}"${c.parentId ? ` parentId="${c.parentId}"` : ''}>${esc(c.name)}</category>`)
    .join('\n');

  const offersXml = variants
    .map((v) => {
      const picture = v.images[0] ? `<picture>${esc(baseUrl + v.images[0].url)}</picture>` : '';
      const params = Object.entries((v.attributes as Record<string, unknown>) ?? {})
        .filter(([, val]) => val !== null && val !== undefined && val !== '')
        .map(([key, val]) => `<param name="${esc(key)}">${esc(String(val))}</param>`)
        .join('\n');
      const description = v.description ?? v.product.description ?? '';

      return `<offer id="${v.id}" available="${v.stock > 0 ? 'true' : 'false'}">
<name>${esc(v.name)}</name>
${v.product.brand ? `<vendor>${esc(v.product.brand.name)}</vendor>` : ''}
<vendorCode>${esc(v.sku)}</vendorCode>
<url>${esc(`${baseUrl}/product/${v.slug}`)}</url>
${picture}
<price>${v.price}</price>
<currencyId>RUB</currencyId>
<categoryId>${v.product.categoryId}</categoryId>
<description><![CDATA[${description}]]></description>
${params}
</offer>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${new Date().toISOString()}">
<shop>
<name>Akvera</name>
<company>Akvera</company>
<url>${baseUrl}</url>
<currencies><currency id="RUB" rate="1"/></currencies>
<categories>
${categoriesXml}
</categories>
<offers>
${offersXml}
</offers>
</shop>
</yml_catalog>`;
}

export async function generateCsvExport(): Promise<string> {
  const variants = await prisma.productVariant.findMany({
    include: { product: { include: { brand: true } } },
  });

  const categoryCache = new Map<string, string>();
  async function categoryPathOf(categoryId: string): Promise<string> {
    if (categoryCache.has(categoryId)) return categoryCache.get(categoryId)!;
    const parts: string[] = [];
    let cur = await prisma.category.findUnique({ where: { id: categoryId } });
    while (cur) {
      parts.unshift(cur.name);
      cur = cur.parentId ? await prisma.category.findUnique({ where: { id: cur.parentId } }) : null;
    }
    const path = parts.join('>>>');
    categoryCache.set(categoryId, path);
    return path;
  }

  const escCsv = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ['SKU', 'Brand', 'Category', 'Title', 'Description', 'Text', 'Price', 'Stock', 'SEO title', 'SEO descr', 'SEO keywords'];
  const rows = [header.map(escCsv).join(';')];

  for (const v of variants) {
    const categoryPath = await categoryPathOf(v.product.categoryId);
    rows.push(
      [v.sku, v.product.brand?.name ?? '', categoryPath, v.name, v.product.shortDescription ?? '', v.description ?? '', v.price?.toString() ?? '', v.stock.toString(), v.metaTitle ?? '', v.metaDescription ?? '', v.metaKeywords ?? '']
        .map((s) => escCsv(String(s)))
        .join(';')
    );
  }
  return rows.join('\n');
}