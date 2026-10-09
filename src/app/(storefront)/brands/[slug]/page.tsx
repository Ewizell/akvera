import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { prisma } from '@/lib/prisma'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import CategoryTileGrid from '@/components/CategoryTileGrid'
import ShowAllProductsButton from '@/components/ShowAllProductsButton'
import { getBrandCategories } from '@/lib/catalog-query'
import { getVisibleCategoryIds } from '@/lib/visibility'
import { stripHtml, absoluteUrl } from '@/lib/seo'

export const revalidate = 3600

type Params = {
  params: Promise<{ slug: string }>
}

const SHORT_DESCRIPTION_LIMIT = 220

const getBrand = cache((slug: string) =>
  prisma.brand.findUnique({
    where: { slug },
    select: { name: true, description: true, logoUrl: true },
  }),
)

function truncate(text: string, max: number) {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params

  const brand = await getBrand(slug)
  if (!brand) return {}

  const title = `${brand.name} — купить оборудование ${brand.name} | Akvera`
  const description = brand.description
    ? truncate(stripHtml(brand.description).replace(/\s+/g, ' ').trim(), 160)
    : `Каталог оборудования бренда ${brand.name}: категории, цены, наличие, характеристики. Каталог Akvera.`
  const url = absoluteUrl(`/brands/${slug}`)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      ...(brand.logoUrl ? { images: [{ url: absoluteUrl(brand.logoUrl) }] } : {}),
    },
  }
}

