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
    <section className="mt-20">
      {/* Заголовок */}
      <div className="mb-7 flex items-center justify-between gap-6">
        <h2 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#28313d] sm:text-[34px]">
          {title}
        </h2>

        {href && (
          <Link
            href={href}
            className="
              group
              flex h-11 shrink-0 items-center
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
        {/* Левая стрелка */}
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Прокрутить влево"
          className="
            group
            absolute
            left-[-16px]
            top-1/2
            z-10
            flex
            h-10
            w-10
            -translate-y-1/2
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

        {/* Правая стрелка */}
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Прокрутить вправо"
          className="
            group
            absolute
            right-[-16px]
            top-1/2
            z-10
            flex
            h-10
            w-10
            -translate-y-1/2
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
            flex
            items-stretch
            gap-6
            overflow-x-auto
            scroll-smooth
            snap-x
            snap-mandatory
            pb-2
            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
        >
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="
                w-[calc((100%-96px)/5)]
                shrink-0
                snap-start
              "
            >
              <HomeProductCard variant={variant} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}