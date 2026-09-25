import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CatalogGrid from "@/components/CatalogGrid";
import CatalogFilterBar from "@/components/CatalogFilterBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  getCatalogProducts,
  getPriceRange,
  getAttributeFilterOptions,
  PAGE_SIZE,
  type CatalogFilters,
  type CatalogCard,
} from "@/lib/catalog-query";
import { CategoryFilterSidebar, type CategoryNavData, type CategoryChildrenData } from "@/components/CategoryFilterSidebar";

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
  categoryChildren,
  headerContent,
  jsonLd,
  priceMin,
  priceMax,
  inStock,
  attrValues = {},
  attrRanges = {},
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
  categoryNav?: CategoryNavData;
  categoryChildren?: CategoryChildrenData;
  headerContent?: React.ReactNode; // произвольный блок под заголовком (шапка бренда и т.п.)
  jsonLd?: (ctx: { cards: CatalogCard[]; totalCount: number }) => Record<string, unknown> | null; // опциональная JSON-LD схема на основе уже загруженных карточек
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  attrValues?: Record<string, string[]>;
  attrRanges?: Record<string, { min?: number; max?: number }>;
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
    getAttributeFilterOptions(categoryId, categoryIds, brand),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const ldJson = jsonLd ? jsonLd({ cards, totalCount }) : null;

  return (
    <>
      {ldJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      )}
      <main className="max-w-[1440px] mx-auto px-20 py-10">
      <Breadcrumbs items={crumbs} />

      <h1 className="font-bold text-[#0f172a] text-[36px] leading-[1.2] mt-3 mb-6">{title}</h1>

      {headerContent}

      <div className="grid grid-cols-[221px_1fr] gap-8">
<aside>
  <p className="font-manrope font-bold text-[#1c2126] text-base mb-4">
    Найдено: {totalCount} {totalCount === 1 ? "товар" : "товаров"}
  </p>
  <div className="h-px bg-[#d9d9d9] mb-4" />
  <CategoryFilterSidebar
    basePath={basePath}
    categoryNav={categoryNav}
    categoryChildren={categoryChildren}
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

        <div className="min-w-0">
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
        </div>
      </div>
    </main>
    </>
  );
}