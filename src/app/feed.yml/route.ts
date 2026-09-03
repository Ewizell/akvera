import { prisma } from '@/lib/prisma'

export const revalidate = 3600 // фид пересобирается не чаще раза в час

function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, parentId: true },
  })

  const variants = await prisma.productVariant.findMany({
    where: { price: { not: null } },
    include: {
      product: { include: { brand: true } },
      images: { orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }] },
    },
  })

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

  const categoriesXml = categories
    .map(
      (c) =>
        `<category id="${c.id}"${c.parentId ? ` parentId="${c.parentId}"` : ''}>${escapeXml(c.name)}</category>`
    )
    .join('\n')

  const offersXml = variants
    .map((v) => {
      const description = v.description || v.product.description
      const pictures = v.images.map((img) => `<picture>${siteUrl}${img.url}</picture>`).join('\n  ')
      return `<offer id="${v.id}" available="${v.stock > 0}">
  <url>${siteUrl}/product/${v.slug}</url>
  <price>${Number(v.price)}</price>
  <currencyId>RUB</currencyId>
  <categoryId>${v.product.categoryId}</categoryId>
  ${pictures}
  <name>${escapeXml(v.product.name)}${v.name ? ` ${escapeXml(v.name)}` : ''}</name>
  ${v.product.brand ? `<vendor>${escapeXml(v.product.brand.name)}</vendor>` : ''}
  ${v.sku ? `<vendorCode>${escapeXml(v.sku)}</vendorCode>` : ''}
  ${description ? `<description>${escapeXml(description.replace(/<[^>]*>/g, '').slice(0, 3000))}</description>` : ''}
</offer>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${now}">
<shop>
<name>Akvera</name>
<company>Akvera</company>
<url>${siteUrl}</url>
<currencies>
<currency id="RUB" rate="1"/>
</currencies>
<categories>
${categoriesXml}
</categories>
<offers>
${offersXml}
</offers>
</shop>
</yml_catalog>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}