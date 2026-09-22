import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryTileGrid from "@/components/CategoryTileGrid";
import CategoryProductListing from "@/components/CategoryProductListing";
import ShowAllProductsButton from "@/components/ShowAllProductsButton";
import {
  parseCatalogSearchParams,
  getCategoryAncestors,
  getDescendantCategoryIds,
  getCategoryChildren,
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
  const categorySlug = isAll ? slug[slug.length - 2] : last;
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
    ...(isAll ? ["all"] : []),
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
    const children = await getCategoryChildren(
      category.id,
      [...ancestors.map((a) => a.slug), category.slug]
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
        categoryChildren={{
          showAllHref: null, // мы уже на /all — кнопку "показать все" не дублируем
          items: children,
          activeSlug: null, // на /all-странице ни один дочерний раздел отдельно не выбран
        }}
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
    { label: category.name },
  ];

   // ── Плитка подкатегорий (есть дети → всегда тайл, листинг здесь не открывается) ──
  if (category.children.length > 0) {
    const tileItems = category.children.map((child) => ({
      slug: child.slug,
      name: child.name,
      href: `${tilePath}/${child.slug}`,
      productCount: child._count.products,
      imageUrl: child.imageUrl,
    }));

    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <nav className="mb-5 flex flex-wrap items-center gap-3 text-[14px] font-semibold uppercase tracking-[2px] text-[#179146]">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-3">
              {c.href ? (
                <Link href={c.href} className="hover:opacity-80">
                  {c.label}
                </Link>
              ) : (
                <span>{c.label}</span>
              )}
              {i < crumbs.length - 1 && <span>/</span>}
            </span>
          ))}
        </nav>

        <div className="mb-8 flex items-end justify-between">
          <h1 className="text-[36px] font-bold leading-[1.2] text-[#0f172a]">{category.name}</h1>
          <ShowAllProductsButton href={`${tilePath}/all`} />
        </div>

        <CategoryTileGrid items={tileItems} />
      </main>
    );
  }

  // ── Лист без подкатегорий — единственный случай, когда открывается листинг товаров ──
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
      title={category.name}
      basePath={tilePath}
      categoryId={category.id}
      brand={brand}
      tags={selectedTagSlugs}
      sort={sort}
      page={page}
      crumbs={crumbs}
      backHref={parentHref}
      categoryNav={categoryNav}
      priceMin={priceMin}
      priceMax={priceMax}
      inStock={inStock}
      attrValues={attrValues}
      attrRanges={attrRanges}
    />
  );
}