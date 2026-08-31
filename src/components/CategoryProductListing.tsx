import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CatalogGrid from "@/components/CatalogGrid";
import CatalogFilterBar from "@/components/CatalogFilterBar";
import CatalogPagination from "@/components/CatalogPagination";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getCatalogProducts, PAGE_SIZE, type CatalogFilters } from "@/lib/catalog-query";

export default async function CategoryProductListing({
  title,
  basePath,
  categoryId,
  categoryIds,
  brand,
  q,
  tags,
  sort,
  page,
  crumbs,
  backHref,
}: {
  title: string;
  basePath: string;
  categoryId?: string;
  categoryIds?: string[];
  brand?: string;
  q?: string;
  tags: string[];
  sort?: CatalogFilters["sort"];
  page: number;
  crumbs: { label: string; href?: string }[];
  backHref: string;
}) {
  const filters: CatalogFilters = { categoryId, categoryIds, brand, q, tags, sort };

  const [{ cards, totalCount }, brands, allTags] = await Promise.all([
    getCatalogProducts(filters, page),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function brandHref(slug: string | null) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (slug) params.set("brand", slug);
    if (tags.length > 0) params.set("tags", tags.join(","));
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-6">
          {brands.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 mb-2">Бренды</h2>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link
                    href={brandHref(null)}
                    className={!brand ? "font-medium" : "text-gray-600 hover:underline"}
                  >
                    Все бренды
                  </Link>
                </li>
                {brands.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={brandHref(b.slug)}
                      className={brand === b.slug ? "font-medium" : "text-gray-600 hover:underline"}
                    >
                      {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div>
          <Breadcrumbs items={crumbs} />
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <Link href={backHref} className="text-sm text-gray-500 hover:underline">
              ← Назад
            </Link>
          </div>

          <CatalogFilterBar allTags={allTags} selectedTagSlugs={tags} basePath={basePath} brand={brand} q={q} />

          <CatalogGrid
            key={`${brand ?? ""}|${tags.join(",")}|${sort ?? ""}|${page}`}
            products={cards}
            filters={filters}
            page={page}
            totalPages={totalPages}
            basePath={basePath}
          />

          {totalCount === 0 && (
            <p className="text-gray-500 text-center py-20">В этой категории пока нет товаров</p>
          )}

          {totalPages > 1 && (
            <CatalogPagination
              currentPage={page}
              totalPages={totalPages}
              basePath={basePath}
              brand={brand}
              q={q}
              tags={tags}
              sort={sort}
            />
          )}
        </div>
      </div>
    </main>
  );
}