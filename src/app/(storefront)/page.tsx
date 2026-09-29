import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

import HomeHero from "@/components/HomeHero";
import HomeSection from "@/components/HomeSection";
import { HomeProductCarousel } from "@/components/HomeProductCarousel";
import type { HomeCarouselVariant } from "@/components/HomeProductCarousel";
import type { CatalogCard } from "@/lib/catalog-query";
import BrandSlider from "@/components/BrandSlider";
import CategoryTileGrid from "@/components/CategoryTileGrid";

import {
  HomeSteps,
  HomeAdvantages,
  HomeCta,
} from "@/components/HomeInfoBlocks";

import {
  HomeAbout,
  HomeDelivery,
  HomeFaq,
  HomeRequisites,
} from "@/components/HomeContentBlocks";

import LeadRequestBlock from "@/components/LeadRequestBlock";

import { FAQ_ITEMS } from "@/lib/site-content";
import { getCatalogProducts } from "@/lib/catalog-query";
import { getVisibleCategoryIds } from "@/lib/visibility";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const POPULAR_TAG_FRAGMENT = "популяр";
const NEW_TAG_FRAGMENT = "новинк";

const TITLE =
  "Akvera — промышленное оборудование от проверенных производителей";

const DESCRIPTION =
  "Каталог промышленного оборудования Akvera: характеристики, актуальные цены и наличие, техническая документация. Оформите заявку онлайн.";

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/"),
    type: "website",
  },
};

function plural(
  n: number,
  forms: [string, string, string],
) {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod100 >= 11 && mod100 <= 14) {
    return forms[2];
  }

  if (mod10 === 1) {
    return forms[0];
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return forms[1];
  }

  return forms[2];
}

/**
 * Верхнеуровневые категории.
 *
 * Количество товаров включает:
 * - товары самой категории;
 * - товары всех дочерних категорий.
 */
