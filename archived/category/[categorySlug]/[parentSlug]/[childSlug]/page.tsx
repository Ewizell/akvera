import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
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
    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <Breadcrumbs items={crumbs} />
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          <div className="flex items-center gap-4">
            <Link
              href={`/category/${parent.slug}/${category.slug}/all`}
              className="text-sm text-blue-600 hover:underline"
            >
              Показать все товары →
            </Link>
            <Link href={`/category/${parent.slug}`} className="text-sm text-gray-500 hover:underline">
              ← Назад
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/category/${parent.slug}/${category.slug}/${child.slug}`}
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