"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

export type HomeStat = {
  value: string;
  label: string;
};

export default function HomeHero({ stats }: { stats: HomeStat[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const background = backgroundRef.current;

    if (!hero || !background) {
      return;
    }

    // На устройствах без мыши эффект не нужен
    if (window.matchMedia("(hover: none)").matches) {
      return;
    }

    let frame = 0;

    const handlePointerMove = (event: PointerEvent) => {
      if (frame) {
        cancelAnimationFrame(frame);
      }

      frame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        // Координаты от -1 до 1
        const mouseX = (x - 0.5) * 2;
        const mouseY = (y - 0.5) * 2;

        // Небольшое смещение фотографии
        const backgroundX = mouseX * -14;
        const backgroundY = mouseY * -10;

        background.style.transform = `
          translate3d(${backgroundX}px, ${backgroundY}px, 0)
          scale(1.04)
        `;
      });
    };

    const handlePointerLeave = () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }

      background.style.transform =
        "translate3d(0, 0, 0) scale(1.04)";
    };

    hero.addEventListener("pointermove", handlePointerMove);
    hero.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }

      hero.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      hero.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[520px] w-full overflow-hidden bg-[#28313d] sm:min-h-[560px]"
    >
      {/* Фоновое изображение — единственный анимируемый слой */}
      <div
        ref={backgroundRef}
        className="absolute -inset-[2%] bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: "url('/light.jpg')",
          transition:
            "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      {/* Затемнение — полностью статичное */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#18212b]/95 via-[#18212b]/70 to-[#18212b]/10" />

      {/* Затемнение снизу — статичное */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#18212b]/60 to-transparent" />

      {/* Виньетка — статичная */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(24,33,43,0.35)]" />

      {/* Контент — полностью статичный */}
      <div className="relative mx-auto flex min-h-[520px] max-w-[1440px] items-center px-6 py-12 sm:min-h-[560px] sm:px-10 lg:px-16">
        <div className="max-w-[700px]">
          {/* Заголовок */}
          <h1 className="max-w-[680px] text-[40px] font-semibold leading-[1.06] tracking-[-0.035em] text-white sm:text-[52px] lg:text-[60px]">
            Оборудование для
            <br />
            инженерных систем
          </h1>

          {/* Описание */}
          <p className="mt-6 max-w-[560px] text-base leading-7 text-white/75 sm:text-lg">
            Комплексные поставки оборудования
            <br />
            для отопления, водоснабжения и водоотведения.
          </p>

          {/* Навигационные кнопки */}
          <div className="mt-8 flex flex-wrap gap-3">
            {/* Каталог */}
            <Link
              href="/catalog"
              className="group/button relative flex h-14 min-w-[220px] items-center justify-between overflow-hidden rounded-xl"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/button:scale-105"
                style={{
                  backgroundImage:
                    "url('/images/home/catalog-button.jpg')",
                }}
              />

              <div className="absolute inset-0 bg-[#18212b]/60 transition-colors duration-300 group-hover/button:bg-[#18212b]/45" />

              <span className="relative px-5 text-sm font-semibold text-white">
                Каталог оборудования
              </span>

              <span className="relative mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm transition-transform duration-200 group-hover/button:translate-x-0.5">
                <ArrowRight size={17} />
              </span>
            </Link>

            {/* Бренды */}
            <Link
              href="/brands"
              className="group/button relative flex h-14 min-w-[170px] items-center justify-between overflow-hidden rounded-xl"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/button:scale-105"
                style={{
                  backgroundImage:
                    "url('/images/home/brands-button.jpg')",
                }}
              />

              <div className="absolute inset-0 bg-[#18212b]/60 transition-colors duration-300 group-hover/button:bg-[#18212b]/45" />

              <span className="relative px-5 text-sm font-semibold text-white">
                Бренды
              </span>

              <span className="relative mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm transition-transform duration-200 group-hover/button:translate-x-0.5">
                <ArrowRight size={17} />
              </span>
            </Link>
          </div>

          {/* Статистика каталога */}
          {stats.length > 0 && (
            <div className="mt-10 border-t border-white/15 pt-5">
              <dl className="flex flex-wrap items-center gap-y-3">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={[
                      "flex items-baseline gap-2 pr-6",
                      index > 0
                        ? "border-l border-white/15 pl-6"
                        : "",
                    ].join(" ")}
                  >
                    <dt className="text-2xl font-semibold leading-none tracking-[-0.02em] text-white">
                      {stat.value}
                    </dt>

                    <dd className="text-sm text-white/55">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}