import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";
import CategoryTileGrid from "@/components/CategoryTileGrid";
import CategoryProductListing from "@/components/CategoryProductListing";
import ShowAllProductsButton from "@/components/ShowAllProductsButton";
import LeadRequestBlock from "@/components/LeadRequestBlock";
import {
  parseCatalogSearchParams,
  getCategoryAncestors,
  getDescendantCategoryIds,
  getCategoryChildren,
} from "@/lib/catalog-query";
import { getVisibleCategoryIds } from "@/lib/visibility";
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

  const visibleCategoryIds = await getVisibleCategoryIds();
  if (!visibleCategoryIds.includes(category.id)) notFound();

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
    const rawDescendantIds = await getDescendantCategoryIds(category.id);
    const descendantIds = rawDescendantIds.filter((id) => visibleCategoryIds.includes(id));
    const rawChildren = await getCategoryChildren(
      category.id,
      [...ancestors.map((a) => a.slug), category.slug]
    );
    const children = rawChildren.filter((c) => visibleCategoryIds.includes(c.id));

    const crumbs: { label: string; href?: string }[] = [
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

  const crumbs: { label: string; href?: string }[] = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    ...ancestorCrumbs,
    { label: category.name },
  ];

   // ── Плитка подкатегорий (есть дети → всегда тайл, листинг здесь не открывается) ──
  const visibleChildren = category.children.filter((c) => visibleCategoryIds.includes(c.id));

  if (visibleChildren.length > 0) {
    const tileItems = visibleChildren.map((child) => ({
      slug: child.slug,
      name: child.name,
      href: `${tilePath}/${child.slug}`,
      productCount: child._count.products,
      imageUrl: child.imageUrl,
    }));

    return (
      <main className="w-full bg-[#f4f5f7]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-5 sm:px-8 sm:py-10 lg:px-12">
          <Breadcrumbs items={crumbs} />

          <div className="mt-3 mb-5 flex flex-col gap-4 sm:mt-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.03em] text-[#28313d] sm:text-[34px] lg:text-[36px]">
              {category.name}
            </h1>
            <div className="w-full sm:w-auto sm:shrink-0 [&>*]:w-full sm:[&>*]:w-auto">
              <ShowAllProductsButton href={`${tilePath}/all`} />
            </div>
          </div>

          <CategoryTileGrid items={tileItems} />

          <div className="mt-10 sm:mt-14">
            <LeadRequestBlock />
          </div>
        </div>
      </main>
    );
  }

  // ── Лист без подкатегорий — единственный случай, когда открывается листинг товаров ──
  const rawSiblingsSource = parent
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

  const siblingsSource = rawSiblingsSource.filter((s) => visibleCategoryIds.includes(s.id));

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