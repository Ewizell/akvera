"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function ScrollRow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{
    width: number;
    left: number;
  } | null>(null);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const { scrollLeft, clientWidth, scrollWidth } = el;

    // Всё помещается — индикатор не нужен
    if (scrollWidth <= clientWidth + 1) {
      setThumb(null);
      return;
    }

    const width = Math.max((clientWidth / scrollWidth) * 100, 15);
    const maxScroll = scrollWidth - clientWidth;
    const left = (scrollLeft / maxScroll) * (100 - width);

    setThumb({ width, left });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Прокручиваем к активному пункту (сортировка / выбранный тег)
    const active = el.querySelector<HTMLElement>(
      '[aria-current="page"], [aria-pressed="true"]',
    );
    if (active) {
      el.scrollLeft =
        active.offsetLeft - (el.clientWidth - active.offsetWidth) / 2;
    }
    update();

    // Следим и за полосой, и за каждым чипом: их ширина меняется
    // после загрузки шрифта, когда сама полоса не меняет размер
    const observer = new ResizeObserver(update);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));

    document.fonts?.ready.then(update);

    return () => observer.disconnect();
  }, [update]);

  return (
    <div className="min-w-0">
      <div
        ref={ref}
        onScroll={update}
        className={`flex items-center overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {children}
      </div>

      {thumb && (
        <div
          aria-hidden="true"
          className="pointer-events-none relative mx-1 mt-1.5 h-1 rounded-full bg-[#cfd4d9] sm:hidden"
        >
          <div
            className="absolute inset-y-0 rounded-full bg-accent"
            style={{
              width: `${thumb.width}%`,
              left: `${thumb.left}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}