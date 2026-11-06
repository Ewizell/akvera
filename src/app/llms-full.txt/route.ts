import { prisma } from '@/lib/prisma'
import { getVisibleCategoryIds } from '@/lib/visibility'
import { SITE_NAME, absoluteUrl } from '@/lib/seo'
import {
  ABOUT_PAGE_LEAD,
  ABOUT_PAGE_TEXT,
  ACTIVITIES,
  VALUES,
  DELIVERY_ITEMS,
  FAQ_ITEMS,
  CONTACTS,
  SHOW_REQUISITES,
  REQUISITES,
} from '@/lib/site-content'

export const revalidate = 3600

function stripHtml(value: string | null | undefined) {
  return (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET() {
  const visibleCategoryIds = await getVisibleCategoryIds()

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { id: { in: visibleCategoryIds } },
      orderBy: { name: 'asc' },
      select: { id: true, slug: true, name: true, parentId: true },
    }),
    prisma.brand.findMany({
      where: { products: { some: { isHidden: false } } },
      orderBy: { name: 'asc' },
      select: { slug: true, name: true, description: true },
    }),
  ])

  const roots = categories.filter((c) => c.parentId === null)

  const categoryLines = roots.flatMap((root) => {
    const children = categories.filter((c) => c.parentId === root.id)

    return [
      `- [${root.name.trim()}](${absoluteUrl(`/category/${root.slug}`)})`,
      ...children.map(
        (child) =>
          `  - [${child.name.trim()}](${absoluteUrl(
            `/category/${root.slug}/${child.slug}`
          )})`
      ),
    ]
  })

  const brandLines = brands.map((b) => {
    const description = stripHtml(b.description)
    const link = `- [${b.name.trim()}](${absoluteUrl(`/brands/${b.slug}`)})`

    return description ? `${link}: ${description}` : link
  })

  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_NAME} — B2B-поставщик промышленного оборудования: насосы, трубопроводная и запорная арматура, котельное и теплообменное оборудование, автоматика. Цены и наличие носят информационный характер и не являются публичной офертой.`,
    '',
    '## О компании',
    '',
    ABOUT_PAGE_LEAD,
    '',
    ...ABOUT_PAGE_TEXT.flatMap((p) => [p, '']),
    '## Чем мы занимаемся',
    '',
    ...ACTIVITIES.map((a) => `- **${a.title}.** ${a.text}`),
    '',
    '## Принципы работы',
    '',
    ...VALUES.map((v) => `- **${v.title}.** ${v.text}`),
    '',
    '## Доставка, оплата и гарантия',
    '',
    ...DELIVERY_ITEMS.flatMap((item) => [
      `### ${item.title}`,
      '',
      ...item.points.map((point) => `- ${point}`),
      '',
    ]),
    '## Частые вопросы',
    '',
    ...FAQ_ITEMS.flatMap((item) => [`### ${item.question}`, '', item.answer, '']),
    '## Как заказать',
    '',
    `- Добавьте товары в корзину и оформите заявку: ${absoluteUrl('/cart')}`,
    `- Запрос коммерческого предложения и обратный звонок: ${absoluteUrl('/request')}`,
    `- Список товаров в формате YML: ${absoluteUrl('/feed.yml')}`,
    '',
    '## Каталог',
    '',
    `- [Все категории](${absoluteUrl('/catalog')})`,
    `- [Все товары](${absoluteUrl('/catalog/all')})`,
    '',
    ...categoryLines,
    '',
    '## Бренды',
    '',
    `- [Все бренды](${absoluteUrl('/brands')})`,
    ...brandLines,
    '',
    '## Контакты',
    '',
    '- Электронная почта: info@akvera.ru, sales@akvera.ru',
    `- Телефон: ${CONTACTS.phone}`,
    `- Адрес: ${CONTACTS.address}`,
    `- Часы работы: ${CONTACTS.hours}`,
    ...(CONTACTS.telegram ? [`- Telegram: ${CONTACTS.telegram}`] : []),
    '',
    ...(SHOW_REQUISITES
      ? [
          '## Реквизиты',
          '',
          ...REQUISITES.map((r) => `- ${r.label}: ${r.value}`),
          '',
        ]
      : []),
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}