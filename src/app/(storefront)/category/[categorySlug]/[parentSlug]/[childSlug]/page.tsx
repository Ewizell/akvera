import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryTileGrid from "@/components/CategoryTileGrid";
import CategoryProductListing from "@/components/CategoryProductListing";
import { parseCatalogSearchParams, PAGE_SIZE } from "@/lib/catalog-query";
import { JsonLd } from "@/components/JsonLd";
import { buildCollectionJsonLd, buildMetadata } from "@/lib/seo";
import { getVisibleCategoryIds } from "@/lib/visibility";
import type { CategoryNavData } from "@/components/CategoryFilterSidebar";
import type { Metadata } from "next";
import ShowAllProductsButton from "@/components/ShowAllProductsButton";

export const revalidate = 3600;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string; childSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { categorySlug, childSlug } = await params;

  const [parent, category] = await Promise.all([
    prisma.category.findUnique({ where: { slug: categorySlug }, select: { name: true } }),
    prisma.category.findUnique({ where: { slug: childSlug }, select: { name: true, imageUrl: true } }),
  ]);

  if (!parent || !category) return {};

  const sp = await searchParams;
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);
  const isFiltered = Object.keys(sp).some((key) => key !== "page");

  const basePath = `/category/${categorySlug}/${childSlug}`;

  const meta = buildMetadata({
    title: `${category.name} — ${parent.name}${page > 1 ? ` — страница ${page}` : ""} — каталог, цены, наличие | Akvera`,
    description: `${category.name} в разделе «${parent.name}»: каталог оборудования Akvera — цены, наличие и характеристики.`,
    path: page > 1 && !isFiltered ? `${basePath}?page=${page}` : basePath,
    image: category.imageUrl,
  });

  return isFiltered ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function ChildCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string; childSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { categorySlug, childSlug } = await params;
  const sp = await searchParams;
  const { page, tags: selectedTagSlugs, sort, brand, priceMin, priceMax, inStock, attrValues, attrRanges } =
    parseCatalogSearchParams(sp);

  const parent = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: {
      children: {
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      },
    },
  });

  if (!parent) {
    notFound();
  }

  const category = await prisma.category.findUnique({
    where: { slug: childSlug },
    include: {
      children: {
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      },
    },
  });

  // Категория должна существовать и быть именно ребёнком parent — иначе 404
  if (!category || category.parentId !== parent.id) {
    notFound();
  }

  const visibleCategoryIds = await getVisibleCategoryIds();
  if (!visibleCategoryIds.includes(category.id) || !visibleCategoryIds.includes(parent.id)) {
    notFound();
  }

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: parent.name, href: `/category/${parent.slug}` },
    { label: category.name },
  ];

    // Есть свои подкатегории (третий уровень) — показываем плитку
  const visibleChildren = category.children.filter((c) => visibleCategoryIds.includes(c.id));

  if (visibleChildren.length > 0) {
    const tileItems = visibleChildren.map((child) => ({
      slug: child.slug,
      name: child.name,
      href: `/category/${parent.slug}/${category.slug}/${child.slug}`,
      productCount: child._count.products,
      imageUrl: child.imageUrl,
    }));

    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <JsonLd
          data={buildCollectionJsonLd({
            path: `/category/${parent.slug}/${category.slug}`,
            name: category.name,
            crumbs,
            itemPaths: tileItems.map((item) => item.href),
            totalCount: tileItems.length,
          })}
        />
        <nav className="mb-5 flex flex-wrap items-center gap-3 text-[14px] font-semibold uppercase tracking-[2px] text-accent">
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
          <ShowAllProductsButton href={`/category/${parent.slug}/${category.slug}/all`} />
        </div>

        <CategoryTileGrid items={tileItems} />
      </main>
    );
  }

  // Лист без подкатегорий — сразу листинг товаров
  const categoryNav: CategoryNavData = {
    allProductsLink: { label: `Все товары: ${parent.name}`, href: `/category/${parent.slug}/all` },
    activeSlug: category.slug,
    items: parent.children.filter((s) => visibleCategoryIds.includes(s.id)).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      href: `/category/${parent.slug}/${s.slug}`,
      productCount: s._count.products,
    })),
  };

  return (
    <CategoryProductListing
      title={category.name}
      basePath={`/category/${parent.slug}/${category.slug}`}
      categoryId={category.id}
      brand={brand}
      tags={selectedTagSlugs}
      sort={sort}
      page={page}
      crumbs={crumbs}
      backHref={`/category/${parent.slug}`}
      categoryNav={categoryNav}
      priceMin={priceMin}
      priceMax={priceMax}
      inStock={inStock}
      attrValues={attrValues}
      attrRanges={attrRanges}
      jsonLd={({ cards, totalCount }) =>
        buildCollectionJsonLd({
          path: `/category/${parent.slug}/${category.slug}`,
          name: category.name,
          crumbs,
          itemPaths: cards.map((card) => `/product/${card.slug}`),
          totalCount,
          offset: (page - 1) * PAGE_SIZE,
        })
      }
    />
  );
}