import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CategoryProductListing from "@/components/CategoryProductListing";
import { parseCatalogSearchParams } from "@/lib/catalog-query";
import type { CategoryNavData } from "@/components/CategoryFilterSidebar";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { name: true },
  });

  if (!category) return {};

  return {
    title: `Все товары: ${category.name}`,
    description: `Все товары категории «${category.name}» и её подкатегорий в каталоге Akvera.`,
  };
}

export default async function CategoryAllPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { categorySlug } = await params;
  const sp = await searchParams;
  const { page, tags: selectedTagSlugs, sort, brand, priceMin, priceMax, inStock, attrValues, attrRanges } =
    parseCatalogSearchParams(sp);

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: {
      children: {
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      },
      parent: {
        include: {
          children: {
            orderBy: { name: "asc" },
            include: { _count: { select: { products: true } } },
          },
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  let categoryNav: CategoryNavData;

  if (category.children.length > 0) {
    categoryNav = {
      allProductsLink: { label: `Все товары: ${category.name}`, href: `/category/${category.slug}/all` },
      activeSlug: null,
      items: category.children.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        href: `/category/${category.slug}/${c.slug}`,
        productCount: c._count.products,
      })),
    };
  } else {
    const siblings = category.parent
      ? category.parent.children
      : await prisma.category.findMany({
          where: { parentId: null },
          orderBy: { name: "asc" },
          include: { _count: { select: { products: true } } },
        });

    categoryNav = {
      allProductsLink: category.parent
        ? { label: `Все товары: ${category.parent.name}`, href: `/category/${category.parent.slug}/all` }
        : { label: "Весь каталог", href: "/catalog/all" },
      activeSlug: category.slug,
      items: siblings.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        href: category.parent ? `/category/${category.parent.slug}/${s.slug}` : `/category/${s.slug}`,
        productCount: s._count.products,
      })),
    };
  }

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: category.name, href: `/category/${category.slug}` },
    { label: "Все товары" },
  ];

  return (
    <CategoryProductListing
      title={`Все товары: ${category.name}`}
      basePath={`/category/${category.slug}/all`}
      categoryIds={categoryIds}
      brand={brand}
      tags={selectedTagSlugs}
      sort={sort}
      page={page}
      crumbs={crumbs}
      backHref={`/category/${category.slug}`}
      categoryNav={categoryNav}
      priceMin={priceMin}
      priceMax={priceMax}
      inStock={inStock}
      attrValues={attrValues}
      attrRanges={attrRanges}
    />
  );
}