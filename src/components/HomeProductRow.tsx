import Image from "next/image";
import Link from "next/link";
import type { CatalogCard } from "@/lib/catalog-query";

export default function HomeProductRow({ cards }: { cards: CatalogCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={`/product/${card.slug}`}
          className="group flex flex-col rounded-2xl border border-[#e9e9e9] bg-white p-4 transition-shadow hover:shadow-lg"
        >
          <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f3f4f6]">
            {card.image ? (
              <Image
                src={card.image}
                alt={card.name}
                fill
                className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-[#969393]">Нет фото</div>
            )}
          </div>

          {card.brandName && <p className="mt-3 text-xs text-[#969393]">{card.brandName}</p>}
          <p className="mt-1 line-clamp-2 text-sm font-medium text-[#1c2126]">
            {card.name}
            {card.variantName ? ` ${card.variantName}` : ""}
          </p>
          <p className="mt-auto pt-3 text-base font-bold text-[#1c2126]">
            {card.price !== null ? `${card.price.toLocaleString("ru-RU")} ₽` : "Цена по запросу"}
          </p>
        </Link>
      ))}
    </div>
  );
}