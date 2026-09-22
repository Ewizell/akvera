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
    if (filters.categorySlug) params.set("category", filters.categorySlug);
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
        <nav className="flex justify-center items-center gap-[12px] mt-7" aria-label="Пагинация">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`shrink-0 ${
          currentPage === 1
            ? "pointer-events-none opacity-30 text-[#1c2126]"
            : "text-[#1c2126] hover:text-[#179146]"
        }`}
      >
        <svg className="rotate-180" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3l5 5-5 5" />
        </svg>
      </Link>

      {pageItems.map((item) =>
        item === "dots-left" || item === "dots-right" ? (
          <span key={item} className="font-manrope text-[14px] text-[#1c2126] select-none">
            ...
          </span>
        ) : item === currentPage ? (
          <div
            key={item}
            className="bg-[#179146] flex items-center justify-center rounded-[14px] size-[28px] shrink-0"
          >
            <span className="font-manrope text-[14px] text-white">{item}</span>
          </div>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
            className="font-manrope text-[14px] text-[#1c2126] hover:text-[#179146]"
          >
            {item}
          </Link>
        )
      )}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`shrink-0 ${
          currentPage === totalPages
            ? "pointer-events-none opacity-30 text-[#1c2126]"
            : "text-[#1c2126] hover:text-[#179146]"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3l5 5-5 5" />
        </svg>
      </Link>
    </nav>
  );
}