export default async function BrandPage({ params }: Params) {
  const { slug } = await params

  const [brand, rawCategories, visibleCategoryIds] = await Promise.all([
    getBrand(slug),
    getBrandCategories(slug),
    getVisibleCategoryIds(),
  ])

  if (!brand) notFound()

  const visible = new Set(visibleCategoryIds)
  const categories = rawCategories.filter((category) => visible.has(category.id))

  const plainDescription = brand.description
    ? stripHtml(brand.description).replace(/\s+/g, ' ').trim()
    : ''
  const shortDescription = truncate(plainDescription, SHORT_DESCRIPTION_LIMIT)
  const hasMoreDescription = plainDescription.length > SHORT_DESCRIPTION_LIMIT

  const crumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Бренды', href: '/brands' },
    { label: brand.name },
  ]

  const tileItems = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    href: `/brands/${slug}/${category.slug}`,
    productCount: category.productCount,
    imageUrl: category.imageUrl,
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Brand',
        name: brand.name,
        url: absoluteUrl(`/brands/${slug}`),
        ...(brand.logoUrl ? { logo: absoluteUrl(brand.logoUrl) } : {}),
        ...(plainDescription ? { description: plainDescription } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.label,
          ...(crumb.href ? { item: absoluteUrl(crumb.href) } : {}),
        })),
      },
      {
        '@type': 'CollectionPage',
        name: `Категории бренда ${brand.name}`,
        url: absoluteUrl(`/brands/${slug}`),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: categories.map((category, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: category.name,
            url: absoluteUrl(`/brands/${slug}/${category.slug}`),
          })),
        },
      },
    ],
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-4 sm:px-6 sm:pb-20 sm:pt-5 lg:px-12 lg:pt-6 xl:px-20">
        <Breadcrumbs items={crumbs} />

        {/* Информация о бренде */}
        <section className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#28313d] to-[#3d5570] text-white sm:mt-6 lg:rounded-3xl">
          <div
            className={`grid min-w-0 ${
              brand.logoUrl ? 'lg:grid-cols-[1fr_320px]' : ''
            }`}
          >
            <div className="flex min-w-0 flex-col items-start p-5 sm:p-8 lg:p-10 xl:p-12">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#77cb98] sm:text-xs">
                Каталог оборудования
              </p>

              <h1 className="mt-3 break-words text-[27px] font-medium leading-[1.15] tracking-[-0.025em] sm:mt-4 sm:text-4xl lg:text-[42px]">
                {brand.name}
              </h1>

              <p className="mt-4 max-w-2xl text-[13px] leading-5 text-white/70 sm:mt-5 sm:text-base sm:leading-7">
                {shortDescription ||
                  `Оборудование ${brand.name} для промышленных и инженерных задач. Выберите категорию, чтобы ознакомиться с доступными моделями.`}
              </p>

              <div className="mt-6 flex w-full flex-col gap-2.5 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
                <Link
                  href={`/brands/${slug}/all`}
                  className="group inline-flex h-11 w-full items-center rounded-xl bg-accent px-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-12 sm:w-auto"
                >
                  <span className="flex flex-1 items-center justify-center px-3 sm:px-4">
                    Смотреть оборудование
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
                  href="/request"
                  className="group inline-flex h-11 w-full items-center rounded-xl border border-white/20 bg-white/[0.06] px-1.5 text-sm font-medium text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-12 sm:w-auto"
                >
                  <span className="flex flex-1 items-center justify-center px-3 sm:px-4">
                    Запросить подбор
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

            {/* Логотип */}
            {brand.logoUrl && (
              <div className="order-first flex items-center justify-center border-b border-white/10 bg-white/[0.04] p-5 sm:p-8 lg:order-none lg:border-b-0 lg:border-l lg:p-10">
                <div className="relative h-24 w-full max-w-[240px] rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] sm:h-32 lg:h-36 lg:max-w-[260px]">
                  <Image
                    src={brand.logoUrl}
                    alt={`Логотип ${brand.name}`}
                    fill
                    sizes="260px"
                    className="object-contain p-5 sm:p-6"
                    priority
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Описание бренда (только если оно длиннее короткой версии в hero) */}
        {brand.description && hasMoreDescription && (
          <section className="mt-4 rounded-2xl bg-white p-5 sm:mt-5 sm:p-7 lg:p-8">
            <div className="grid gap-4 lg:grid-cols-[200px_1fr] lg:gap-10">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent sm:text-xs">
                  О бренде
                </p>
                <h2 className="mt-2 text-xl font-medium tracking-tight text-[#28313d]">
                  {brand.name}
                </h2>
              </div>

              <div
                className="max-w-3xl text-[13px] leading-6 text-[#66717d] sm:text-sm sm:leading-7 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-[#28313d] [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3"
                dangerouslySetInnerHTML={{ __html: brand.description }}
              />
            </div>
          </section>
        )}

        {/* Категории */}
        <section className="mt-8 sm:mt-10">
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent sm:text-xs">
                Ассортимент
              </p>

              <h2 className="mt-2 text-xl font-medium tracking-tight text-[#28313d] sm:text-2xl">
                Категории оборудования
              </h2>

              <p className="mt-2 text-[13px] leading-5 text-[#66717d] sm:text-sm sm:leading-6">
                Выберите нужную категорию, чтобы перейти к моделям бренда.
              </p>
            </div>

            {categories.length > 0 && (
              <div className="w-full sm:w-auto">
                <ShowAllProductsButton href={`/brands/${slug}/all`} />
              </div>
            )}
          </div>

          {categories.length === 0 ? (
            <div className="rounded-2xl bg-white px-5 py-10 text-center sm:py-14">
              <p className="text-sm font-medium text-[#28313d]">
                У этого бренда пока нет товаров
              </p>
              <p className="mt-2 text-[13px] leading-5 text-[#66717d]">
                Категории оборудования появятся здесь после добавления товаров
                в каталог.
              </p>
              <Link
                href="/catalog"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#f4f5f7] px-4 text-sm font-medium text-[#28313d] transition-colors hover:bg-[#e2f0ef] hover:text-accent"
              >
                Перейти в каталог
                <ArrowRight size={15} strokeWidth={1.8} />
              </Link>
            </div>
          ) : (
            <CategoryTileGrid items={tileItems} />
          )}
        </section>
      </div>
    </main>
  )
}