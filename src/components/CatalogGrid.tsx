"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { loadMoreCatalogProducts } from "@/lib/actions/catalog";
import type { CatalogFilters, CatalogCard } from "@/lib/catalog-query";
import CatalogPagination from "./CatalogPagination";
import ProductCard from "./ProductCard";
import ProductCardHorizontal from "./ProductCardHorizontal";
import ScrollRow from "./ScrollRow";

const STORAGE_KEY = "akvera_catalog_view";

const SORT_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "", label: "По умолчанию" },
  { value: "price_desc", label: "Сначала дороже" },
  { value: "price_asc", label: "Сначала дешевле" },
  { value: "stock", label: "Сначала в наличии" },
];

function buildSortHref(
  basePath: string,
  filters: CatalogFilters,
  sort: string,
) {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.categorySlug) {
    params.set("category", filters.categorySlug);
  }

  if (filters.brand) {
    params.set("brand", filters.brand);
  }

  if (filters.tags && filters.tags.length > 0) {
    params.set("tags", filters.tags.join(","));
  }

  if (sort) {
    params.set("sort", sort);
  }

  if (filters.priceMin !== undefined) {
    params.set("priceMin", String(filters.priceMin));
  }

  if (filters.priceMax !== undefined) {
    params.set("priceMax", String(filters.priceMax));
  }

  if (filters.inStock) {
    params.set("stock", "1");
  }

  if (filters.attrValues) {
    for (const [key, values] of Object.entries(filters.attrValues)) {
      if (values.length > 0) {
        params.set(`attr_${key}`, values.join(","));
      }
    }
  }

  if (filters.attrRanges) {
    for (const [key, range] of Object.entries(filters.attrRanges)) {
      if (range.min !== undefined) {
        params.set(`attr_${key}_min`, String(range.min));
      }

      if (range.max !== undefined) {
        params.set(`attr_${key}_max`, String(range.max));
      }
    }
  }

  const qs = params.toString();

  return qs ? `${basePath}?${qs}` : basePath;
}

export default function CatalogGrid({
  products,
  filters,
  page,
  totalPages,
  basePath,
}: {
  products: CatalogCard[];
  filters: CatalogFilters;
  page: number;
  totalPages: number;
  basePath: string;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [items, setItems] = useState(products);
  const [currentPage, setCurrentPage] = useState(page);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(products);
    setCurrentPage(page);
  }, [products, page]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "grid" || saved === "list") {
      setView(saved);
    }
  }, []);

  function setViewAndSave(nextView: "grid" | "list") {
    setView(nextView);
    localStorage.setItem(STORAGE_KEY, nextView);
  }

  function handleLoadMore() {
    startTransition(async () => {
      const nextPage = currentPage + 1;
      const more = await loadMoreCatalogProducts(
        filters,
        nextPage,
      );

      setItems((prev) => [...prev, ...more]);
      setCurrentPage(nextPage);
    });
  }

  const currentSort = filters.sort ?? "";

  return (
    <div>
      {/* Сортировка + переключатель вида */}
      <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6 sm:gap-4">
        {/* Сортировка */}
        <div
          className="
            inline-flex
            min-h-11
            min-w-0
            items-center
            rounded-xl
            bg-[#e5e8eb]
            p-1.5
          "
        >
          {/* Название блока сортировки */}
          <div
            className="
              hidden
              h-8
              items-center
              rounded-lg
              bg-white
              px-3
              sm:flex
              text-[13px]
              font-semibold
              text-[#28313d]
              shadow-[0_2px_8px_rgba(40,49,61,0.04)]
            "
          >
            Сортировка
          </div>

          {/* Разделитель */}
          <div
            aria-hidden="true"
            className="
              mx-1.5
              hidden
              h-5
              sm:block
              w-px
              bg-[#cfd4d9]
            "
          />

          {/* Варианты сортировки */}
          <ScrollRow className="gap-1">
            {SORT_OPTIONS.map((option) => {
              const active =
                option.value === currentSort;

              return (
                <Link
                  key={option.value}
                  href={buildSortHref(
                    basePath,
                    filters,
                    option.value,
                  )}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={[
                    "inline-flex",
                    "shrink-0",
                    "h-8",
                    "items-center",
                    "rounded-lg",
                    "px-3",
                    "text-[13px]",
                    "font-medium",
                    "whitespace-nowrap",
                    "transition-all",
                    "duration-300",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-accent/30",

                    active
                      ? [
                          "bg-white",
                          "text-[#28313d]",
                          "shadow-[0_2px_8px_rgba(40,49,61,0.06)]",
                        ].join(" ")
                      : [
                          "text-[#66717d]",
                          "hover:bg-white/60",
                          "hover:text-[#28313d]",
                        ].join(" "),
                  ].join(" ")}
                >
                  {option.label}
                </Link>
              );
            })}
          </ScrollRow>
        </div>

        {/* Переключатель вида */}
        <div
          className="
            inline-flex
            h-11
            shrink-0
            items-center
            gap-1
            rounded-xl
            bg-[#e5e8eb]
            p-1.5
          "
        >
          {/* Плитка */}
          <button
            type="button"
            onClick={() => setViewAndSave("grid")}
            aria-label="Плиткой"
            aria-pressed={view === "grid"}
            className={[
              "flex",
              "h-8",
              "w-8",
              "items-center",
              "justify-center",
              "rounded-lg",
              "transition-all",
              "duration-300",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-accent/30",

              view === "grid"
                ? [
                    "bg-white",
                    "text-accent",
                    "shadow-[0_2px_8px_rgba(40,49,61,0.06)]",
                  ].join(" ")
                : [
                    "text-[#66717d]",
                    "hover:bg-white/60",
                    "hover:text-[#28313d]",
                  ].join(" "),
            ].join(" ")}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1.5"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1.5"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1.5"
              />
              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1.5"
              />
            </svg>
          </button>

          {/* Список */}
          <button
            type="button"
            onClick={() => setViewAndSave("list")}
            aria-label="Списком"
            aria-pressed={view === "list"}
            className={[
              "flex",
              "h-8",
              "w-8",
              "items-center",
              "justify-center",
              "rounded-lg",
              "transition-all",
              "duration-300",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-accent/30",

              view === "list"
                ? [
                    "bg-white",
                    "text-accent",
                    "shadow-[0_2px_8px_rgba(40,49,61,0.06)]",
                  ].join(" ")
                : [
                    "text-[#66717d]",
                    "hover:bg-white/60",
                    "hover:text-[#28313d]",
                  ].join(" "),
            ].join(" ")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Товары */}
      {view === "grid" ? (
        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
            sm:gap-5
            lg:grid-cols-4
          "
        >
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-4">
          {items.map((product) => (
            <ProductCardHorizontal
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}

      {/* Показать ещё */}
      {currentPage < totalPages && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="
              group
              inline-flex
              h-11
              items-center
              justify-between
              gap-3
              rounded-xl
              bg-[#e5e8eb]
              pl-4
              pr-1.5
              text-sm
              font-medium
              text-[#28313d]
              transition-all
              duration-300
              hover:bg-gradient-to-br
              hover:from-accent
              hover:to-accent-end
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:h-12
            "
          >
            <span className="whitespace-nowrap">
              {isPending ? "Загрузка..." : "Показать ещё"}
            </span>

            {!isPending && (
              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#d9dde1]
                  text-[#28313d]
                  transition-all
                  duration-300
                  group-hover:bg-white/15
                  group-hover:text-white
                "
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 2V14M2 8H14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <CatalogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={basePath}
          filters={filters}
        />
      )}
    </div>
  );
}