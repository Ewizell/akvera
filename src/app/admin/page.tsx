import Link from 'next/link'
import { LeadStatus, OrderStatus } from '@/generated/prisma/enums'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const numberFormatter = new Intl.NumberFormat('ru-RU')
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const orderStatusLabel: Record<OrderStatus, string> = {
  NEW: 'Новый',
  PROCESSING: 'В работе',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
}

const orderStatusClass: Record<OrderStatus, string> = {
  NEW: 'bg-[#eef1f8] text-[#465d82]',
  PROCESSING: 'bg-[#fff5df] text-[#9a6a16]',
  COMPLETED: 'bg-[#eaf7ef] text-[#32754b]',
  CANCELLED: 'bg-[#f9ecec] text-[#a14a4a]',
}

const leadStatusLabel: Record<LeadStatus, string> = {
  NEW: 'Новая',
  IN_PROGRESS: 'В работе',
  DONE: 'Обработана',
  CANCELLED: 'Отменена',
  SPAM: 'Спам',
}

export default async function AdminDashboardPage() {
  const [
    productCount,
    variantCount,
    visibleProductCount,
    lowStockVariantCount,
    newOrderCount,
    processingOrderCount,
    newLeadCount,
    activeLeadCount,
    recentOrders,
    recentLeads,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.product.count({ where: { isHidden: false } }),
    prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
    prisma.order.count({ where: { status: OrderStatus.NEW } }),
    prisma.order.count({ where: { status: OrderStatus.PROCESSING } }),
    prisma.lead.count({ where: { status: LeadStatus.NEW } }),
    prisma.lead.count({ where: { status: LeadStatus.IN_PROGRESS } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        contactName: true,
        status: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, type: true, status: true, createdAt: true },
    }),
  ])

  const stats = [
    {
      label: 'Новые заявки',
      value: newLeadCount,
      description: activeLeadCount ? `ещё ${activeLeadCount} в работе` : 'нет заявок в работе',
      href: '/admin/leads?status=NEW',
      accent: 'bg-[#f0f4fb] text-[#3f5b85]',
      icon: <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2h-5l-4 4v-4H6a2 2 0 01-2-2V5zM8 8h8M8 12h5" />,
    },
    {
      label: 'Новые заказы',
      value: newOrderCount,
      description: processingOrderCount ? `ещё ${processingOrderCount} в обработке` : 'нет заказов в обработке',
      href: '/admin/orders?status=NEW',
      accent: 'bg-[#fff4df] text-[#9a6a16]',
      icon: <path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4" />,
    },
    {
      label: 'Товары в каталоге',
      value: visibleProductCount,
      description: `из ${productCount} всего`,
      href: '/admin/products',
      accent: 'bg-[#eaf7ef] text-[#32754b]',
      icon: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    },
    {
      label: 'Мало на складе',
      value: lowStockVariantCount,
      description: `из ${variantCount} вариантов`,
      href: '/admin/products',
      accent: lowStockVariantCount ? 'bg-[#f9ecec] text-[#a14a4a]' : 'bg-[#f3f5f7] text-[#697482]',
      icon: <path d="M12 9v4m0 4h.01M10.3 3.4L2.7 17a2 2 0 001.74 3h15.12a2 2 0 001.74-3L13.7 3.4a2 2 0 00-3.4 0z" />,
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f8fa] to-[#eef0f3] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a93a1] shadow-sm ring-1 ring-black/[0.04]">
              Администрирование
              <span className="h-1 w-1 rounded-full bg-[#c29e57]" />
              Обзор
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1e2a38]">Панель управления</h1>
            <p className="mt-1.5 text-sm text-[#737d8c]">Главное по каталогу, обращениям и заказам.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/admin/products" className="inline-flex h-10 items-center rounded-xl bg-[#28394c] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#344a62]">
              Добавить товар
            </Link>
            <Link href="/admin/leads?status=NEW" className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-[#52606f] shadow-sm ring-1 ring-black/[0.05] transition hover:bg-[#f6f7f8] hover:text-[#28394c]">
              Открыть заявки
            </Link>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ключевые показатели">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="group rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.accent}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {stat.icon}
                  </svg>
                </span>
                <span className="text-xs font-medium text-[#98a0aa] transition group-hover:text-[#52606f]">Открыть →</span>
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight text-[#28313d]">{numberFormatter.format(stat.value)}</p>
              <p className="mt-1 text-sm font-medium text-[#52606f]">{stat.label}</p>
              <p className="mt-1 text-xs text-[#98a0aa]">{stat.description}</p>
            </Link>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#28313d]">Последние заказы</h2>
                <p className="mt-0.5 text-xs text-[#98a0aa]">Новые обращения из корзины</p>
              </div>
              <Link href="/admin/orders" className="text-xs font-semibold text-[#405b7d] transition hover:text-[#28394c]">Все заказы →</Link>
            </div>

            {recentOrders.length ? (
              <div className="divide-y divide-black/[0.05]">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/admin/orders?search=${order.orderNumber}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f6] text-xs font-bold text-[#40516a]">#{order.orderNumber}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#34404e]">{order.contactName}</span>
                      <span className="block text-xs text-[#98a0aa]">{dateFormatter.format(order.createdAt)} · {order._count.items} поз.</span>
                    </span>
                    <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold ${orderStatusClass[order.status]}`}>{orderStatusLabel[order.status]}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState label="Заказов пока нет" />
            )}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#28313d]">Последние заявки</h2>
                <p className="mt-0.5 text-xs text-[#98a0aa]">Запросы обратного звонка и КП</p>
              </div>
              <Link href="/admin/leads" className="text-xs font-semibold text-[#405b7d] transition hover:text-[#28394c]">Все заявки →</Link>
            </div>

            {recentLeads.length ? (
              <div className="divide-y divide-black/[0.05]">
                {recentLeads.map((lead) => (
                  <Link key={lead.id} href="/admin/leads" className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f6] text-[#40516a]">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        {lead.type === 'QUOTE' ? <path d="M4 4h16v12H7l-3 3V4zM8 8h8M8 12h5" /> : <path d="M8 3h8v18H8zM10 7h4M10 11h4M10 15h4" />}
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#34404e]">{lead.name}</span>
                      <span className="block text-xs text-[#98a0aa]">{lead.type === 'QUOTE' ? 'Запрос КП' : 'Обратный звонок'} · {dateFormatter.format(lead.createdAt)}</span>
                    </span>
                    <span className="shrink-0 rounded-lg bg-[#f1f3f6] px-2 py-1 text-[10px] font-semibold text-[#657180]">{leadStatusLabel[lead.status]}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState label="Заявок пока нет" />
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#dde4eb] bg-[#eaf0f5] p-4 sm:flex sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-sm font-semibold text-[#28394c]">Быстрый старт</h2>
            <p className="mt-1 text-sm text-[#637183]">Пополняйте каталог, поддерживайте актуальные остатки и своевременно обрабатывайте обращения.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:pl-6">
            <Link href="/admin/categories" className="rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[#52606f] shadow-sm ring-1 ring-black/[0.05] transition hover:text-[#28394c]">Категории</Link>
            <Link href="/admin/import-export" className="rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[#52606f] shadow-sm ring-1 ring-black/[0.05] transition hover:text-[#28394c]">Импорт и экспорт</Link>
          </div>
        </section>
      </div>
    </main>
  )
}

function EmptyState({ label }: { label: string }) {
  return <div className="flex min-h-32 items-center justify-center rounded-xl bg-[#f8f9fa] text-sm text-[#98a0aa]">{label}</div>
}
