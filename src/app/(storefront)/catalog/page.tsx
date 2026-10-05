import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";

import ShowAllProductsButton from "@/components/ShowAllProductsButton";
import CategoryTileGrid from "@/components/CategoryTileGrid";
import LeadRequestBlock from "@/components/LeadRequestBlock";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Каталог",
  description:
    "Каталог оборудования Akvera: все категории и подкатегории товаров.",
};

export default async function CatalogPage() {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
    },
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  const catalogJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Каталог",
    url: `${siteUrl}/catalog`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: categories.map((cat, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/category/${cat.slug}`,
        name: cat.name,
      })),
    },
  };

  const tileItems = categories.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    href: `/category/${cat.slug}`,
    productCount: cat._count.products,
    imageUrl: cat.imageUrl,
  }));

  return (
    <>
      {/* SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(catalogJsonLd),
        }}
      />

      <main className="w-full bg-[#f4f5f7]">
        <div className="mx-auto w-full max-w-[1440px] px-5 pb-8 pt-4 sm:px-8 sm:pb-16 sm:pt-9 lg:px-12 lg:pb-20">
          {/* =====================================================
              ХЛЕБНЫЕ КРОШКИ
          ===================================================== */}

          <Breadcrumbs
            items={[
              {
                label: "Главная",
                href: "/",
              },
              {
                label: "Каталог",
              },
            ]}
          />

          {/* =====================================================
              ЗАГОЛОВОК
              На телефоне кнопка «Показать все товары» идёт под заголовком
              на всю ширину, от sm — справа от него
          ===================================================== */}

          <div className="mb-5 flex flex-col gap-4 sm:mb-10 sm:mt-8 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
            <div className="min-w-0">
              <h1 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#28313d] sm:text-[36px]">
                Каталог оборудования
              </h1>
            </div>

            <div className="w-full sm:w-auto sm:shrink-0 [&>*]:w-full sm:[&>*]:w-auto">
              <ShowAllProductsButton href="/catalog/all" />
            </div>
          </div>

          {/* =====================================================
              КАТЕГОРИИ
          ===================================================== */}

          {categories.length > 0 ? (
            <CategoryTileGrid items={tileItems} />
          ) : (
            <div className="rounded-2xl bg-white px-6 py-12 text-center sm:py-20">
              <p className="text-sm leading-6 text-[#66717d]">
                Категории пока не добавлены
              </p>
            </div>
          )}

          {/* =====================================================
              ЗАЯВКА
          ===================================================== */}

          <LeadRequestBlock />
        </div>
      </main>
    </>
  );
}