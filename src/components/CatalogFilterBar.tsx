"use client";

import { useState } from "react";
import Link from "next/link";
import type { CatalogFilters } from "@/lib/catalog-query";
import ScrollRow from "./ScrollRow";

type Tag = {
  id: string;
  name: string;
  slug: string;
};

export default function CatalogFilterBar({
  allTags,
  selectedTagSlugs,
  basePath,
  filters,
}: {
  allTags: Tag[];
  selectedTagSlugs: string[];
  basePath: string;
  filters: CatalogFilters;
}) {
  const [expanded, setExpanded] = useState(false);

  const VISIBLE_COUNT = 6;

  function buildHref(params: { tags?: string[] }) {
    const searchParams = new URLSearchParams();

    if (filters.q) {
      searchParams.set("q", filters.q);
    }

    if (filters.categorySlug) {
      searchParams.set("category", filters.categorySlug);
    }

    if (filters.brand) {
      searchParams.set("brand", filters.brand);
    }

    if (filters.sort) {
      searchParams.set("sort", filters.sort);
    }

    if (params.tags && params.tags.length > 0) {
      searchParams.set("tags", params.tags.join(","));
    }

    if (filters.priceMin !== undefined) {
      searchParams.set("priceMin", String(filters.priceMin));
    }

    if (filters.priceMax !== undefined) {
      searchParams.set("priceMax", String(filters.priceMax));
    }

    if (filters.inStock) {
      searchParams.set("stock", "1");
    }

    if (filters.attrValues) {
      for (const [key, values] of Object.entries(filters.attrValues)) {
        if (values.length > 0) {
          searchParams.set(`attr_${key}`, values.join(","));
        }
      }
    }

    if (filters.attrRanges) {
      for (const [key, range] of Object.entries(filters.attrRanges)) {
        if (range.min !== undefined) {
          searchParams.set(`attr_${key}_min`, String(range.min));
        }

        if (range.max !== undefined) {
          searchParams.set(`attr_${key}_max`, String(range.max));
        }
      }
    }

    const qs = searchParams.toString();

    return qs ? `${basePath}?${qs}` : basePath;
  }

  function toggleTag(slug: string) {
    const next = selectedTagSlugs.includes(slug)
      ? selectedTagSlugs.filter((item) => item !== slug)
      : [...selectedTagSlugs, slug];

    return buildHref({
      tags: next,
    });
  }

  if (allTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 sm:mb-6">
      <div
        className="
          inline-flex
          min-h-11
          w-full
          max-w-full
          items-center
          rounded-xl
          bg-[#e5e8eb]
          p-1.5
          sm:w-auto
        "
      >
        {/* Название блока */}
        <div
          className="
            hidden
            h-8
            shrink-0
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
          Теги
        </div>

        {/* Разделитель */}
        <div
          aria-hidden="true"
          className="
            mx-1.5
            hidden
            h-5
            w-px
            shrink-0
            bg-[#cfd4d9]
            sm:block
          "
        />

        {/* Теги */}
        <ScrollRow className="flex-nowrap gap-1 sm:flex-wrap sm:overflow-visible">
          {allTags.map((tag, index) => {
            const active = selectedTagSlugs.includes(tag.slug);
            const hiddenOnDesktop =
              !expanded && index >= VISIBLE_COUNT;

            return (
              <Link
                key={tag.id}
                href={toggleTag(tag.slug)}
                aria-pressed={active}
                className={[
                  "inline-flex",
                  hiddenOnDesktop ? "sm:hidden" : "",
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
                {tag.name}
              </Link>
            );
          })}

          {/* Показать ещё */}
          {allTags.length > VISIBLE_COUNT && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="
                hidden
                h-8
                shrink-0
                items-center
                gap-1
                rounded-lg
                px-3
                text-[13px]
                font-medium
                text-accent
                sm:inline-flex
                transition-all
                duration-300
                hover:bg-white/60
                hover:text-[#28313d]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-accent/30
              "
            >
              <span>
                {expanded ? "Скрыть" : "Показать ещё"}
              </span>

              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className={[
                  "transition-transform duration-300",
                  expanded ? "rotate-180" : "",
                ].join(" ")}
              >
                <path
                  d="M3 5.5L7 9.5L11 5.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </ScrollRow>
      </div>
    </div>
  );
}