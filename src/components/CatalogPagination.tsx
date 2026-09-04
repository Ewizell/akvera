'use client'

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
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  function getPageItems(
    current: number,
    total: number,
    siblingCount = 1
  ): (number | "dots-left" | "dots-right")[] {
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPageNumbers >= total) {
      return range(1, total);
    }

    const leftSiblingIndex = Math.max(current - siblingCount, 1);
    const rightSiblingIndex = Math.min(current + siblingCount, total);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < total - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      return [...range(1, leftItemCount), "dots-right", total];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      return [1, "dots-left", ...range(total - rightItemCount + 1, total)];
    }

    return [1, "dots-left", ...range(leftSiblingIndex, rightSiblingIndex), "dots-right", total];
  }

  const pageItems = getPageItems(currentPage, totalPages);

  function buildHref(page: number) {
    const params = new URLSearchParams();

    if (filters.q) params.set("q", filters.q);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.tags && filters.tags.length > 0) params.set("tags", filters.tags.join(","));
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.priceMin !== undefined) params.set("priceMin", String(filters.priceMin));
    if (filters.priceMax !== undefined) params.set("priceMax", String(filters.priceMax));
    if (filters.inStock) params.set("stock", "1");
    if (filters.attrValues) {
      for (const [key, values] of Object.entries(filters.attrValues)) {
        if (values.length > 0) params.set(`attr_${key}`, values.join(","));
      }
    }
    if (filters.attrRanges) {
      for (const [key, range] of Object.entries(filters.attrRanges)) {
        if (range.min !== undefined) params.set(`attr_${key}_min`, String(range.min));
        if (range.max !== undefined) params.set(`attr_${key}_max`, String(range.max));
      }
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const qs = params.toString();

    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav
      className="flex justify-center items-center gap-1 mt-10"
      aria-label="Пагинация"
    >
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`px-3 py-1.5 rounded border text-sm ${
          currentPage === 1
            ? "pointer-events-none opacity-40 border-gray-200 text-gray-400"
            : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        ←
      </Link>

      {pageItems.map((item) =>
        item === "dots-left" || item === "dots-right" ? (
          <span key={item} className="px-2 text-sm text-gray-400 select-none">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
            className={`px-3 py-1.5 rounded border text-sm ${
              item === currentPage
                ? "bg-black text-white border-black"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {item}
          </Link>
        )
      )}

      <Link
        href={buildHref(
          Math.min(totalPages, currentPage + 1)
        )}
        aria-disabled={currentPage === totalPages}
        className={`px-3 py-1.5 rounded border text-sm ${
          currentPage === totalPages
            ? "pointer-events-none opacity-40 border-gray-200 text-gray-400"
            : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        →
      </Link>
    </nav>
  );
}