import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import HomeSection from "@/components/HomeSection";
import BrandSlider from "@/components/BrandSlider";
import { HomeSteps, HomeCta } from "@/components/HomeInfoBlocks";
import {
  HomeRequisites,
} from "@/components/HomeContentBlocks";
import {
  AboutActivities,
  AboutValues,
} from "@/components/AboutBlocks";

import {
  ABOUT_PAGE_LEAD,
  ABOUT_PAGE_TEXT,
  ABOUT_STATS,
} from "@/lib/site-content";

import { SITE_URL, absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const TITLE =
  "О компании Akvera — поставщик промышленного оборудования";

const DESCRIPTION =
  "Akvera — поставщик промышленного оборудования для предприятий: подбор, поставка, техническая документация и поддержка. Работаем с юридическими лицами.";

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  alternates: {
    canonical: absoluteUrl("/about"),
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/about"),
    type: "website",
  },
};

export default async function AboutPage() {
  const brands = await prisma.brand.findMany({
    where: {
      products: {
        some: {
          isHidden: false,
        },
      },
    },
    orderBy: {
      products: {
        _count: "desc",
      },
    },
    take: 12,
    select: {
      id: true,
      slug: true,
      name: true,
      logoUrl: true,
      _count: {
        select: {
          products: {
            where: {
              isHidden: false,
            },
          },
        },
      },
    },
  });

  const crumbs = [
    {
      label: "Главная",
      href: "/",
    },
    {
      label: "О компании",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: TITLE,
        url: absoluteUrl("/about"),
        description: DESCRIPTION,
        about: {
          "@type": "Organization",
          name: "Akvera",
          url: SITE_URL,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.label,
          ...(crumb.href
            ? {
                item: absoluteUrl(crumb.href),
              }
            : {}),
        })),
      },
    ],
  };

  return (
    <main className="w-full bg-[#f4f5f7]">
      {/* SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div className="mx-auto w-full max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">
        {/* =====================================================
            BREADCRUMBS
        ===================================================== */}

        <div className="pt-6 sm:pt-8">
          <Breadcrumbs items={crumbs} />
        </div>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="mt-6">
          <div className="grid overflow-hidden rounded-3xl bg-[#28313d] lg:grid-cols-[1.15fr_0.85fr]">
            {/* Левая часть */}
            <div className="relative overflow-hidden p-7 sm:p-10 lg:p-12">
              {/* Фон */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#28313d] via-[#28313d] to-[#18212b]" />

              <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#179146]/10 blur-3xl" />

              <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#0f172a]/60 blur-3xl" />

              {/* Контент */}
              <div className="relative">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                  О компании
                </p>

                <h1 className="mt-5 max-w-[720px] text-4xl font-medium leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-[52px]">
                  Промышленное оборудование
                  <br />
                  для реальных задач
                </h1>

                <p className="mt-6 max-w-[650px] text-base leading-7 text-white/60 sm:text-[17px]">
                  {ABOUT_PAGE_LEAD}
                </p>

                <div className="mt-8 max-w-[680px] space-y-3">
                  {ABOUT_PAGE_TEXT.slice(0, 2).map((text) => (
                    <p
                      key={text}
                      className="text-sm leading-6 text-white/45"
                    >
                      {text}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Правая часть — статистика */}
            <div className="relative border-t border-white/10 bg-white/[0.03] p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
              <div className="grid h-full grid-cols-2 gap-3">
                {ABOUT_STATS.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={[
                      "group relative overflow-hidden rounded-2xl p-5 sm:p-6",
                      index === 0
                        ? "bg-white"
                        : "bg-white/[0.06] hover:bg-white/[0.1]",
                      "transition-colors duration-300",
                    ].join(" ")}
                  >
                    {index === 0 && (
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#179146]/10 blur-2xl" />
                    )}

                    <div className="relative">
                      <dt
                        className={[
                          "text-3xl font-semibold tracking-[-0.04em] sm:text-4xl",
                          index === 0
                            ? "text-[#179146]"
                            : "text-white",
                        ].join(" ")}
                      >
                        {stat.value}
                      </dt>

                      <dd
                        className={[
                          "mt-3 text-sm leading-5",
                          index === 0
                            ? "text-[#66717d]"
                            : "text-white/45",
                        ].join(" ")}
                      >
                        {stat.label}
                      </dd>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        
        {/* =====================================================
            ЧЕМ ЗАНИМАЕМСЯ
        ===================================================== */}

        <HomeSection title="Чем мы занимаемся">
          <AboutActivities />
        </HomeSection>

        {/* =====================================================
            ПРИНЦИПЫ
        ===================================================== */}

        <HomeSection title="Наши принципы">
          <AboutValues />
        </HomeSection>

        {/* =====================================================
            КАК РАБОТАЕМ
        ===================================================== */}

        <HomeSection title="Как мы работаем">
          <HomeSteps />
        </HomeSection>

        {/* =====================================================
            БРЕНДЫ
        ===================================================== */}

        {brands.length > 0 && (
          <HomeSection
            title="С кем мы работаем"
            href="/brands"
            linkLabel="Все бренды"
          >
            <BrandSlider
              items={brands.map((brand) => ({
                id: brand.id,
                slug: brand.slug,
                name: brand.name,
                logoUrl: brand.logoUrl,
                productCount: brand._count.products,
              }))}
            />
          </HomeSection>
        )}

        {/* =====================================================
            CTA
        ===================================================== */}

        <HomeCta />

        {/* =====================================================
            РЕКВИЗИТЫ
        ===================================================== */}

        <HomeSection
          title="Реквизиты"
          id="requisites"
        >
          <HomeRequisites />
        </HomeSection>
      </div>
    </main>
  );
}