import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import DeliveryPlanner from '@/components/DeliveryPlanner'
import { HomeDelivery } from '@/components/HomeContentBlocks'
import { HomeCta } from '@/components/HomeInfoBlocks'
import { CONTACTS } from '@/lib/site-content'
import { absoluteUrl } from '@/lib/seo'

const TITLE = 'Доставка и оплата'
const DESCRIPTION =
  'Условия поставки промышленного оборудования Akvera: транспортные компании, самовывоз, безналичная оплата и документы.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('/delivery') },
  openGraph: {
    title: `${TITLE} | Akvera`,
    description: DESCRIPTION,
    url: absoluteUrl('/delivery'),
    type: 'website',
  },
}

export default function DeliveryPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl('/delivery'),
    isPartOf: {
      '@type': 'WebSite',
      name: 'Akvera',
      url: absoluteUrl('/'),
    },
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-4 sm:px-6 sm:pb-20 sm:pt-5 lg:px-12 lg:pt-6 xl:px-20">
        <Breadcrumbs
          items={[{ label: 'Главная', href: '/' }, { label: TITLE }]}
        />

        {/* Вводный блок */}
        <section className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#28313d] to-[#3d5570] text-white sm:mt-6 lg:rounded-3xl">
          <div className="relative max-w-4xl p-5 sm:p-8 lg:p-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#77cb98] sm:text-xs">
              Akvera
            </p>

            <h1 className="mt-3 max-w-3xl text-[27px] font-medium leading-[1.15] tracking-[-0.025em] sm:mt-4 sm:text-4xl lg:text-[42px]">
              Доставка без лишних согласований
            </h1>

            <p className="mt-4 max-w-2xl text-[13px] leading-5 text-white/70 sm:mt-5 sm:text-base sm:leading-7">
              Подберём удобный способ получения, подготовим документы <br/> и
              согласуем все условия до отгрузки.
            </p>

            <div className="mt-6 flex w-full flex-col gap-2.5 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
              <a
                href={`tel:${CONTACTS.phone.replace(/[^\d+]/g, '')}`}
                className="group inline-flex h-11 w-full items-center rounded-xl bg-accent px-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#28313d] sm:h-12 sm:w-auto"
              >
                <span className="flex flex-1 items-center justify-center px-3 sm:px-4">
                  Позвонить менеджеру
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 transition-colors duration-300 group-hover:bg-white/25 sm:h-9 sm:w-9">
                  <ArrowRight
                    size={16}
                    strokeWidth={1.8}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </span>
              </a>

              <Link
                href="/request"
                className="group inline-flex h-11 w-full items-center rounded-xl border border-white/20 bg-white/[0.06] px-1.5 text-sm font-medium text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-12 sm:w-auto"
              >
                <span className="flex flex-1 items-center justify-center px-3 sm:px-4">
                  Рассчитать поставку
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] sm:h-9 sm:w-9">
                  <ArrowRight
                    size={16}
                    strokeWidth={1.8}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Планировщик поставки */}
        <DeliveryPlanner />

        {/* Условия поставки и оплаты */}
        <section className="mt-8 sm:mt-10">
          <div className="mb-4 sm:mb-5">
            <h2 className="text-xl font-medium tracking-tight text-[#28313d] sm:text-2xl">
              Условия поставки и оплаты
            </h2>

            <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#66717d] sm:text-sm sm:leading-6">
              Основные варианты получения оборудования и оформления заказа.
            </p>
          </div>

          <HomeDelivery />
        </section>

        {/* CTA */}
        <HomeCta
          eyebrow="Поставка под объект"
          title="Нужна поставка под объект?"
          text="Пришлите список оборудования или спецификацию — подготовим коммерческое предложение."
          primary={{ label: 'Оставить заявку', href: '/request' }}
          secondary={{ label: 'Контакты', href: '/#requisites' }}
        />
      </div>
    </main>
  )
}