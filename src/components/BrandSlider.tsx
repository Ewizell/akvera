"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

export interface BrandSliderItem {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  productCount: number;
}

function pluralizeModels(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod100 >= 11 && mod100 <= 14) return "моделей";
  if (mod10 === 1) return "модель";
  if (mod10 >= 2 && mod10 <= 4) return "модели";

  return "моделей";
}

const GAP = 12;

export default function BrandSlider({
  items,
}: {
  items: BrandSliderItem[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;

    if (!el) return;

    setCanPrev(el.scrollLeft > 4);
    setCanNext(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    );
  }, []);

  useEffect(() => {
    update();

    const el = trackRef.current;

    if (!el) return;

    const observer = new ResizeObserver(update);

    observer.observe(el);

    return () => observer.disconnect();
  }, [update, items.length]);

  function scrollByPage(direction: 1 | -1) {
    const el = trackRef.current;

    if (!el) return;

    el.scrollBy({
      left: direction * (el.clientWidth + GAP),
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={update}
        className="
          flex
          gap-3
          overflow-x-auto
          snap-x
          snap-mandatory
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/brands/${item.slug}`}
            className={[
              "group relative flex h-[210px] shrink-0 snap-start",
              "w-[calc((100%-12px)/2)]",
              "overflow-hidden rounded-2xl",
              "bg-[#179146]",
              "sm:w-[calc((100%-24px)/3)]",
              "lg:w-[calc((100%-36px)/4)]",
              "xl:w-[calc((100%-60px)/6)]",
            ].join(" ")}
          >
            {/* Фотография */}
            {item.logoUrl ? (
              <div
                className="
                  absolute inset-0
                  bg-cover bg-center
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-105
                "
                style={{
                  backgroundImage: `url(${item.logoUrl})`,
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#179146] to-[#0f172a]" />
            )}

            {/* Затемнение */}
            <div className="absolute inset-0 bg-[#0f172a]/30" />

            {/* Нижний градиент */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f172a]/80 to-transparent" />

            {/* Контент */}
            <div className="relative flex h-full w-full flex-col justify-between p-5">
              <div className="flex justify-end">
                <span className="
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-2xl
                  bg-white/[0.13]
                  text-white
                  backdrop-blur-sm
                  transition-all
                  duration-300
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                  group-hover:bg-white/25
                ">
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.8}
                  />
                </span>
              </div>

              <div className="mt-auto">
                <h3 className="max-w-[180px] text-lg font-medium leading-tight text-white">
                  {item.name}
                </h3>

                <p className="mt-1.5 text-xs text-white/65">
                  {item.productCount.toLocaleString("ru-RU")}{" "}
                  {pluralizeModels(item.productCount)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Назад */}
      <button
        type="button"
        aria-label="Предыдущие бренды"
        onClick={() => scrollByPage(-1)}
        className={[
          "group",
          "absolute -left-5 top-1/2 z-10",
          "hidden h-10 w-10",
          "-translate-y-1/2",
          "items-center justify-center",
          "rounded-xl",
          "bg-[#f4f5f7]",
          "text-[#28313d]",
          "shadow-sm",
          "transition-all duration-300",
          "hover:bg-gradient-to-br",
          "hover:from-[#179146]",
          "hover:to-[#0f172a]",
          "hover:text-white",
          "hover:shadow-md",
          "sm:flex",
          canPrev
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <ArrowLeft
          size={17}
          strokeWidth={1.7}
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
      </button>

      {/* Вперёд */}
      <button
        type="button"
        aria-label="Следующие бренды"
        onClick={() => scrollByPage(1)}
        className={[
          "group",
          "absolute -right-5 top-1/2 z-10",
          "hidden h-10 w-10",
          "-translate-y-1/2",
          "items-center justify-center",
          "rounded-xl",
          "bg-[#f4f5f7]",
          "text-[#28313d]",
          "shadow-sm",
          "transition-all duration-300",
          "hover:bg-gradient-to-br",
          "hover:from-[#179146]",
          "hover:to-[#0f172a]",
          "hover:text-white",
          "hover:shadow-md",
          "sm:flex",
          canNext
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <ArrowRight
          size={17}
          strokeWidth={1.7}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </button>
    </div>
  );
}
