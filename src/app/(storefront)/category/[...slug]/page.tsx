import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import CategoryProductListing from "@/components/CategoryProductListing";
import {
  parseCatalogSearchParams,
  getCategoryAncestors,
  getDescendantCategoryIds,
  buildCategoryTree,
} from "@/lib/catalog-query";
import type { CategoryNavData } from "@/components/CategoryFilterSidebar";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const last = slug[slug.length - 1];
  const isAll = last === "all";
  const isOwn = last === "own";
  const categorySlug = isAll || isOwn ? slug[slug.length - 2] : last;
  if (!categorySlug) return {};

  const category = await prisma.category.findUnique({ where: { slug: categorySlug }, select: { name: true } });
  if (!category) return {};

  return {
    title: isAll ? `Все товары: ${category.name}` : category.name,
    description: `${category.name} — каталог оборудования Akvera.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const last = slug[slug.length - 1];
  const isAll = last === "all";
  const isOwn = last === "own";
  const categorySlug = isAll || isOwn ? slug[slug.length - 2] : last;
  if (!categorySlug) notFound();

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: {
      children: { orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } },
    },
  });
  if (!category) notFound();

  const ancestors = await getCategoryAncestors(category.parentId);

  // Проверяем, что весь путь в URL соответствует реальной цепочке родителей
  const expectedSlugs = [
    ...ancestors.map((a) => a.slug),
    category.slug,
    ...(isAll ? ["all"] : isOwn ? ["own"] : []),
  ];
  if (expectedSlugs.join("/") !== slug.join("/")) {
    notFound();
  }

  const parent = ancestors[ancestors.length - 1] ?? null;
  const ancestorCrumbs = ancestors.map((a, i) => ({
    label: a.name,
    href: `/category/${[...ancestors.slice(0, i).map((x) => x.slug), a.slug].join("/")}`,
  }));

  const tilePath = `/category/${[...ancestors.map((a) => a.slug), category.slug].join("/")}`;
  const parentHref = parent
    ? `/category/${[...ancestors.slice(0, -1).map((x) => x.slug), parent.slug].join("/")}`
    : "/catalog";

  const { page, tags: selectedTagSlugs, sort, brand, priceMin, priceMax, inStock, attrValues, attrRanges } =
    parseCatalogSearchParams(sp);

  // ── "Все товары" — рекурсивно, с деревом категорий в сайдбаре ──
  if (isAll) {
    const descendantIds = await getDescendantCategoryIds(category.id);
    const tree = await buildCategoryTree(
      category.id,
      ancestors.map((a) => a.slug)
    );

    const crumbs = [
      { label: "Главная", href: "/" },
      { label: "Каталог", href: "/catalog" },
      ...ancestorCrumbs,
      { label: category.name, href: tilePath },
      { label: "Все товары" },
    ];

    return (
      <CategoryProductListing
        title={`Все товары: ${category.name}`}
        basePath={`${tilePath}/all`}
        categoryIds={descendantIds}
        brand={brand}
        tags={selectedTagSlugs}
        sort={sort}
        page={page}
        crumbs={crumbs}
        backHref={tilePath}
        categoryTree={tree ?? undefined}
        priceMin={priceMin}
        priceMax={priceMax}
        inStock={inStock}
        attrValues={attrValues}
        attrRanges={attrRanges}
      />
    );
  }

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    ...ancestorCrumbs,
    ...(isOwn
      ? [{ label: category.name, href: tilePath }, { label: "Товары раздела" }]
      : [{ label: category.name }]),
  ];

  // ── Плитка подкатегорий (если есть дети и мы не в режиме "own") ──
  if (category.children.length > 0 && !isOwn) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <Breadcrumbs items={crumbs} />
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          <div className="flex items-center gap-4">
            <Link href={`${tilePath}/own`} className="text-sm text-blue-600 hover:underline">
              Товары этого раздела →
            </Link>
            <Link href={`${tilePath}/all`} className="text-sm text-blue-600 hover:underline">
              Показать все товары →
            </Link>
            <Link href={parentHref} className="text-sm text-gray-500 hover:underline">
              ← Назад
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`${tilePath}/${child.slug}`}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <p className="font-medium">{child.name}</p>
              <p className="text-xs text-gray-400 mt-1">{child._count.products} товаров</p>
            </Link>
          ))}
        </div>
      </main>
    );
  }

  // ── Лист без подкатегорий, либо просмотр "товаров этого раздела" ветки ──
  const siblingsSource = parent
    ? (
        await prisma.category.findUnique({
          where: { id: parent.id },
          include: {
            children: { orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } },
          },
        })
      )?.children ?? []
    : await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      });

  const categoryNav: CategoryNavData = {
    allProductsLink: parent
      ? { label: `Все товары: ${parent.name}`, href: `${parentHref}/all` }
      : { label: "Весь каталог", href: "/catalog/all" },
    activeSlug: category.slug,
    items: siblingsSource.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      href: `/category/${[...ancestors.map((a) => a.slug), s.slug].join("/")}`,
      productCount: s._count.products,
    })),
  };

  return (
    <CategoryProductListing
      title={isOwn ? `Товары раздела: ${category.name}` : category.name}
      basePath={isOwn ? `${tilePath}/own` : tilePath}
      categoryId={category.id}
      brand={brand}
      tags={selectedTagSlugs}
      sort={sort}
      page={page}
      crumbs={crumbs}
      backHref={isOwn ? tilePath : parentHref}
      categoryNav={categoryNav}
      priceMin={priceMin}
      priceMax={priceMax}
      inStock={inStock}
      attrValues={attrValues}
      attrRanges={attrRanges}
    />
  );
}