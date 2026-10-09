import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SOLUTIONS } from '@/lib/solutions'
import { absoluteUrl } from '@/lib/seo'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Инженерные решения',
  description:
    'Подбор инженерного оборудования Akvera для вентиляции, отопления и водоснабжения.',
  alternates: { canonical: absoluteUrl('/solutions') },
  openGraph: {
    title: 'Инженерные решения | Akvera',
    description:
      'Подбор инженерного оборудования Akvera для вентиляции, отопления и водоснабжения.',
    url: absoluteUrl('/solutions'),
    type: 'website',
  },
}

export default async function SolutionsPage() {
  // Берём из БД только категории, привязанные к решениям
  const allSlugs = SOLUTIONS.flatMap((solution) => solution.categorySlugs)

  const categories = await prisma.category.findMany({
    where: { slug: { in: allSlugs } },
    select: { slug: true, name: true },
  })

  const categoryBySlug = new Map(
    categories.map((category) => [category.slug, category]),
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Инженерные решения',
    url: absoluteUrl('/solutions'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: SOLUTIONS.map((solution, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: solution.title,
        url: absoluteUrl(`/solutions/${solution.slug}`),
      })),
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
            { label: 'Решения' },
          ]}
        />

        {/* Вводный блок */}
        <section className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#28313d] to-[#3d5570] p-5 text-white sm:mt-6 sm:p-8 lg:rounded-3xl lg:p-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/50 sm:text-xs">
            Подбор под задачу
          </p>

          <h1 className="mt-3 max-w-5xl text-[27px] font-medium leading-[1.15] tracking-[-0.025em] sm:mt-4 sm:text-4xl lg:text-[42px]">
            Инженерные решения для вашего объекта
          </h1>

          <p className="mt-4 max-w-3xl text-[13px] leading-5 text-white/65 sm:mt-5 sm:text-base sm:leading-7">
            Не просто поставляем оборудование: помогаем подобрать совместимое
            решение, подготовить документы и организовать поставку.
          </p>
        </section>

        {/* Заголовок каталога решений */}
        <section className="mt-8 sm:mt-10">
          <div className="mb-4 sm:mb-5">
            <h2 className=" text-xl font-medium tracking-tight text-[#28313d] sm:text-2xl">
              Решения для разных задач
            </h2>

            <p className="mt-2  max-w-3xl text-[13px] leading-5 text-[#66717d] sm:text-sm sm:leading-6">
              Выберите направление, чтобы ознакомиться с оборудованием и
              возможностями его подбора.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {SOLUTIONS.map((solution, index) => {
              const related = solution.categorySlugs
                .map((slug) => categoryBySlug.get(slug))
                .filter(
                  (category): category is { slug: string; name: string } =>
                    Boolean(category),
                )

              const inverted = index % 2 === 1

              return (
                <article
                  key={solution.slug}
                  className={[
                    'group relative isolate flex min-w-0 flex-col overflow-hidden rounded-2xl p-5 sm:p-6 lg:p-7',
                    inverted
                      ? 'bg-gradient-to-br from-[#28313d] to-[#3d5570]'
                      : 'bg-white',
                  ].join(' ')}
                >
                  {/* Hover-слой: градиент плавно проявляется через opacity */}
                  <span
                    aria-hidden="true"
                    className={[
                      'pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                      inverted
                        ? 'bg-[#e2f0ef]'
                        : 'bg-gradient-to-br from-accent to-accent-end',
                    ].join(' ')}
                  />

                  {/* Маркер направления */}
                  <p
                    className={[
                      'text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-500 sm:text-xs',
                      inverted
                        ? 'text-white/50 group-hover:text-[#28313d]/60'
                        : 'text-accent group-hover:text-white/65',
                    ].join(' ')}
                  >
                    {solution.eyebrow}
                  </p>

                  <h3 className="mt-5 text-lg font-medium leading-snug tracking-tight sm:mt-6 sm:text-xl">
                    {/* Растянутая ссылка: кликабельна вся карточка */}
                    <Link
                      href={`/solutions/${solution.slug}`}
                      className={[
                        'outline-none transition-colors duration-500',
                        "after:absolute after:inset-0 after:rounded-2xl after:content-['']",
                        'focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-[#179146]',
                        inverted
                          ? 'text-white group-hover:text-[#28313d]'
                          : 'text-[#28313d] group-hover:text-white',
                      ].join(' ')}
                    >
                      {solution.title}
                    </Link>
                  </h3>

                  <p
                    className={[
                      'mt-3 text-[12px] leading-[1.6] transition-colors duration-500 sm:text-sm sm:leading-6',
                      inverted
                        ? 'text-white/65 group-hover:text-[#66717d]'
                        : 'text-[#66717d] group-hover:text-white/75',
                    ].join(' ')}
                  >
                    {solution.description}
                  </p>

                  {/* Связанные категории (поверх растянутой ссылки) */}
                  {related.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {related.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/category/${category.slug}`}
                          className={[
                            'relative z-10 max-w-full rounded-lg px-3 py-2 text-xs font-medium leading-4 transition-colors duration-300',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#179146]',
                            inverted
                              ? 'bg-white/10 text-white/75 group-hover:bg-[#28313d]/[0.06] group-hover:text-[#28313d]/75 group-hover:hover:bg-[#28313d] group-hover:hover:text-white'
                              : 'bg-[#f3f4f6] text-[#66717d] group-hover:bg-white/15 group-hover:text-white group-hover:hover:bg-white/30',
                          ].join(' ')}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Нижний блок прижат к низу карточки, отступ задаёт pt */}
                  <div className="mt-auto pt-5 sm:pt-6">
                    <div
                      className={[
                        'flex items-center justify-between gap-3 border-t pt-4 transition-colors duration-500 sm:pt-5',
                        inverted
                          ? 'border-white/15 group-hover:border-[#28313d]/15'
                          : 'border-[#e7e9ed] group-hover:border-white/20',
                      ].join(' ')}
                    >
                      <span
                        aria-hidden="true"
                        className={[
                          'text-sm font-medium transition-colors duration-500',
                          inverted
                            ? 'text-white/85 group-hover:text-[#28313d]'
                            : 'text-[#405b7d] group-hover:text-white',
                        ].join(' ')}
                      >
                        Подробнее
                      </span>

                      <span
                        aria-hidden="true"
                        className={[
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-500',
                          inverted
                            ? 'bg-white/10 text-white group-hover:bg-white group-hover:text-[#28313d]'
                            : 'bg-[#f3f4f7] text-accent group-hover:bg-white/15 group-hover:text-white',
                        ].join(' ')}
                      >
                        <ArrowRight
                          size={16}
                          strokeWidth={1.8}
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}