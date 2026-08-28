import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CategoryProductListing from "@/components/CategoryProductListing";

export const revalidate = 3600;

export default async function CategoryAllPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string; tags?: string; sort?: string; brand?: string }>;
}) {
  const { categorySlug } = await params;
  const { page: pageParam, tags: tagsParam, sort: sortParam, brand } = await searchParams;

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: { children: { select: { id: true } } },
  });

  if (!category) {
    notFound();
  }

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const selectedTagSlugs = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
  const sort = sortParam === "price_asc" || sortParam === "price_desc" || sortParam === "stock" ? sortParam : undefined;

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

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
    />
  );
}