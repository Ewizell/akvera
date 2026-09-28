"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BrandTile, { type BrandTileItem } from "@/components/BrandTile";

const GAP = 24; // gap-6

export default function BrandSlider({ items }: { items: BrandTileItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
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
    el.scrollBy({ left: direction * (el.clientWidth + GAP), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={update}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <BrandTile
            key={item.id}
            item={item}
            size="compact"
            className="shrink-0 snap-start w-[calc((100%_-_24px)/2)] sm:w-[calc((100%_-_48px)/3)] lg:w-[calc((100%_-_72px)/4)] xl:w-[calc((100%_-_120px)/6)]"
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="Назад"
        onClick={() => scrollByPage(-1)}
        className={`absolute -left-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-opacity hover:bg-[#f3f4f6] sm:flex ${
          canPrev ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="#1c2126" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Вперёд"
        onClick={() => scrollByPage(1)}
        className={`absolute -right-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-opacity hover:bg-[#f3f4f6] sm:flex ${
          canNext ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="#1c2126" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}