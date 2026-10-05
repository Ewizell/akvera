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
    include: {
      items: {
        include: {
          variant: true,
        },
      },
    },
  })

  if (!order) notFound()

  const total = order.items.reduce(
    (sum, item) =>
      item.priceAtOrder !== null
        ? sum + Number(item.priceAtOrder) * item.quantity
        : sum,
    0
  )

  const hasRequestPriceItems = order.items.some(
    (item) => item.priceAtOrder === null
  )

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f4f5f7] px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-[680px]">
        <div className="overflow-hidden rounded-2xl border border-[#e5e8eb] bg-white">
          {/* Верхний блок */}
          <div className="flex flex-col items-center px-5 py-8 text-center sm:px-8 sm:py-10">
            {/* Иконка успешной отправки */}
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f6ed]">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-accent"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <h1 className="text-[24px] font-semibold leading-tight text-[#28313d] sm:text-[28px]">
              Заявка принята
            </h1>

            <p className="mt-3 max-w-[500px] text-[14px] leading-6 text-[#66717d] sm:text-[15px]">
              Спасибо за обращение. Мы свяжемся с вами по телефону{' '}
              <span className="font-medium text-[#28313d]">
                {order.contactPhone}
              </span>{' '}
              в ближайшее время.
            </p>

            {/* Номер заявки */}
            <div className="mt-7 flex flex-col items-center">
              <span className="text-[13px] font-medium text-[#929aa6]">
                Номер заявки
              </span>

              <span className="mt-1 font-mono text-[32px] font-semibold leading-none tracking-[-0.02em] text-accent sm:text-[40px]">
                №{order.orderNumber}
              </span>
            </div>
          </div>

          {/* Состав заявки */}
          <div className="border-t border-[#e5e8eb] px-5 py-6 sm:px-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-[16px] font-semibold text-[#28313d]">
                Состав заявки
              </h2>

              <div className="flex flex-col">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 border-t border-[#eef0f2] py-3 first:border-t-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] leading-5 text-[#28313d]">
                        {item.variant.name}
                      </p>

                      <p className="mt-1 text-[13px] text-[#929aa6]">
                        Количество: {item.quantity}
                      </p>
                    </div>

                    <div className="shrink-0 text-right text-[14px] font-medium text-[#28313d]">
                      {item.priceAtOrder !== null
                        ? `${(
                            Number(item.priceAtOrder) * item.quantity
                          ).toLocaleString('ru-RU')} ₽`
                        : 'По запросу'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Итоговая стоимость */}
              <div className="mt-1 border-t border-[#e5e8eb] pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[14px] text-[#66717d]">
                    Итого
                  </span>

                  <span className="text-[20px] font-semibold text-[#28313d]">
                    {total.toLocaleString('ru-RU')} ₽
                    {hasRequestPriceItems && (
                      <span className="text-[14px] font-normal text-[#929aa6]">
                        {' '}
                        +
                      </span>
                    )}
                  </span>
                </div>

                {hasRequestPriceItems && (
                  <div className="mt-3 flex gap-2">
                    <span className="mt-0.5 h-4 w-[3px] shrink-0 rounded-full bg-accent" />

                    <p className="text-[13px] leading-5 text-[#66717d]">
                      Часть товаров имеет цену по запросу. Итоговая сумма
                      будет уточнена менеджером при обработке заявки.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Действия */}
          <div className="border-t border-[#e5e8eb] px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-2.5">
              <Link
                href="/catalog"
                className="
                  flex h-11 items-center justify-center
                  rounded-xl
                  bg-accent
                  px-4
                  text-[14px]
                  font-semibold
                  text-white
                  transition-colors
                  duration-200
                  hover:bg-accent-hover
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-accent/30
                "
              >
                Вернуться в каталог
              </Link>

              <Link
                href="/"
                className="
                  flex h-11 items-center justify-center
                  rounded-xl
                  bg-[#e5e8eb]
                  px-4
                  text-[14px]
                  font-semibold
                  text-[#28313d]
                  transition-colors
                  duration-200
                  hover:bg-[#dce0e4]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-accent/30
                "
              >
                На главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}