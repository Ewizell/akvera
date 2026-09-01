import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import CategoryProductListing from "@/components/CategoryProductListing";
import { parseCatalogSearchParams } from "@/lib/catalog-query";
import type { CategoryNavData } from "@/components/CategoryFilterSidebar";

export const revalidate = 3600;

export default async function CategoryPage({
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

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: category.name },
  ];

  // Есть подкатегории — показываем плитку, а не список товаров
  if (category.children.length > 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <Breadcrumbs items={crumbs} />
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          <div className="flex items-center gap-4">
            <Link
              href={`/category/${category.slug}/all`}
              className="text-sm text-blue-600 hover:underline"
            >
              Показать все товары →
            </Link>
            <Link href="/catalog" className="text-sm text-gray-500 hover:underline">
              ← Назад
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/category/${category.slug}/${child.slug}`}
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
  const siblings = category.parent
    ? category.parent.children
    : await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      });

  const categoryNav: CategoryNavData = {
    parentLink: category.parent ? { name: category.parent.name, href: `/category/${category.parent.slug}` } : null,
    currentSlug: category.slug,
    siblings: siblings.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      href: category.parent ? `/category/${category.parent.slug}/${s.slug}` : `/category/${s.slug}`,
      productCount: s._count.products,
    })),
    children: category.children.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      href: `/category/${category.slug}/${c.slug}`,
      productCount: c._count.products,
    })),
  };

  return (
    <CategoryProductListing
      title={category.name}
      basePath={`/category/${category.slug}`}
      categoryId={category.id}
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