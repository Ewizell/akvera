import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface HomeCategoryTileItem {
  slug: string;
  name: string;
  href: string;
  productCount: number;
  imageUrl?: string | null;
}

function pluralizeModels(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod100 >= 11 && mod100 <= 14) return "моделей";
  if (mod10 === 1) return "модель";
  if (mod10 >= 2 && mod10 <= 4) return "модели";

  return "моделей";
}

export default function HomeCategoryTileGrid({
  items,
}: {
  items: HomeCategoryTileItem[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => {
        const isFeatured = index === 0;

        return (
          <Link
            key={item.slug}
            href={item.href}
            className={[
              "group relative overflow-hidden rounded-2xl bg-[#28313d]",
              isFeatured
                ? "min-h-[360px] sm:col-span-2 lg:row-span-2"
                : "min-h-[175px]",
            ].join(" ")}
          >
            {/* Изображение */}
            {item.imageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: `url(${item.imageUrl})`,
                }}
              />
            ) : (
              // Плейсхолдер, если у категории нет картинки
              <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent-end" />
            )}

            {/* Затемнение */}
            <div
              className={[
                "absolute inset-0 transition-opacity duration-300",
                isFeatured
                  ? "bg-gradient-to-t from-[#18212b]/90 via-[#18212b]/25 to-[#18212b]/10"
                  : "bg-gradient-to-t from-[#18212b]/85 via-[#18212b]/20 to-transparent",
              ].join(" ")}
            />

            {/* Контент */}
            <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
              {/* Стрелка */}
              <div className="flex justify-end">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-white/20">
                  <ArrowUpRight
                    size={17}
                    strokeWidth={1.8}
                  />
                </span>
              </div>

              {/* Информация */}
              <div>
                <h3
                  className={[
                    "max-w-[360px] font-medium leading-[1.15] text-white",
                    isFeatured
                      ? "text-2xl sm:text-3xl"
                      : "text-lg",
                  ].join(" ")}
                >
                  {item.name}
                </h3>

                <p
                  className={[
                    "mt-2 font-normal text-white/60",
                    isFeatured ? "text-sm" : "text-xs",
                  ].join(" ")}
                >
                  {item.productCount.toLocaleString("ru-RU")}{" "}
                  {pluralizeModels(item.productCount)}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}