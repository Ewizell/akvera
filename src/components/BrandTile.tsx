import Image from "next/image";
import Link from "next/link";

export interface BrandTileItem {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  productCount: number;
}

function pluralizeProducts(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return "товаров";
  if (mod10 === 1) return "товар";
  if (mod10 >= 2 && mod10 <= 4) return "товара";
  return "товаров";
}

export default function BrandTile({
  item,
  className = "",
  size = "default",
}: {
  item: BrandTileItem;
  className?: string;
  size?: "default" | "compact";
}) {
  const compact = size === "compact";

  return (
    <Link
      href={`/brands/${item.slug}`}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl ${
        compact ? "h-[180px] p-4" : "h-[260px] p-6"
      } ${className}`}
    >
      {item.logoUrl ? (
        <Image
          src={item.logoUrl}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={compact ? "(max-width: 640px) 50vw, 200px" : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"}
        />
      ) : (
        // Плейсхолдер, если у бренда нет картинки
        <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent-end" />
      )}
      <div className="absolute inset-0 bg-[#0f172a]/30" />

      <div className="relative flex items-start justify-between gap-2">
        <h3
          className={`font-semibold leading-normal text-white [word-break:break-word] ${
            compact ? "max-w-[120px] text-sm" : "max-w-[220px] text-[16px]"
          }`}
        >
          {item.name}
        </h3>
        <span
          className={`flex shrink-0 items-center justify-center rounded-2xl bg-white/[0.13] transition-colors group-hover:bg-white/25 ${
            compact ? "h-7 w-7" : "h-8 w-8"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <p className={`relative text-white/90 ${compact ? "text-xs" : "text-[13px]"}`}>
        {item.productCount} {pluralizeProducts(item.productCount)}
      </p>
    </Link>
  );
}