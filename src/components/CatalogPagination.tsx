"use client";

import Link from "next/link";
import type { CatalogFilters } from "@/lib/catalog-query";

export default function CatalogPagination({
  currentPage,
  totalPages,
  basePath,
  filters,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  filters: CatalogFilters;
}) {
  function range(start: number, end: number): number[] {
    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i,
    );
  }

  function getPageItems(
    current: number,
    total: number,
    siblingCount = 1,
  ): (number | "dots-left" | "dots-right")[] {
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPageNumbers >= total) {
      return range(1, total);
    }

    const leftSiblingIndex = Math.max(
      current - siblingCount,
      1,
    );

    const rightSiblingIndex = Math.min(
      current + siblingCount,
      total,
    );

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots =
      rightSiblingIndex < total - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;

      return [
        ...range(1, leftItemCount),
        "dots-right",
        total,
      ];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;

      return [
        1,
        "dots-left",
        ...range(
          total - rightItemCount + 1,
          total,
        ),
      ];
    }

    return [
      1,
      "dots-left",
      ...range(
        leftSiblingIndex,
        rightSiblingIndex,
      ),
      "dots-right",
      total,
    ];
  }

  const pageItems = getPageItems(
    currentPage,
    totalPages,
  );

  function buildHref(page: number) {
    const params = new URLSearchParams();

    if (filters.q) {
      params.set("q", filters.q);
    }

    if (filters.categorySlug) {
      params.set(
        "category",
        filters.categorySlug,
      );
    }

    if (filters.brand) {
      params.set("brand", filters.brand);
    }

    if (
      filters.tags &&
      filters.tags.length > 0
    ) {
      params.set(
        "tags",
        filters.tags.join(","),
      );
    }

    if (filters.sort) {
      params.set("sort", filters.sort);
    }

    if (filters.priceMin !== undefined) {
      params.set(
        "priceMin",
        String(filters.priceMin),
      );
    }

    if (filters.priceMax !== undefined) {
      params.set(
        "priceMax",
        String(filters.priceMax),
      );
    }

    if (filters.inStock) {
      params.set("stock", "1");
    }

    if (filters.attrValues) {
      for (const [key, values] of Object.entries(
        filters.attrValues,
      )) {
        if (values.length > 0) {
          params.set(
            `attr_${key}`,
            values.join(","),
          );
        }
      }
    }

    if (filters.attrRanges) {
      for (const [key, range] of Object.entries(
        filters.attrRanges,
      )) {
        if (range.min !== undefined) {
          params.set(
            `attr_${key}_min`,
            String(range.min),
          );
        }

        if (range.max !== undefined) {
          params.set(
            `attr_${key}_max`,
            String(range.max),
          );
        }
      }
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const qs = params.toString();

    return qs
      ? `${basePath}?${qs}`
      : basePath;
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="
        mt-6
        flex
        items-center
        justify-center
        gap-1.5
        sm:mt-8
      "
      aria-label="Пагинация"
    >
      {/* Назад */}
      <Link
        href={buildHref(
          Math.max(1, currentPage - 1),
        )}
        aria-disabled={currentPage === 1}
        className={[
          "inline-flex",
          "h-11",
          "w-11",
          "sm:h-9",
          "sm:w-9",
          "items-center",
          "justify-center",
          "rounded-xl",
          "text-[#66717d]",
          "transition-all",
          "duration-300",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-accent/30",
          currentPage === 1
            ? "pointer-events-none opacity-30"
            : [
                "hover:bg-[#e5e8eb]",
                "hover:text-[#28313d]",
              ].join(" "),
        ].join(" ")}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="rotate-180"
        >
          <path d="M6 3l5 5-5 5" />
        </svg>
      </Link>

      {/* Мобильный индикатор */}
      <div
        className="
          inline-flex
          h-11
          items-center
          rounded-xl
          bg-[#e5e8eb]
          px-4
          text-[13px]
          font-medium
          text-[#28313d]
          sm:hidden
        "
      >
        Стр. {currentPage} из {totalPages}
      </div>

      {/* Номера страниц */}
      <div
        className="
          hidden
          min-h-11
          items-center
          gap-1
          rounded-xl
          bg-[#e5e8eb]
          p-1.5
          sm:inline-flex
        "
      >
        {pageItems.map((item, index) => {
          if (
            item === "dots-left" ||
            item === "dots-right"
          ) {
            return (
              <span
                key={`${item}-${index}`}
                className="
                  inline-flex
                  h-8
                  min-w-8
                  items-center
                  justify-center
                  px-1
                  text-[13px]
                  font-medium
                  text-[#66717d]
                  select-none
                "
              >
                …
              </span>
            );
          }

          const active = item === currentPage;

          if (active) {
            return (
              <div
                key={item}
                aria-current="page"
                className="
                  inline-flex
                  h-8
                  min-w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-white
                  px-2.5
                  text-[13px]
                  font-medium
                  text-[#28313d]
                  shadow-[0_2px_8px_rgba(40,49,61,0.06)]
                "
              >
                {item}
              </div>
            );
          }

          return (
            <Link
              key={item}
              href={buildHref(item)}
              className="
                inline-flex
                h-8
                min-w-8
                items-center
                justify-center
                rounded-lg
                px-2.5
                text-[13px]
                font-medium
                text-[#66717d]
                transition-all
                duration-300
                hover:bg-white/60
                hover:text-[#28313d]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-accent/30
              "
            >
              {item}
            </Link>
          );
        })}
      </div>

      {/* Вперёд */}
      <Link
        href={buildHref(
          Math.min(
            totalPages,
            currentPage + 1,
          ),
        )}
        aria-disabled={
          currentPage === totalPages
        }
        className={[
          "inline-flex",
          "h-11",
          "w-11",
          "sm:h-9",
          "sm:w-9",
          "items-center",
          "justify-center",
          "rounded-xl",
          "text-[#66717d]",
          "transition-all",
          "duration-300",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-accent/30",
          currentPage === totalPages
            ? "pointer-events-none opacity-30"
            : [
                "hover:bg-[#e5e8eb]",
                "hover:text-[#28313d]",
              ].join(" "),
        ].join(" ")}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3l5 5-5 5" />
        </svg>
      </Link>
    </nav>
  );
}