import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const revalidate = 3600

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          variants: {
            orderBy: { createdAt: 'asc' },
            take: 1,
            include: {
              images: {
                orderBy: [
                  { isMain: 'desc' },
                  { sortOrder: 'asc' },
                ],
                take: 1,
              },
            },
          },
        },
      },
    },
  })

  if (!brand) {
    notFound()
  }

  const crumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: brand.name },
  ]

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  const brandJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: brand.name,
    url: `${siteUrl}/brands/${brand.slug}`,
    description: brand.description || undefined,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: brand.products
        .map((product, index) => {
          const variant = product.variants[0]

          if (!variant) {
            return null
          }

          return {
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}/product/${variant.slug}`,
            name: product.name,
          }
        })
        .filter(Boolean),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(brandJsonLd),
        }}
      />

      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs items={crumbs} />

          {/* Brand hero */}
          <section className="mt-7 border border-[#e3e7eb] bg-[#fafbfc]">
            <div className="flex flex-col gap-6 p-5 sm:p-7 md:flex-row md:items-center">
              {/* Logo */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-[#e3e7eb] bg-white p-4 sm:h-28 sm:w-28">
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={112}
                    height={112}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#a0a7af]">
                    <svg
                      className="h-9 w-9"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M10 4L11.55 8.45L16 10L11.55 11.55L10 16L8.45 11.55L4 10L8.45 8.45L10 4Z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#929aa6]">
                  Производитель
                </p>

                <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.02em] text-[#28313d] sm:text-3xl">
                  {brand.name}
                </h1>

                {brand.description && (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#68737f]">
                    {brand.description}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center border border-[#e1e5e9] bg-white px-2.5 py-1.5 text-xs font-medium text-[#5f6975]">
                    {brand.products.length}{' '}
                    {brand.products.length === 1
                      ? 'товар'
                      : brand.products.length >= 2 &&
                          brand.products.length <= 4
                        ? 'товара'
                        : 'товаров'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Products */}
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between border-b border-[#e4e7eb] pb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#929aa6]">
                  Каталог
                </p>

                <h2 className="mt-1 text-lg font-semibold text-[#28313d]">
                  Товары бренда
                </h2>
              </div>

              {brand.products.length > 0 && (
                <span className="text-xs text-[#929aa6]">
                  {brand.products.length} поз.
                </span>
              )}
            </div>

            {brand.products.length === 0 ? (
              <div className="border border-dashed border-[#d9dee4] px-6 py-14 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center bg-[#f3f5f7] text-[#929aa6]">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M4 6H16M5 6V15H15V6M7 6V4H13V6M8 9V12M12 9V12"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p className="mt-3 text-sm font-medium text-[#596572]">
                  У этого бренда пока нет товаров
                </p>

                <p className="mt-1 text-xs text-[#929aa6]">
                  Товары производителя появятся здесь после добавления в каталог.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {brand.products.map((product) => {
                  const variant = product.variants[0]

                  if (!variant) {
                    return null
                  }

                  const image = variant.images[0]

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${variant.slug}`}
                      className="group min-w-0"
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden border border-[#e5e8eb] bg-[#fafbfc]">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.alt || product.name}
                            fill
                            className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-[#a0a7af]">
                            Нет фото
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="pt-3">
                        <p className="line-clamp-2 text-sm font-medium leading-5 text-[#28313d] transition group-hover:text-[#1e2a38]">
                          {product.name}
                        </p>

                        <p className="mt-1.5 text-sm font-semibold text-[#28394c]">
                          {variant.price
                            ? `${variant.price.toLocaleString('ru-RU')} ₽`
                            : 'Цена по запросу'}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}