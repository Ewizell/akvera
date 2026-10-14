import { prisma } from "@/lib/prisma";
import CategoryProductListing from "@/components/CategoryProductListing";
import { parseCatalogSearchParams, PAGE_SIZE } from "@/lib/catalog-query";
import { getVisibleCategoryIds } from "@/lib/visibility";
import { buildCollectionJsonLd, buildMetadata } from "@/lib/seo";
import type { CategoryNavData } from "@/components/CategoryFilterSidebar";
import type { Metadata } from "next";
import LeadRequestBlock from "@/components/LeadRequestBlock";

export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);
  const isFiltered = Object.keys(sp).some((key) => key !== "page");

  const meta = buildMetadata({
    title: `Все товары${page > 1 ? ` — страница ${page}` : ""} — каталог, цены, наличие | Akvera`,
    description:
      "Полный каталог товаров Akvera — промышленное оборудование с фильтрами по категориям, брендам и характеристикам.",
    path: page > 1 && !isFiltered ? `/catalog/all?page=${page}` : "/catalog/all",
  });

  return isFiltered ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function CatalogAllPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const { page, tags: selectedTagSlugs, sort, brand, priceMin, priceMax, inStock, attrValues, attrRanges } =
    parseCatalogSearchParams(sp);

  const [rawRootCategories, visibleCategoryIds] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    getVisibleCategoryIds(),
  ]);

  const rootCategories = rawRootCategories.filter((c) =>
    visibleCategoryIds.includes(c.id)
  );

  const categoryNav: CategoryNavData = {
    allProductsLink: { label: "Все товары", href: "/catalog/all" },
    activeSlug: null,
    items: rootCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      href: `/category/${c.slug}`,
      productCount: c._count.products,
    })),
  };

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Все товары" },
  ];

  return (
    <>
    <CategoryProductListing
      title="Все товары"
      basePath="/catalog/all"
      brand={brand}
      tags={selectedTagSlugs}
      sort={sort}
      page={page}
      crumbs={crumbs}
      backHref="/catalog"
      categoryNav={categoryNav}
      priceMin={priceMin}
      priceMax={priceMax}
      inStock={inStock}
      attrValues={attrValues}
      attrRanges={attrRanges}
      jsonLd={({ cards, totalCount }) =>
        buildCollectionJsonLd({
          path: "/catalog/all",
          name: "Все товары",
          crumbs,
          itemPaths: cards.map((card) => `/product/${card.slug}`),
          totalCount,
          offset: (page - 1) * PAGE_SIZE,
        })
      }
    />

    <div className="mx-auto w-full max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">
      <LeadRequestBlock />
    </div>
    </>
  );
}