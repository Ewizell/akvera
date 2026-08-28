import CategoryProductListing from "@/components/CategoryProductListing";

export const revalidate = 3600;

export default async function CatalogAllPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tags?: string; sort?: string; brand?: string }>;
}) {
  const { page: pageParam, tags: tagsParam, sort: sortParam, brand } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const selectedTagSlugs = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
  const sort = sortParam === "price_asc" || sortParam === "price_desc" || sortParam === "stock" ? sortParam : undefined;

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Все товары" },
  ];

  return (
    <CategoryProductListing
      title="Все товары"
      basePath="/catalog/all"
      brand={brand}
      tags={selectedTagSlugs}
      sort={sort}
      page={page}
      crumbs={crumbs}
      backHref="/catalog"
    />
  );
}