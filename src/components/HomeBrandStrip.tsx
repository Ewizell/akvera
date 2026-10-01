import Image from "next/image";
import Link from "next/link";

export type HomeBrandItem = { id: string; slug: string; name: string; logoUrl: string | null };

export default function HomeBrandStrip({ items }: { items: HomeBrandItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
      {items.map((b) => (
        <Link
          key={b.id}
          href={`/brands/${b.slug}`}
          className="group flex h-24 items-center justify-center rounded-2xl border border-[#e9e9e9] bg-white p-4 transition-all hover:border-accent hover:shadow-md"
        >
          {b.logoUrl ? (
            <div className="relative h-full w-full transition-transform duration-300 group-hover:scale-105">
              <Image src={b.logoUrl} alt={b.name} fill className="object-contain" sizes="160px" />
            </div>
          ) : (
            <span className="text-sm font-semibold text-[#969393]">{b.name}</span>
          )}
        </Link>
      ))}
    </div>
  );
}