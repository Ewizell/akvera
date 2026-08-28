'use client'

import Link from "next/link";

export default function CatalogPagination({
  currentPage,
  totalPages,
  basePath,
  brand,
  q,
  tags,
  sort,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  brand?: string;
  q?: string;
  tags?: string[];
  sort?: string;
}) {
  const pages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

  function buildHref(page: number) {
    const params = new URLSearchParams();

    if (q) {
      params.set("q", q);
    }

    if (brand) {
      params.set("brand", brand);
    }

    if (tags && tags.length > 0) {
      params.set("tags", tags.join(","));
    }

    if (sort) {
      params.set("sort", sort);
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