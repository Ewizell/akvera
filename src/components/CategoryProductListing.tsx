import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CatalogGrid from "@/components/CatalogGrid";
import CatalogFilterBar from "@/components/CatalogFilterBar";
import CatalogPagination from "@/components/CatalogPagination";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  getCatalogProducts,
  getPriceRange,
  getAttributeFilterOptions,
  PAGE_SIZE,
  type CatalogFilters,
} from "@/lib/catalog-query";
import { CategoryFilterSidebar, type CategoryNavData } from "@/components/CategoryFilterSidebar";

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
  categoryNav,
  priceMin,
  priceMax,
  inStock,
  attrValues,
  attrRanges,
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
  categoryNav: CategoryNavData;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  attrValues: Record<string, string[]>;
  attrRanges: Record<string, { min?: number; max?: number }>;
}) {
  const filters: CatalogFilters = {
    categoryId,
    categoryIds,
    brand,
    q,
    tags,
    sort,
    priceMin,
    priceMax,
    inStock,
    attrValues,
    attrRanges,
  };

  const [{ cards, totalCount }, brands, allTags, priceRange, attributeOptions] = await Promise.all([
    getCatalogProducts(filters, page),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    getPriceRange({ categoryId, categoryIds, brand, tags }),
    getAttributeFilterOptions(categoryId, categoryIds),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside>
          <CategoryFilterSidebar
            basePath={basePath}
            categoryNav={categoryNav}
            priceRange={priceRange}
            brands={brands}
            attributeOptions={attributeOptions}
            q={q}
            brand={brand}
            tags={tags}
            sort={sort}
            priceMin={priceMin}
            priceMax={priceMax}
            inStock={inStock}
            attrValues={attrValues}
            attrRanges={attrRanges}
          />
        </aside>

        <div>
          <Breadcrumbs items={crumbs} />
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <Link href={backHref} className="text-sm text-gray-500 hover:underline">
              ← Назад
            </Link>
          </div>

          <CatalogFilterBar allTags={allTags} selectedTagSlugs={tags} basePath={basePath} filters={filters} />

          <CatalogGrid
            key={JSON.stringify({ brand, tags, sort, page, priceMin, priceMax, inStock, attrValues, attrRanges })}
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
              filters={filters}
            />
          )}
        </div>
      </div>
    </main>
  );
}