import Link from "next/link";

export interface CategoryTileItem {
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

export default function CategoryTileGrid({ items }: { items: CategoryTileItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={item.href}
          className="group relative flex h-[260px] flex-col justify-between overflow-hidden rounded-2xl p-6"
        >
          {item.imageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            />
          ) : (
            // Плейсхолдер, если у категории нет фото
            <div className="absolute inset-0 bg-gradient-to-br from-[#179146] to-[#0f172a]">
              <svg
                className="absolute right-4 bottom-4 h-16 w-16 text-white/10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 16l4.5-6 4 5 3-4L20 16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-[#0f172a]/30" />

          <div className="relative flex items-start justify-between gap-3">
            <h3 className="max-w-[220px] text-[20px] font-bold leading-normal text-white [word-break:break-word]">
              {item.name}
            </h3>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white/[0.13] transition-colors group-hover:bg-white/25">
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

          <p className="relative text-[13px] text-white/90">
            {item.productCount} {pluralizeModels(item.productCount)}
          </p>
        </Link>
      ))}
    </div>
  );
}