import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CategoryProductListing from "@/components/CategoryProductListing";

export const revalidate = 3600;

export default async function ChildCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ parentSlug: string; childSlug: string }>;
  searchParams: Promise<{ page?: string; tags?: string; sort?: string; brand?: string }>;
}) {
  const { parentSlug, childSlug } = await params;
  const { page: pageParam, tags: tagsParam, sort: sortParam, brand } = await searchParams;

  const child = await prisma.category.findFirst({
    where: { slug: childSlug, parent: { slug: parentSlug } },
    include: { parent: true },
  });

  if (!child) {
    notFound();
  }

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const selectedTagSlugs = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
  const sort = sortParam === "price_asc" || sortParam === "price_desc" || sortParam === "stock" ? sortParam : undefined;

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: child.parent!.name, href: `/category/${parentSlug}` },
    { label: child.name },
  ];

  return (
    <CategoryProductListing
      title={child.name}
      basePath={`/category/${parentSlug}/${childSlug}`}
      categoryId={child.id}
      brand={brand}
      tags={selectedTagSlugs}
      sort={sort}
      page={page}
      crumbs={crumbs}
      backHref={`/category/${parentSlug}`}
    />
  );
}