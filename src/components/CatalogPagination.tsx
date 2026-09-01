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
  const pages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

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

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={`px-3 py-1.5 rounded border text-sm ${
            p === currentPage
              ? "bg-black text-white border-black"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {p}
        </Link>
      ))}

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