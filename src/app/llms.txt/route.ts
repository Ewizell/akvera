import { prisma } from '@/lib/prisma'
import { getVisibleCategoryIds } from '@/lib/visibility'
import { SITE_NAME, absoluteUrl } from '@/lib/seo'
import { CONTACTS } from '@/lib/site-content'

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
    `> ${SITE_NAME} — B2B-поставщик промышленного оборудования: насосы, трубопроводная и запорная арматура, котельное и теплообменное оборудование, автоматика. Каталог с характеристиками, ценами и наличием; заказ через корзину, запрос коммерческого предложения или обратный звонок. Цены и наличие носят информационный характер и не являются публичной офертой.`,
    '',
    '## Разделы',
    '',
    `- [Каталог](${absoluteUrl('/catalog')}): все категории оборудования`,
    `- [Все товары](${absoluteUrl('/catalog/all')}): полный список с фильтрами`,
    `- [Бренды](${absoluteUrl('/brands')}): производители оборудования`,
    `- [Решения](${absoluteUrl('/solutions')}): подборки оборудования для отопления и водоснабжения`,
    `- [Доставка](${absoluteUrl('/delivery')}): условия доставки`,
    `- [О компании](${absoluteUrl('/about')}): информация о компании`,
    `- [Запрос КП и обратный звонок](${absoluteUrl('/request')}): заявка на коммерческое предложение со спецификацией`,
    `- [Полная версия](${absoluteUrl('/llms-full.txt')}): о компании, доставка и оплата, частые вопросы, структура каталога`,
    '',
    '## Категории',
    '',
    ...categories.map(
      (c) => `- [${c.name.trim()}](${absoluteUrl(`/category/${c.slug}`)})`
    ),
    '',
    '## Бренды',
    '',
    ...brands.map((b) => `- [${b.name.trim()}](${absoluteUrl(`/brands/${b.slug}`)})`),
    '',
    '## Контакты',
    '',
    '- Электронная почта: info@akvera.ru, sales@akvera.ru',
    `- Телефон: ${CONTACTS.phone}`,
    `- Адрес: ${CONTACTS.address}`,
    `- Часы работы: ${CONTACTS.hours}`,
    ...(CONTACTS.telegram ? [`- Telegram: ${CONTACTS.telegram}`] : []),
    '- Адрес: Одинцово, ул. Внуковская, 11с19',
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}