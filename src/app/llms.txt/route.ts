import { prisma } from '@/lib/prisma'
import { getVisibleCategoryIds } from '@/lib/visibility'
import { SITE_NAME, absoluteUrl } from '@/lib/seo'

export const revalidate = 3600

export async function GET() {
  const visibleCategoryIds = await getVisibleCategoryIds()

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null, id: { in: visibleCategoryIds } },
      orderBy: { name: 'asc' },
      select: { slug: true, name: true },
    }),
    prisma.brand.findMany({
      where: { products: { some: { isHidden: false } } },
      orderBy: { name: 'asc' },
      select: { slug: true, name: true },
    }),
  ])

  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> Каталог оборудования ${SITE_NAME}: категории, бренды, цены, наличие и характеристики. Заказ и консультации по электронной почте.`,
    '',
    '## Разделы',
    '',
    `- [Каталог](${absoluteUrl('/catalog')}): все категории оборудования`,
    `- [Все товары](${absoluteUrl('/catalog/all')}): полный список с фильтрами`,
    `- [Бренды](${absoluteUrl('/brands')}): производители оборудования`,
    `- [Решения](${absoluteUrl('/solutions')}): подборки оборудования для отопления и водоснабжения`,
    `- [Доставка](${absoluteUrl('/delivery')}): условия доставки`,
    `- [О компании](${absoluteUrl('/about')}): информация о компании`,
    '',
    '## Категории',
    '',
    ...categories.map(
      (c) => `- [${c.name}](${absoluteUrl(`/category/${c.slug}`)})`
    ),
    '',
    '## Бренды',
    '',
    ...brands.map((b) => `- [${b.name}](${absoluteUrl(`/brands/${b.slug}`)})`),
    '',
    '## Контакты',
    '',
    '- Электронная почта: info@akvera.ru, sales@akvera.ru',
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}