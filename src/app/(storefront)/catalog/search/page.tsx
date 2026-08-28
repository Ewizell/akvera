import CategoryProductListing from "@/components/CategoryProductListing";

export default async function CatalogSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; tags?: string; sort?: string; brand?: string }>;
}) {
  const { q, page: pageParam, tags: tagsParam, sort: sortParam, brand } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const selectedTagSlugs = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
  const sort = sortParam === "price_asc" || sortParam === "price_desc" || sortParam === "stock" ? sortParam : undefined;

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Результаты поиска" },
  ];

  return (
    <CategoryProductListing
      title={q ? `Результаты по запросу «${q}»` : "Поиск"}
      basePath="/catalog/search"
      q={q}
      brand={brand}
      tags={selectedTagSlugs}
      sort={sort}
      page={page}
      crumbs={crumbs}
      backHref="/catalog"
    />
  );
}