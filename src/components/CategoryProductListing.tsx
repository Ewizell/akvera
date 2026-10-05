import { prisma } from "@/lib/prisma";
import CatalogGrid from "@/components/CatalogGrid";
import CatalogFilterBar from "@/components/CatalogFilterBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import MobileFilters from "@/components/MobileFilters";
import {
  getCatalogProducts,
  getPriceRange,
  getAttributeFilterOptions,
  PAGE_SIZE,
  type CatalogFilters,
  type CatalogCard,
} from "@/lib/catalog-query";
import {
  CategoryFilterSidebar,
  type CategoryNavData,
  type CategoryChildrenData,
} from "@/components/CategoryFilterSidebar";

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
  headerContent?: React.ReactNode;
  jsonLd?: (
    ctx: {
      cards: CatalogCard[];
      totalCount: number;
    },
  ) => Record<string, unknown> | null;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  attrValues?: Record<string, string[]>;
  attrRanges?: Record<
    string,
    {
      min?: number;
      max?: number;
    }
  >;
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

  const [
    { cards, totalCount },
    brands,
    allTags,
    priceRange,
    attributeOptions,
  ] = await Promise.all([
    getCatalogProducts(filters, page),

    prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.tag.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    getPriceRange({
      categoryId,
      categoryIds,
      brand,
      tags,
    }),

    getAttributeFilterOptions(
      categoryId,
      categoryIds,
      brand,
    ),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE),
  );

  const ldJson = jsonLd
    ? jsonLd({
        cards,
        totalCount,
      })
    : null;

  return (
    <>
      {ldJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ldJson),
          }}
        />
      )}

      <main className="w-full bg-[#f4f5f7]">
        <div
          className="
            mx-auto
            w-full
            max-w-[1440px]
            px-5
            py-5
            sm:px-8
            sm:py-10
            lg:px-12
          "
        >
          {/* =====================================================
              ХЛЕБНЫЕ КРОШКИ
          ===================================================== */}

          <Breadcrumbs items={crumbs} />

          {/* =====================================================
              ЗАГОЛОВОК
          ===================================================== */}

          <div className="mt-3 mb-5 sm:mt-5 sm:mb-7">
            <h1
              className="
                text-[24px]
                font-semibold
                leading-tight
                tracking-[-0.03em]
                text-[#28313d]
                sm:text-[34px]
                lg:text-[36px]
              "
            >
              {title}
            </h1>

            {headerContent && (
              <div className="mt-4">
                {headerContent}
              </div>
            )}
          </div>

          {/* =====================================================
              ОСНОВНАЯ ОБЛАСТЬ
          ===================================================== */}

          <div
            className="
              grid
              gap-4
              lg:grid-cols-[250px_minmax(0,1fr)]
              lg:gap-6
              xl:grid-cols-[270px_minmax(0,1fr)]
              xl:gap-8
            "
          >
            {/* ===================================================
                ЛЕВАЯ ПАНЕЛЬ ФИЛЬТРОВ
            =================================================== */}

            <aside className="min-w-0">
              <MobileFilters totalCount={totalCount}>
              <div
                className="
                  overflow-hidden
                  bg-white
                  lg:rounded-2xl
                "
              >
                {/* Счётчик */}

                <div className="px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-[#28313d]">
                      Найдено товаров
                    </p>

                    <span
                      className="
                        shrink-0
                        rounded-full
                        bg-[#f0f2f4]
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                        text-[#66717d]
                      "
                    >
                      {totalCount}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-[#edf0f2]" />

                {/* Фильтры */}

                <div className="px-5 py-5 sm:px-6">
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
                </div>
              </div>
              </MobileFilters>
            </aside>

            {/* ===================================================
                ПРАВАЯ ЧАСТЬ
            =================================================== */}

            <div className="min-w-0">
              {/* Панель быстрых фильтров / сортировки */}

              <div className="mb-4">
                <CatalogFilterBar
                  allTags={allTags}
                  selectedTagSlugs={tags}
                  basePath={basePath}
                  filters={filters}
                />
              </div>

              {/* =================================================
                  ТОВАРЫ
              ================================================= */}

              <CatalogGrid
                key={JSON.stringify({
                  brand,
                  tags,
                  sort,
                  page,
                  priceMin,
                  priceMax,
                  inStock,
                  attrValues,
                  attrRanges,
                })}
                products={cards}
                filters={filters}
                page={page}
                totalPages={totalPages}
                basePath={basePath}
              />

              {/* =================================================
                  ПУСТОЙ РЕЗУЛЬТАТ
              ================================================= */}

              {totalCount === 0 && (
                <div
                  className="
                    rounded-2xl
                    bg-white
                    px-6
                    py-20
                    text-center
                  "
                >
                  <p className="text-sm leading-6 text-[#66717d]">
                    В этой категории пока нет товаров
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}