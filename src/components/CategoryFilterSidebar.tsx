"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AttributeFilterOption } from "@/lib/catalog-query";

const transition =
  "transition-colors duration-200";

function BrandSelect({
  brands,
  value,
  onChange,
}: {
  brands: {
    id: string;
    name: string;
    slug: string;
  }[];
  value?: string;
  onChange: (slug: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  const currentLabel =
    brands.find((brand) => brand.slug === value)?.name ??
    "Все бренды";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`
          flex
          h-10
          w-full
          items-center
          justify-between
          gap-2
          rounded-xl
          border
          border-[#e5e8eb]
          bg-[#f4f5f7]
          px-3
          text-left
          text-sm
          font-medium
          text-[#28313d]
          ${transition}
          hover:border-[#d9dee3]
          hover:bg-[#eef0f2]
        `}
      >
        <span className="min-w-0 truncate">
          {currentLabel}
        </span>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`
            shrink-0
            text-[#929aa6]
            transition-transform
            duration-300
            ${open ? "rotate-180" : ""}
          `}
        >
          <path
            d="m6 9 6 6 6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          <div
            className="
              absolute
              left-0
              top-full
              z-20
              mt-1.5
              max-h-64
              w-full
              overflow-y-auto
              rounded-xl
              border
              border-[#e5e8eb]
              bg-white
              py-1
              shadow-[0_12px_30px_rgba(40,49,61,0.10)]
            "
          >
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={`
                block
                w-full
                px-3
                py-2
                text-left
                text-sm
                ${transition}
                ${
                  !value
                    ? "bg-[#f4f5f7] font-medium text-[#28313d]"
                    : "text-[#66717d] hover:bg-[#f4f5f7]"
                }
              `}
            >
              Все бренды
            </button>

            {brands.map((brand) => {
              const active = value === brand.slug;

              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => {
                    onChange(brand.slug);
                    setOpen(false);
                  }}
                  className={`
                    block
                    w-full
                    px-3
                    py-2
                    text-left
                    text-sm
                    ${transition}
                    ${
                      active
                        ? "bg-[#f4f5f7] font-medium text-[#28313d]"
                        : "text-[#66717d] hover:bg-[#f4f5f7]"
                    }
                  `}
                >
                  {brand.name}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export type CategoryNavItem = {
  id: string;
  name: string;
  slug: string;
  href: string;
  productCount: number;
};

export type CategoryNavData = {
  allProductsLink: {
    label: string;
    href: string;
  };
  items: CategoryNavItem[];
  activeSlug: string | null;
};

type Brand = {
  id: string;
  name: string;
  slug: string;
};

export type CategoryChildrenData = {
  showAllHref: string | null;
  items: {
    id: string;
    name: string;
    slug: string;
    href: string;
    productCount: number;
  }[];
  activeSlug: string | null;
};

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-3 text-sm font-medium text-[#28313d]">
      {children}
    </h3>
  );
}

function Count({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="shrink-0 text-xs text-[#929aa6]">
      {children}
    </span>
  );
}

export function CategoryFilterSidebar({
  basePath,
  categoryNav,
  categoryChildren,
  priceRange,
  brands,
  attributeOptions,
  q,
  brand,
  tags,
  sort,
  priceMin,
  priceMax,
  inStock,
  attrValues,
  attrRanges,
}: {
  basePath: string;
  categoryNav?: CategoryNavData;
  categoryChildren?: CategoryChildrenData;
  priceRange: {
    min: number;
    max: number;
  };
  brands: Brand[];
  attributeOptions: AttributeFilterOption[];
  q?: string;
  brand?: string;
  tags?: string[];
  sort?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  attrValues: Record<string, string[]>;
  attrRanges: Record<
    string,
    {
      min?: number;
      max?: number;
    }
  >;
}) {
  const router = useRouter();

  const [priceFrom, setPriceFrom] = useState(
    priceMin?.toString() ?? "",
  );

  const [priceTo, setPriceTo] = useState(
    priceMax?.toString() ?? "",
  );

  const [sliderFrom, setSliderFrom] = useState(
    priceMin ?? priceRange.min,
  );

  const [sliderTo, setSliderTo] = useState(
    priceMax ?? priceRange.max,
  );

  function buildHref(overrides: {
    brand?: string | null;
    priceMin?: number | null;
    priceMax?: number | null;
    inStock?: boolean | null;
    attrValues?: Record<string, string[]>;
    attrRanges?: Record<
      string,
      {
        min?: number;
        max?: number;
      }
    >;
  }) {
    const params = new URLSearchParams();

    if (q) {
      params.set("q", q);
    }

    const nextBrand =
      overrides.brand !== undefined
        ? overrides.brand
        : brand;

    if (nextBrand) {
      params.set("brand", nextBrand);
    }

    if (tags && tags.length > 0) {
      params.set("tags", tags.join(","));
    }

    if (sort) {
      params.set("sort", sort);
    }

    const nextPriceMin =
      overrides.priceMin !== undefined
        ? overrides.priceMin
        : priceMin;

    const nextPriceMax =
      overrides.priceMax !== undefined
        ? overrides.priceMax
        : priceMax;

    if (
      nextPriceMin !== null &&
      nextPriceMin !== undefined
    ) {
      params.set(
        "priceMin",
        String(nextPriceMin),
      );
    }

    if (
      nextPriceMax !== null &&
      nextPriceMax !== undefined
    ) {
      params.set(
        "priceMax",
        String(nextPriceMax),
      );
    }

    const nextInStock =
      overrides.inStock !== undefined
        ? overrides.inStock
        : inStock;

    if (nextInStock) {
      params.set("stock", "1");
    }

    const nextAttrValues =
      overrides.attrValues ?? attrValues;

    for (const [key, values] of Object.entries(
      nextAttrValues,
    )) {
      if (values.length > 0) {
        params.set(
          `attr_${key}`,
          values.join(","),
        );
      }
    }

    const nextAttrRanges =
      overrides.attrRanges ?? attrRanges;

    for (const [key, range] of Object.entries(
      nextAttrRanges,
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

    const queryString = params.toString();

    return queryString
      ? `${basePath}?${queryString}`
      : basePath;
  }

  function applyPriceInputs() {
    const from = priceFrom
      ? Number(priceFrom)
      : null;

    const to = priceTo
      ? Number(priceTo)
      : null;

    router.push(
      buildHref({
        priceMin: from,
        priceMax: to,
      }),
    );
  }

  function applySlider(
    from: number,
    to: number,
  ) {
    setSliderFrom(from);
    setSliderTo(to);

    setPriceFrom(String(from));
    setPriceTo(String(to));
  }

  function toggleAttrValue(
    key: string,
    value: string,
  ) {
    const current = attrValues[key] ?? [];

    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    router.push(
      buildHref({
        attrValues: {
          ...attrValues,
          [key]: next,
        },
      }),
    );
  }

  const priceDifference =
    priceRange.max - priceRange.min;

  const sliderFromPercent =
    priceDifference > 0
      ? ((sliderFrom - priceRange.min) /
          priceDifference) *
        100
      : 0;

  const sliderToPercent =
    priceDifference > 0
      ? ((sliderTo - priceRange.min) /
          priceDifference) *
        100
      : 100;

  return (
    <div className="w-full">
      {/* =====================================================
          КАТЕГОРИЯ
      ===================================================== */}

      {categoryNav && (
        <div className="pb-5">
          <SectionTitle>
            Категория
          </SectionTitle>

          <div className="space-y-0.5">
            <Link
              href={categoryNav.allProductsLink.href}
              className={`
                group
                flex
                min-w-0
                items-center
                justify-between
                gap-2
                rounded-lg
                px-2.5
                py-2
                ${transition}
                ${
                  categoryNav.activeSlug === null
                    ? "bg-[#f4f5f7]"
                    : "hover:bg-[#f4f5f7]"
                }
              `}
            >
              <span
                className={`
                  min-w-0
                  text-sm
                  ${
                    categoryNav.activeSlug === null
                      ? "font-medium text-[#28313d]"
                      : "text-[#66717d]"
                  }
                `}
              >
                {categoryNav.allProductsLink.label}
              </span>
            </Link>

            {categoryNav.items.map((item) => {
              const active =
                item.slug ===
                categoryNav.activeSlug;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    group
                    flex
                    min-w-0
                    items-center
                    justify-between
                    gap-2
                    rounded-lg
                    px-2.5
                    py-2
                    ${transition}
                    ${
                      active
                        ? "bg-[#f4f5f7]"
                        : "hover:bg-[#f4f5f7]"
                    }
                  `}
                >
                  <span
                    className={`
                      min-w-0
                      truncate
                      text-sm
                      ${
                        active
                          ? "font-medium text-[#28313d]"
                          : "text-[#66717d]"
                      }
                    `}
                  >
                    {item.name}
                  </span>

                  <Count>
                    {item.productCount}
                  </Count>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
          РАЗДЕЛЫ
      ===================================================== */}

      {categoryChildren &&
        categoryChildren.items.length > 0 && (
          <div className="border-t border-[#e5e8eb] py-5">
            <SectionTitle>
              Разделы
            </SectionTitle>

            {categoryChildren.showAllHref && (
              <Link
                href={categoryChildren.showAllHref}
                className="
                  mb-3
                  inline-flex
                  text-xs
                  font-medium
                  text-accent
                  transition-opacity
                  hover:opacity-70
                "
              >
                Показать все товары раздела
              </Link>
            )}

            <div className="space-y-0.5">
              {categoryChildren.items.map(
                (item) => {
                  const active =
                    item.slug ===
                    categoryChildren.activeSlug;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`
                        group
                        flex
                        min-w-0
                        items-center
                        justify-between
                        gap-2
                        rounded-lg
                        px-2.5
                        py-2
                        ${transition}
                        ${
                          active
                            ? "bg-[#f4f5f7]"
                            : "hover:bg-[#f4f5f7]"
                        }
                      `}
                    >
                      <span
                        className={`
                          min-w-0
                          truncate
                          text-sm
                          ${
                            active
                              ? "font-medium text-[#28313d]"
                              : "text-[#66717d]"
                          }
                        `}
                      >
                        {item.name}
                      </span>

                      <Count>
                        {item.productCount}
                      </Count>
                    </Link>
                  );
                },
              )}
            </div>
          </div>
        )}

      {/* =====================================================
          ЦЕНА
      ===================================================== */}

      {priceRange.max > priceRange.min && (
        <div className="border-t border-[#e5e8eb] py-5">
          <SectionTitle>
            Цена, ₽
          </SectionTitle>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={priceFrom}
              onChange={(event) =>
                setPriceFrom(event.target.value)
              }
              onBlur={applyPriceInputs}
              placeholder={String(
                priceRange.min,
              )}
              className="
                h-10
                min-w-0
                w-full
                rounded-xl
                border
                border-[#e5e8eb]
                bg-[#f4f5f7]
                px-3
                text-sm
                text-[#28313d]
                outline-none
                transition-colors
                placeholder:text-[#929aa6]
                focus:border-accent
              "
            />

            <span className="shrink-0 text-[#929aa6]">
              —
            </span>

            <input
              type="number"
              value={priceTo}
              onChange={(event) =>
                setPriceTo(event.target.value)
              }
              onBlur={applyPriceInputs}
              placeholder={String(
                priceRange.max,
              )}
              className="
                h-10
                min-w-0
                w-full
                rounded-xl
                border
                border-[#e5e8eb]
                bg-[#f4f5f7]
                px-3
                text-sm
                text-[#28313d]
                outline-none
                transition-colors
                placeholder:text-[#929aa6]
                focus:border-accent
              "
            />
          </div>

          {/* Ползунок */}

          <div className="relative mt-6 h-1">
            <div className="absolute inset-0 rounded-full bg-[#e5e8eb]" />

            <div
              className="
                absolute
                h-1
                rounded-full
                bg-accent
              "
              style={{
                left: `${sliderFromPercent}%`,
                right: `${
                  100 - sliderToPercent
                }%`,
              }}
            />

            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={sliderFrom}
              onChange={(event) =>
                applySlider(
                  Math.min(
                    Number(event.target.value),
                    sliderTo,
                  ),
                  sliderTo,
                )
              }
              onMouseUp={applyPriceInputs}
              onTouchEnd={applyPriceInputs}
              className="
                pointer-events-none
                absolute
                top-1/2
                w-full
                -translate-y-1/2
                appearance-none
                bg-transparent

                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:bg-accent
                [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(40,49,61,0.18)]

                [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:bg-accent
              "
            />

            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={sliderTo}
              onChange={(event) =>
                applySlider(
                  sliderFrom,
                  Math.max(
                    Number(event.target.value),
                    sliderFrom,
                  ),
                )
              }
              onMouseUp={applyPriceInputs}
              onTouchEnd={applyPriceInputs}
              className="
                pointer-events-none
                absolute
                top-1/2
                w-full
                -translate-y-1/2
                appearance-none
                bg-transparent

                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:bg-accent
                [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(40,49,61,0.18)]

                [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:bg-accent
              "
            />
          </div>
        </div>
      )}

      {/* =====================================================
          БРЕНД
      ===================================================== */}

      {brands.length > 0 && (
        <div className="border-t border-[#e5e8eb] py-5">
          <SectionTitle>
            Бренд
          </SectionTitle>

          <BrandSelect
            brands={brands}
            value={brand}
            onChange={(slug) =>
              router.push(
                buildHref({
                  brand: slug,
                }),
              )
            }
          />
        </div>
      )}

      {/* =====================================================
          НАЛИЧИЕ
      ===================================================== */}

      <div className="border-t border-[#e5e8eb] py-5">
        <SectionTitle>
          Наличие
        </SectionTitle>

        <div className="space-y-1">
          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-2.5
              rounded-lg
              px-2.5
              py-2
              transition-colors
              hover:bg-[#f4f5f7]
            "
          >
            <input
              type="radio"
              name="stock"
              checked={!inStock}
              onChange={() =>
                router.push(
                  buildHref({
                    inStock: null,
                  }),
                )
              }
              className="peer sr-only"
            />

            <span
              className="
                flex
                h-[17px]
                w-[17px]
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[#cfd5da]
                transition-colors
                peer-checked:border-accent
              "
            >
              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-accent
                  opacity-0
                  transition-opacity
                  peer-checked:opacity-100
                "
              />
            </span>

            <span className="text-sm text-[#66717d]">
              Все товары
            </span>
          </label>

          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-2.5
              rounded-lg
              px-2.5
              py-2
              transition-colors
              hover:bg-[#f4f5f7]
            "
          >
            <input
              type="radio"
              name="stock"
              checked={!!inStock}
              onChange={() =>
                router.push(
                  buildHref({
                    inStock: true,
                  }),
                )
              }
              className="peer sr-only"
            />

            <span
              className="
                flex
                h-[17px]
                w-[17px]
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[#cfd5da]
                transition-colors
                peer-checked:border-accent
              "
            >
              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-accent
                  opacity-0
                  transition-opacity
                  peer-checked:opacity-100
                "
              />
            </span>

            <span className="text-sm text-[#66717d]">
              Только в наличии
            </span>
          </label>
        </div>
      </div>

      {/* =====================================================
          ДИНАМИЧЕСКИЕ АТРИБУТЫ
      ===================================================== */}

      {attributeOptions.map((attr) => (
        <div
          key={attr.key}
          className="
            border-t
            border-[#e5e8eb]
            py-5
          "
        >
          <SectionTitle>
            {attr.label}
            {attr.fieldType === "number" &&
              attr.unit &&
              `, ${attr.unit}`}
          </SectionTitle>

          {attr.options.length > 0 && (
            <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
              {attr.options.map((option) => {
                const checked = (
                  attrValues[attr.key] ?? []
                ).includes(option);

                return (
                  <label
                    key={option}
                    className="
                      flex
                      cursor-pointer
                      items-center
                      gap-2.5
                      rounded-lg
                      px-2.5
                      py-2
                      transition-colors
                      hover:bg-[#f4f5f7]
                    "
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleAttrValue(
                          attr.key,
                          option,
                        )
                      }
                      className="sr-only"
                    />

                    <span
                      className={`
                        flex
                        h-[17px]
                        w-[17px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-[5px]
                        border
                        transition-colors
                        ${
                          checked
                            ? "border-accent bg-accent"
                            : "border-[#cfd5da] bg-white"
                        }
                      `}
                    >
                      {checked && (
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          className="h-3 w-3 text-white"
                        >
                          <path
                            d="M3 8l3 3 7-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>

                    <span
                      className={`
                        min-w-0
                        text-sm
                        ${
                          checked
                            ? "font-medium text-[#28313d]"
                            : "text-[#66717d]"
                        }
                      `}
                    >
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}