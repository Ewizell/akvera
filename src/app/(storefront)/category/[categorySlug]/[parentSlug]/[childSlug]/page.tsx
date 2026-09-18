import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryTileGrid from "@/components/CategoryTileGrid";
import CategoryProductListing from "@/components/CategoryProductListing";
import { parseCatalogSearchParams } from "@/lib/catalog-query";
import type { CategoryNavData } from "@/components/CategoryFilterSidebar";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string; childSlug: string }>;
}): Promise<Metadata> {
  const { categorySlug, childSlug } = await params;

  const [parent, category] = await Promise.all([
    prisma.category.findUnique({ where: { slug: categorySlug }, select: { name: true } }),
    prisma.category.findUnique({ where: { slug: childSlug }, select: { name: true } }),
  ]);

  if (!parent || !category) return {};

  return {
    title: `${category.name} — ${parent.name}`,
    description: `${category.name} в разделе «${parent.name}» — каталог оборудования Akvera.`,
  };
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

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: parent.name, href: `/category/${parent.slug}` },
    { label: category.name },
  ];

    // Есть свои подкатегории (третий уровень) — показываем плитку
  if (category.children.length > 0) {
    const tileItems = category.children.map((child) => ({
      slug: child.slug,
      name: child.name,
      href: `/category/${parent.slug}/${category.slug}/${child.slug}`,
      productCount: child._count.products,
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
          <Link
            href={`/category/${parent.slug}/${category.slug}/all`}
            className="text-sm text-blue-600 hover:underline"
          >
            Показать все товары →
          </Link>
        </div>

        <CategoryTileGrid items={tileItems} />
      </main>
    );
  }

  // Лист без подкатегорий — сразу листинг товаров
  const categoryNav: CategoryNavData = {
    allProductsLink: { label: `Все товары: ${parent.name}`, href: `/category/${parent.slug}/all` },
    activeSlug: category.slug,
    items: parent.children.map((s) => ({
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
    />
  );
}