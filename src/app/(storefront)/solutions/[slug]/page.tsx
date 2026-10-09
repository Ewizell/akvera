import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getSolution, SOLUTIONS } from '@/lib/solutions'
import { absoluteUrl } from '@/lib/seo'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return SOLUTIONS.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const solution = getSolution((await params).slug)
  if (!solution) return {}

  const url = absoluteUrl(`/solutions/${solution.slug}`)

  return {
    title: solution.title,
    description: solution.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${solution.title} | Akvera`,
      description: solution.description,
      url,
      type: 'website',
    },
  }
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M3 8l3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default async function SolutionPage({ params }: Params) {
  const solution = getSolution((await params).slug)
  if (!solution) notFound()

  // Категории каталога, привязанные к решению
  const found = await prisma.category.findMany({
    where: { slug: { in: solution.categorySlugs } },
    select: { slug: true, name: true },
  })

  // Сохраняем порядок категорий из solution.categorySlugs
  const categories = solution.categorySlugs
    .map((slug) => found.find((category) => category.slug === slug))
    .filter(
      (category): category is { slug: string; name: string } =>
        Boolean(category),
    )

  // Если категорий нет в БД — ведём в общий каталог
  const catalogHref = categories[0]
    ? `/category/${categories[0].slug}`
    : '/catalog'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: solution.title,
    description: solution.description,
    url: absoluteUrl(`/solutions/${solution.slug}`),
    audience: {
      '@type': 'BusinessAudience',
      audienceType: solution.audience,
    },
    provider: {
      '@type': 'Organization',
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

      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-5 lg:px-12 lg:pt-6 xl:px-20">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Решения', href: '/solutions' },
            { label: solution.title },
          ]}
        />

        {/* Основной блок решения */}
        <section className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#28313d] to-[#3d5570] text-white sm:mt-6 lg:rounded-3xl">
          <div className="grid lg:grid-cols-[1.2fr_.8fr]">
            <div className="flex min-w-0 flex-col items-start p-5 sm:p-8 lg:p-10 xl:p-12">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/50 sm:text-xs">
                {solution.eyebrow}
              </p>

              <h1 className="mt-3 text-[27px] font-medium leading-[1.15] tracking-[-0.025em] sm:mt-4 sm:text-4xl lg:text-[42px]">
                {solution.title}
              </h1>

              <p className="mt-4 max-w-2xl text-[13px] leading-5 text-white/65 sm:mt-5 sm:text-base sm:leading-7">
                {solution.description}
              </p>

              <div className="mt-6 flex w-full flex-col gap-2.5 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
                <Link
                  href="/request"
                  className="group inline-flex h-11 w-full items-center rounded-xl bg-accent px-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent-hover sm:h-12 sm:w-auto"
                >
                  <span className="flex flex-1 items-center justify-center px-3 sm:px-4">
                    Получить подбор
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 transition-colors duration-300 group-hover:bg-white/25 sm:h-9 sm:w-9">
                    <ArrowRight
                      size={16}
                      strokeWidth={1.8}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>

                <Link
                  href={catalogHref}
                  className="group inline-flex h-11 w-full items-center rounded-xl border border-white/20 bg-white/[0.06] px-1.5 text-sm font-medium text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/12 sm:h-12 sm:w-auto"
                >
                  <span className="flex flex-1 items-center justify-center px-3 sm:px-4">
                    Открыть каталог
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

            {/* Информация о задаче */}
            <aside className="grid grid-cols-1 border-t border-white/10 bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-1 lg:border-l lg:border-t-0">
              <div className="p-5 sm:p-6 lg:p-8 xl:p-10">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/45 sm:text-xs">
                  Подходит для
                </p>

                <p className="mt-3 text-base font-medium leading-6 sm:text-lg sm:leading-7">
                  {solution.audience}
                </p>
              </div>

              <div className="border-t border-white/10 p-5 sm:border-l sm:border-t-0 sm:p-6 lg:border-l-0 lg:border-t lg:p-8 xl:p-10">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/45 sm:text-xs">
                  Результат
                </p>

                <p className="mt-3 text-[13px] leading-5 text-white/65 sm:text-sm sm:leading-6">
                  {solution.result}
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* Категории оборудования */}
        {categories.length > 0 && (
          <section className="mt-8 sm:mt-10">
            <div className="mb-4 sm:mb-5">
              <h2 className="text-xl font-medium tracking-tight text-[#28313d] sm:text-2xl">
                Оборудование в каталоге
              </h2>

              <p className="mt-2 text-[13px] leading-5 text-[#66717d] sm:text-sm sm:leading-6">
                Категории оборудования, связанные с этим решением.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {categories.map((category, index) => {
                const inverted = index % 2 === 1

                return (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    className={[
                      'group relative isolate flex min-h-[76px] min-w-0 items-center justify-between gap-2 overflow-hidden rounded-2xl p-3.5 sm:min-h-[88px] sm:p-5',
                      inverted
                        ? 'bg-gradient-to-br from-[#28313d] to-[#3d5570]'
                        : 'bg-white',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        'pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                        inverted
                          ? 'bg-[#e2f0ef]'
                          : 'bg-gradient-to-br from-accent to-accent-end',
                      ].join(' ')}
                    />

                    <span
                      className={[
                        'min-w-0 text-[12px] font-medium leading-[1.4] transition-colors duration-500 sm:text-sm',
                        inverted
                          ? 'text-white group-hover:text-[#28313d]'
                          : 'text-[#28313d] group-hover:text-white',
                      ].join(' ')}
                    >
                      {category.name}
                    </span>

                    <span
                      className={[
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-500 sm:h-8 sm:w-8',
                        inverted
                          ? 'bg-white/10 text-white group-hover:bg-white group-hover:text-accent'
                          : 'bg-[#f3f4f7] text-accent group-hover:bg-white/15 group-hover:text-white',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      <ArrowRight
                        size={15}
                        strokeWidth={1.8}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Как работаем и что получает заказчик */}
        <section className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <div className="min-w-0 overflow-hidden rounded-2xl bg-white p-5 sm:p-7 lg:p-8">
            <h2 className="text-xl font-medium tracking-tight text-[#28313d] sm:text-2xl">
              Как работаем
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3">
              {solution.steps.map((step, index) => {
                const inverted = index % 2 === 1

                return (
                  <div
                    key={step.title}
                    className={[
                      'group relative isolate min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5',
                      inverted
                        ? 'bg-gradient-to-br from-[#28313d] to-[#3d5570]'
                        : 'bg-[#f4f5f7]',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        'pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                        inverted
                          ? 'bg-[#e2f0ef]'
                          : 'bg-gradient-to-br from-accent to-accent-end',
                      ].join(' ')}
                    />

                    <span
                      className={[
                        'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors duration-500 sm:h-9 sm:w-9',
                        inverted
                          ? 'bg-white/15 text-white group-hover:bg-white group-hover:text-accent'
                          : 'bg-white text-accent group-hover:bg-white/15 group-hover:text-white',
                      ].join(' ')}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <h3
                      className={[
                        'mt-4 text-sm font-medium leading-snug transition-colors duration-500 sm:mt-5 sm:text-base',
                        inverted
                          ? 'text-white group-hover:text-[#28313d]'
                          : 'text-[#28313d] group-hover:text-white',
                      ].join(' ')}
                    >
                      {step.title}
                    </h3>

                    <p
                      className={[
                        'mt-2 text-[12px] leading-[1.5] transition-colors duration-500 sm:text-sm sm:leading-6',
                        inverted
                          ? 'text-white/65 group-hover:text-[#66717d]'
                          : 'text-[#66717d] group-hover:text-white/75',
                      ].join(' ')}
                    >
                      {step.text}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mt-7 border-t border-[#e4e7eb] pt-6 sm:mt-8 sm:pt-7">
              <h2 className="text-xl font-medium tracking-tight text-[#28313d] sm:text-2xl">
                Что вы получите
              </h2>

              <ul className="mt-4 space-y-3 sm:mt-5">
                {solution.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 text-[13px] leading-5 text-[#52606f] sm:text-sm sm:leading-6"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#e8f5ec] text-[#179146]">
                      <CheckIcon />
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Что подготовить для подбора */}
          <aside className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#28313d] to-[#3d5570] p-5 text-white sm:p-7 lg:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/50 sm:text-xs">
              Чтобы начать
            </p>

            <h2 className="mt-3 text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
              Пришлите вводные
            </h2>

            <p className="mt-3 text-[13px] leading-5 text-white/65 sm:text-sm sm:leading-6">
              Достаточно коротко описать задачу. Если есть план, спецификация
              или фото — приложите их к заявке.
            </p>

            <ul className="mt-5 space-y-3">
              {solution.checklist.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[13px] leading-5 text-white/80 sm:text-sm sm:leading-6"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/10 text-[#77cb98]">
                    <CheckIcon />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 sm:mt-8">
              <Link
                href="/request"
                className="group/button inline-flex h-11 w-full items-center rounded-xl bg-white px-1.5 text-sm font-medium text-[#28313d] transition-colors duration-300 hover:bg-[#f4f5f7] sm:h-12"
              >
                <span className="flex flex-1 items-center justify-center px-3 sm:px-4">
                  Оставить заявку
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e5e8eb] transition-colors duration-300 group-hover/button:bg-accent group-hover/button:text-white sm:h-9 sm:w-9">
                  <ArrowRight
                    size={16}
                    strokeWidth={1.8}
                    className="transition-transform duration-200 group-hover/button:translate-x-0.5"
                  />
                </span>
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
