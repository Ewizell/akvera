"use client";

import { useRef } from "react";
import Link from "next/link";
import HomeProductCard, {
  type HomeCarouselVariant,
} from "./HomeProductCard";
import { ArrowRight } from "lucide-react";

export type { HomeCarouselVariant };

function ChevronIcon({
  direction,
}: {
  direction: "left" | "right";
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={direction === "left" ? "rotate-180" : ""}
    >
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

export function HomeProductCarousel({
  title,
  variants,
  href,
  linkLabel = "Смотреть все",
}: {
  title: string;
  variants: HomeCarouselVariant[];
  href?: string;
  linkLabel?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (variants.length === 0) return null;

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;

    const amount = scrollRef.current.clientWidth;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="mt-10 sm:mt-16 lg:mt-20">
      {/* Заголовок */}
      <div className="mb-4 flex items-center justify-between gap-6 sm:mb-7">
        <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#28313d] sm:text-[30px] lg:text-[34px]">
          {title}
        </h2>

        {href && (
          <Link
            href={href}
            className="
              group
              hidden h-11 shrink-0 items-center sm:flex
              gap-3
              rounded-xl
              bg-[#f4f5f7]
              px-2
              pl-4
              text-sm font-medium
              text-[#28313d]
              transition-all duration-300
              hover:bg-gradient-to-br
              hover:from-accent
              hover:to-accent-end
              hover:text-white
            "
          >
            <span>{linkLabel}</span>

            <span
              className="
                flex h-8 w-8
                items-center justify-center
                rounded-lg
                bg-[#e5e7eb]
                text-[#28313d]
                transition-all duration-300
                group-hover:bg-white/15
                group-hover:text-white
              "
            >
              <ArrowRight
                size={16}
                strokeWidth={1.8}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
              />
            </span>
          </Link>
        )}
      </div>

      {/* Карусель */}
<div className="relative">
  {/* Левая кнопка */}
  <button
    type="button"
    onClick={() => scroll("left")}
    aria-label="Прокрутить влево"
    className="
      group
      absolute
      left-2
      top-1/2
      z-50
      hidden
      md:flex
      h-10
      w-10
      -translate-y-1/2
      cursor-pointer
      items-center
      justify-center
      rounded-xl
      bg-[#f4f5f7]
      text-[#28313d]
      shadow-sm
      transition-all
      duration-300
      hover:bg-gradient-to-br
      hover:from-accent
      hover:to-accent-end
      hover:text-white
      hover:shadow-md
    "
  >
    <ChevronIcon direction="left" />
  </button>

  {/* Правая кнопка */}
  <button
    type="button"
    onClick={() => scroll("right")}
    aria-label="Прокрутить вправо"
    className="
      group
      absolute
      right-2
      top-1/2
      z-50
      flex
      h-10
      w-10
      -translate-y-1/2
      cursor-pointer
      items-center
      justify-center
      rounded-xl
      bg-[#f4f5f7]
      text-[#28313d]
      shadow-sm
      transition-all
      duration-300
      hover:bg-gradient-to-br
      hover:from-accent
      hover:to-accent-end
      hover:text-white
      hover:shadow-md
    "
  >
    <ChevronIcon direction="right" />
  </button>

  {/* Карточки */}
  <div
    ref={scrollRef}
    className="
      -mx-5
      -my-4
      flex
      snap-x
      snap-mandatory
      items-stretch
      gap-3
      overflow-x-auto
      overscroll-x-contain
      scroll-smooth
      scroll-px-5
      px-5
      py-4
      sm:-mx-8
      sm:gap-4
      sm:scroll-px-8
      sm:px-8
      lg:mx-0
      lg:gap-6
      lg:scroll-px-1
      lg:px-1
      [&::-webkit-scrollbar]:hidden
      [-ms-overflow-style:none]
      [scrollbar-width:none]
    "
  >
    {variants.map((variant) => (
      <div
        key={variant.id}
        className="
          w-[calc((100%-24px)/2.2)]
          shrink-0
          snap-start
          cursor-default
          sm:w-[calc((100%-32px)/3)]
          lg:w-[calc((100%-72px)/4)]
          xl:w-[calc((100%-96px)/5)]
        "
      >
        <HomeProductCard variant={variant} />
      </div>
    ))}
  </div>
</div>

      {/* Телефон: кнопка на всю ширину под каруселью */}
      {href && (
        <Link
          href={href}
          className="
            group
            mt-4
            flex h-12 w-full items-center justify-between
            gap-3
            rounded-xl
            bg-white
            px-2
            pl-4
            text-sm font-medium
            text-[#28313d]
            transition-all duration-300
            hover:bg-gradient-to-br
            hover:from-accent
            hover:to-accent-end
            hover:text-white
            sm:hidden
          "
        >
          <span>{linkLabel}</span>

          <span
            className="
              flex h-8 w-8
              items-center justify-center
              rounded-lg
              bg-[#e5e7eb]
              text-[#28313d]
              transition-all duration-300
              group-hover:bg-white/15
              group-hover:text-white
            "
          >
            <ArrowRight size={16} strokeWidth={1.8} />
          </span>
        </Link>
      )}
    </section>
  );
}