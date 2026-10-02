"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

export type HomeStat = {
  value: string;
  label: string;
};

export type HomeBrand = {
  id: string;
  name: string;
  slug: string;
};

export default function HomeHero({
  stats,
  brands = [],
}: {
  stats: HomeStat[];
  brands?: HomeBrand[];
}) {
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

        const mouseX = (x - 0.5) * 2;
        const mouseY = (y - 0.5) * 2;

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
      className="
        relative
        min-h-[560px]
        w-full
        overflow-hidden
        bg-[#28313d]
      "
    >
      {/* Фоновое изображение */}
      <div
        ref={backgroundRef}
        className="
          absolute
          -inset-[2%]
          bg-cover
          bg-[center_center]
          will-change-transform
        "
        style={{
          backgroundImage: "url('/hero-background.jpg')",
          transition:
            "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      {/* Основное затемнение */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-[#18212b]/95
          via-[#18212b]/75
          to-[#18212b]/25

          max-sm:bg-gradient-to-b
          max-sm:from-[#18212b]/95
          max-sm:via-[#18212b]/75
          max-sm:to-[#18212b]/55
        "
      />

      {/* Нижнее затемнение */}
      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-48
          bg-gradient-to-t
          from-[#18212b]/60
          to-transparent

          max-sm:h-64
          max-sm:from-[#18212b]/85
        "
      />

      {/* Виньетка */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          shadow-[inset_0_0_120px_rgba(24,33,43,0.35)]
        "
      />

      {/* Контент */}
      <div
        className="
          relative
          mx-auto
          flex
          min-h-[560px]
          max-w-[1440px]
          items-center
          px-5
          py-10

          sm:px-10
          sm:py-12

          lg:px-16
        "
      >
        <div
          className="
            w-full
            max-w-[700px]

            max-sm:pt-8
          "
        >
          {/* Заголовок */}
          <h1
            className="
              max-w-[680px]
              text-[32px]
              font-semibold
              leading-[1.04]
              tracking-[-0.035em]
              text-white

              min-[400px]:text-[38px]

              sm:text-[52px]
              sm:leading-[1.06]

              lg:text-[60px]
            "
          >
            Оборудование для
            <br />
            инженерных систем
          </h1>

          {/* Описание */}
          <p
            className="
              mt-5
              max-w-[560px]
              text-[15px]
              leading-6
              text-white/75

              sm:mt-6
              sm:text-lg
              sm:leading-7
            "
          >
            Комплексные поставки оборудования
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            для отопления, водоснабжения и водоотведения.
          </p>

          {/* Навигационные кнопки */}
          <div
            className="
              mt-7
              flex
              w-full
              flex-col
              gap-2.5

              sm:mt-8
              sm:flex-row
              sm:flex-wrap
              sm:gap-3
            "
          >
            {/* Каталог */}
            <Link
              href="/catalog"
              className="
                group/button
                relative
                flex
                h-14
                w-full
                items-center
                justify-between
                overflow-hidden
                rounded-xl

                sm:min-w-[220px]
                sm:w-auto
              "
            >
              <div
                className="
                  absolute
                  inset-0
                  bg-cover
                  bg-center
                  transition-transform
                  duration-500
                  group-hover/button:scale-105
                "
                style={{
                  backgroundImage:
                    "url('/images/home/catalog-button.jpg')",
                }}
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-[#18212b]/60
                  transition-colors
                  duration-300
                  group-hover/button:bg-[#18212b]/45
                "
              />

              <span
                className="
                  relative
                  px-5
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Каталог оборудования
              </span>

              <span
                className="
                  relative
                  mr-2
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-white/15
                  text-white
                  backdrop-blur-sm
                  transition-transform
                  duration-200
                  group-hover/button:translate-x-0.5
                "
              >
                <ArrowRight size={17} />
              </span>
            </Link>

            {/* Бренды */}
            <Link
              href="/brands"
              className="
                group/button
                relative
                flex
                h-14
                w-full
                items-center
                justify-between
                overflow-hidden
                rounded-xl

                sm:min-w-[170px]
                sm:w-auto
              "
            >
              <div
                className="
                  absolute
                  inset-0
                  bg-cover
                  bg-center
                  transition-transform
                  duration-500
                  group-hover/button:scale-105
                "
                style={{
                  backgroundImage:
                    "url('/images/home/brands-button.jpg')",
                }}
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-[#18212b]/60
                  transition-colors
                  duration-300
                  group-hover/button:bg-[#18212b]/45
                "
              />

              <span
                className="
                  relative
                  px-5
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Бренды
              </span>

              <span
                className="
                  relative
                  mr-2
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-white/15
                  text-white
                  backdrop-blur-sm
                  transition-transform
                  duration-200
                  group-hover/button:translate-x-0.5
                "
              >
                <ArrowRight size={17} />
              </span>
            </Link>
          </div>

          {/* Слайдер брендов */}
          {brands.length > 0 && (
            <div
              className="
                brands-marquee
                mt-6
                w-full
                max-w-[620px]
                overflow-hidden
                rounded-xl
                border
                border-white/10
                bg-white/[0.06]
                py-2.5
                backdrop-blur-md
                [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]

                sm:mt-8
                sm:py-3
              "
            >
              <div className="brands-track flex w-max items-center">
                {[...brands, ...brands].map((brand, index) => (
                  <Link
                    key={`${brand.id}-${index}`}
                    href={`/brands/${brand.slug}`}
                    aria-hidden={index >= brands.length}
                    tabIndex={
                      index >= brands.length ? -1 : undefined
                    }
                    className="
                      flex
                      h-8
                      shrink-0
                      items-center
                      whitespace-nowrap
                      px-5
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.12em]
                      text-white/70
                      transition-colors
                      duration-200
                      hover:text-white

                      sm:px-8
                      sm:text-sm
                      sm:tracking-wider
                    "
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Статистика */}
          {stats.length > 0 && (
            <div
              className="
                mt-7
                border-t
                border-white/15
                pt-4

                sm:mt-10
                sm:pt-5
              "
            >
              <dl
                className="
                  grid
                  grid-cols-3
                  gap-x-3
                  gap-y-4

                  sm:flex
                  sm:flex-wrap
                  sm:items-center
                  sm:gap-y-3
                "
              >
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={[
                      // Мобильный вид: значение сверху, подпись снизу
                      "flex min-w-0 flex-col gap-1",

                      // Десктопный вид: в одну строку
                      "sm:flex-row sm:items-baseline sm:gap-2 sm:pr-6",

                      index > 0
                        ? "sm:border-l sm:border-white/15 sm:pl-6"
                        : "",
                    ].join(" ")}
                  >
                    <dt
                      className="
                        shrink-0
                        text-xl
                        font-semibold
                        leading-none
                        tracking-[-0.02em]
                        text-white

                        sm:text-2xl
                      "
                    >
                      {stat.value}
                    </dt>

                    <dd
                      className="
                        min-w-0
                        text-xs
                        leading-4
                        text-white/55

                        sm:text-sm
                      "
                    >
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