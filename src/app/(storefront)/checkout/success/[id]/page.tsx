import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { variant: true } } },
  })

  if (!order) notFound()

  const total = order.items.reduce(
    (sum, item) => (item.priceAtOrder !== null ? sum + Number(item.priceAtOrder) * item.quantity : sum),
    0
  )
  const hasRequestPriceItems = order.items.some((item) => item.priceAtOrder === null)

  return (
    <main className="bg-[#f8fafc] py-16">
      <div className="max-w-[640px] mx-auto px-4">
        <div className="bg-white border border-[#e5e7e8] rounded-2xl shadow-[0px_6px_18px_0px_rgba(15,23,42,0.07)] p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#e7f5ec] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#179146" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <h1 className="text-[28px] font-semibold text-[#1c2126]">Заявка принята</h1>

          <p className="text-[#475569] text-[15px] max-w-md">
            Мы свяжемся с вами по телефону{' '}
            <span className="font-medium text-[#1c2126]">{order.contactPhone}</span> в ближайшее время.
          </p>

          <div className="flex items-center gap-2 bg-[#f4f5f7] rounded-lg px-4 py-2 font-semibold text-[24px] text-[#179146]">
            Номер заявки:
            <span className="font-mono text-[36px] text-[#475569]">№{order.orderNumber}</span>
          </div>

          <div className="h-px w-full bg-[#e5e7e8] my-2" />

          <div className="w-full flex flex-col gap-2 text-left">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-[14px] text-[#1c2126] py-1">
                <span>
                  {item.variant.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  {item.priceAtOrder !== null
                    ? `${(Number(item.priceAtOrder) * item.quantity).toLocaleString('ru-RU')} ₽`
                    : 'По запросу'}
                </span>
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-[#e5e7e8]" />

          <div className="w-full flex justify-between items-center">
            <span className="text-[15px] text-[#475569]">Итого</span>
            <span className="text-[22px] font-bold text-[#1c2126]">
              {total.toLocaleString('ru-RU')} ₽{hasRequestPriceItems && <span className="text-[14px] font-normal text-[#767d83]"> +</span>}
            </span>
          </div>
          {hasRequestPriceItems && (
            <p className="text-xs text-[#767d83] -mt-2 w-full text-left">
              Часть товаров с ценой по запросу — сумма будет уточнена при обработке заявки
            </p>
          )}

          <Link
            href="/catalog"
            className="w-full bg-[#179146] text-white text-center rounded-xl py-3 font-semibold hover:bg-[#137a3a] transition-colors mt-2"
          >
            Вернуться в каталог
          </Link>

          <Link href="/" className="w-full h-[44px] flex items-center justify-center bg-[#f0f0f0] hover:bg-[#e5e5e5] rounded-[12px] font-montserrat font-semibold text-[16px] text-[#1c2116] transition-colors">
            На главную
          </Link>
        </div>
      </div>
    </main>
  )
}