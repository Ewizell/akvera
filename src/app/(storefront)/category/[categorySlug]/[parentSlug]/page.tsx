import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import CategoryProductListing from "@/components/CategoryProductListing";

export const revalidate = 3600;

export default async function ChildCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string; parentSlug: string }>;
  searchParams: Promise<{ page?: string; tags?: string; sort?: string; brand?: string }>;
}) {
  const { categorySlug, parentSlug } = await params;
  const { page: pageParam, tags: tagsParam, sort: sortParam, brand } = await searchParams;

  const parent = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!parent) {
    notFound();
  }

  const category = await prisma.category.findUnique({
    where: { slug: parentSlug },
    include: {
      children: {
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      },
    },
  });

  if (!category || category.parentId !== parent.id) {
    notFound();
  }

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: parent.name, href: `/category/${parent.slug}` },
    { label: category.name },
  ];

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

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const selectedTagSlugs = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
  const sort = sortParam === "price_asc" || sortParam === "price_desc" || sortParam === "stock" ? sortParam : undefined;

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
    />
  );
}