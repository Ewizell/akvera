import { prisma } from "@/lib/prisma";
import CategoryProductListing from "@/components/CategoryProductListing";
import { parseCatalogSearchParams } from "@/lib/catalog-query";
import type { CategoryNavData } from "@/components/CategoryFilterSidebar";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Все товары",
  description:
    "Полный каталог товаров Akvera — промышленное оборудование с фильтрами по категориям, брендам и характеристикам.",
};

export default async function CatalogAllPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const { page, tags: selectedTagSlugs, sort, brand, priceMin, priceMax, inStock, attrValues, attrRanges } =
    parseCatalogSearchParams(sp);

  const rootCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

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
    />
  );
}