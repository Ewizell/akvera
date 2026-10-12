import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import LeadRequestBlock from '@/components/LeadRequestBlock'
import { HomeSteps } from '@/components/HomeInfoBlocks' // ← твой файл с HomeSteps
import { absoluteUrl } from '@/lib/seo'

const TITLE = 'Запрос коммерческого предложения'
const DESCRIPTION =
  'Отправьте заявку на подбор оборудования Akvera: проверим наличие, стоимость и подготовим коммерческое предложение.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('/request') },
  openGraph: {
    title: `${TITLE} | Akvera`,
    description: DESCRIPTION,
    url: absoluteUrl('/request'),
    type: 'website',
  },
}

export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode: modeParam } = await searchParams
  const mode = modeParam === 'callback' ? 'callback' : 'quote'
  const isCallback = mode === 'callback'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl('/request'),
    isPartOf: { '@type': 'WebSite', name: 'Akvera', url: absoluteUrl('/') },
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-5 lg:px-12 lg:pt-6 xl:px-20">
        <Breadcrumbs
          items={[{ label: 'Главная', href: '/' }, { label: 'Заявка' }]}
        />

        <header className="mt-5 sm:mt-6">
          <h1 className="max-w-4xl text-[27px] font-semibold leading-[1.15] tracking-[-0.025em] text-[#28313d] sm:text-4xl lg:text-[42px]">
            {isCallback ? 'Заказать обратный звонок' : TITLE}
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-5 text-[#66717d] sm:mt-4 sm:text-base sm:leading-7">
            {isCallback ? (
              <>
                Оставьте имя и телефон. <br />
                Менеджер перезвонит и ответит на вопросы по подбору и наличию.
              </>
            ) : (
              <>
                Опишите задачу или приложите спецификацию. <br />
                Менеджер уточнит детали, проверит наличие и пришлёт предложение.
              </>
            )}
          </p>
        </header>

        <LeadRequestBlock key={mode} defaultMode={mode} className="mt-6 sm:mt-8" />

        <section className="mt-8 sm:mt-10">
          <h2 className="mb-4 text-xl font-medium tracking-tight text-[#28313d] sm:mb-5 sm:text-2xl">
            Что будет дальше
          </h2>
          <HomeSteps />
        </section>
      </div>
    </main>
  )
}