async function getTopCategories(visibleIds: string[]) {
  const [categories, grouped] = await Promise.all([
    prisma.category.findMany({
      where: {
        id: {
          in: visibleIds,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        imageUrl: true,
      },
    }),

    prisma.product.groupBy({
      by: ["categoryId"],
      where: {
        isHidden: false,
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const own = new Map<string, number>();

  for (const group of grouped) {
    if (group.categoryId) {
      own.set(group.categoryId, group._count._all);
    }
  }

  const childrenOf = new Map<string, string[]>();

  for (const category of categories) {
    if (!category.parentId) {
      continue;
    }

    if (!childrenOf.has(category.parentId)) {
      childrenOf.set(category.parentId, []);
    }

    childrenOf.get(category.parentId)!.push(category.id);
  }

  const total = (id: string): number => {
    const ownCount = own.get(id) ?? 0;

    const childrenCount = (
      childrenOf.get(id) ?? []
    ).reduce(
      (sum, childId) => sum + total(childId),
      0,
    );

    return ownCount + childrenCount;
  };

  return categories
    .filter((category) => category.parentId === null)
    .map((category) => ({
      ...category,
      productCount: total(category.id),
    }))
    .filter((category) => category.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 8);
}

function toCarouselVariants(
  cards: CatalogCard[],
): HomeCarouselVariant[] {
  return cards.map((c) => ({
    id: c.variantId,
    slug: c.slug,
    sku: c.sku,
    name: c.variantName ?? "",
    price: c.price,
    stock: c.stock,
    product: {
      name: c.name,
    },
    images: c.images.map((url) => ({
      url,
      alt: c.name,
    })),
  }));
}

async function getTaggedCards(nameFragment: string) {
  const tag = await prisma.tag.findFirst({
    where: {
      name: {
        contains: nameFragment,
        mode: "insensitive",
      },
    },
    select: {
      slug: true,
    },
  });

  if (!tag) {
    return null;
  }

  const { cards } = await getCatalogProducts(
    {
      tags: [tag.slug],
    },
    1,
  );

  if (cards.length === 0) {
    return null;
  }

  return {
    slug: tag.slug,
    cards: cards.slice(0, 8),
  };
}

export default async function HomePage() {
  const visibleCategoryIds =
    await getVisibleCategoryIds();

  const [
    topCategories,
    productsCount,
    brandsCount,
    brands,
    popular,
    fresh,
  ] = await Promise.all([
    getTopCategories(visibleCategoryIds),

    prisma.product.count({
      where: {
        isHidden: false,
      },
    }),

    prisma.brand.count({
      where: {
        products: {
          some: {
            isHidden: false,
          },
        },
      },
    }),

    prisma.brand.findMany({
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
    }),

    getTaggedCards(POPULAR_TAG_FRAGMENT),
    getTaggedCards(NEW_TAG_FRAGMENT),
  ]);

  const categoriesCount =
    visibleCategoryIds.length;

  const stats = [
    {
      value: productsCount.toLocaleString("ru-RU"),
      label: plural(productsCount, [
        "товар",
        "товара",
        "товаров",
      ]),
    },
    {
      value: String(brandsCount),
      label: plural(brandsCount, [
        "бренд",
        "бренда",
        "брендов",
      ]),
    },
    {
      value: String(categoriesCount),
      label: plural(categoriesCount, [
        "категория",
        "категории",
        "категорий",
      ]),
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Akvera",
        url: SITE_URL,
      },

      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },

      {
        "@type": "WebSite",
        name: "Akvera",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              `${SITE_URL}/catalog/search?q={search_term_string}`,
          },
          "query-input":
            "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <main className="w-full bg-[#f4f5f7]">

      {/* =====================================================
          SEO
      ===================================================== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* =====================================================
          1. HERO
          Полная ширина
      ===================================================== */}
      <HomeHero stats={stats} />

      {/* =====================================================
          ОСНОВНОЙ КОНТЕНТ
      ===================================================== */}
      <div className="mx-auto w-full max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">

        {/* ===================================================
            2. ПРЕИМУЩЕСТВА

            Сразу после Hero — формирует первое впечатление
            о компании до перехода к каталогу.
        =================================================== */}
        <HomeSection title="Преимущества">
          <HomeAdvantages />
        </HomeSection>

        {/* ===================================================
            3. ОБОРУДОВАНИЕ ПО НАПРАВЛЕНИЯМ
        =================================================== */}
        {topCategories.length > 0 && (
          <HomeSection
            title="Оборудование по направлениям"
            href="/catalog"
            linkLabel="Весь каталог"
          >
            <CategoryTileGrid
              items={topCategories.map((category) => ({
                slug: category.slug,
                name: category.name,
                href: `/category/${category.slug}`,
                productCount: category.productCount,
                imageUrl: category.imageUrl,
              }))}
            />
          </HomeSection>
        )}

        {/* ===================================================
            4. ПОПУЛЯРНЫЕ ТОВАРЫ

            Оставляем именно твой слайдер.
        =================================================== */}
        {popular && (
          <HomeProductCarousel
            title="Популярные товары"
            variants={toCarouselVariants(popular.cards)}
            href={`/catalog/all?tags=${popular.slug}`}
          />
        )}

        {/* ===================================================
            5. НОВИНКИ

            Пока отключены — оставляем твою текущую логику.
        =================================================== */}
        {/*
        {fresh && (
          <HomeProductCarousel
            title="Новинки"
            variants={toCarouselVariants(fresh.cards)}
            href={`/catalog/all?tags=${fresh.slug}`}
          />
        )}
        */}

        {/* ===================================================
            6. БРЕНДЫ
        =================================================== */}
        {brands.length > 0 && (
          <HomeSection
            title="Бренды"
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

        {/* ===================================================
            7. О КОМПАНИИ
        =================================================== */}
        <HomeSection
          title="О компании"
          id="about"
        >
          <HomeAbout />
        </HomeSection>

        {/* ===================================================
            8. КАК СДЕЛАТЬ ЗАКАЗ
        =================================================== */}
        <HomeSection title="Как сделать заказ">
          <HomeSteps />
        </HomeSection>

        {/* ===================================================
            9. ДОСТАВКА И ОПЛАТА
        =================================================== */}
        <HomeSection
          title="Доставка и оплата"
          id="delivery"
        >
          <HomeDelivery />
        </HomeSection>

        {/* ===================================================
            10. FAQ
        =================================================== */}
        <HomeSection
          title="Частые вопросы"
          id="faq"
        >
          <div className="w-full">
            <HomeFaq />
          </div>
        </HomeSection>

        {/* ===================================================
            11. ЗАЯВКА
        =================================================== */}
        <LeadRequestBlock />

        {/* ===================================================
            12. CTA
        =================================================== */}
        <HomeCta />

        {/* ===================================================
            13. РЕКВИЗИТЫ
        =================================================== */}
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