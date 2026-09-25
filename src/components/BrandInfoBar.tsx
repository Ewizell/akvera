import Image from "next/image";
import Link from "next/link";

export default function BrandInfoBar({
  name,
  description,
  logoUrl,
}: {
  name: string;
  description: string | null;
  logoUrl: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-8 pb-6 mb-6 border-b border-[#d9d9d9]">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {logoUrl && (
          <div className="relative w-12 h-12 shrink-0">
            <Image src={logoUrl} alt={name} fill className="object-contain" />
          </div>
        )}
        {description && (
          <div
            className="prose prose-sm max-w-2xl text-[#475569] text-sm [&_p]:m-0"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </div>

      <Link
        href="/brands"
        className="shrink-0 rounded-full border border-[#179146] px-5 py-2 text-sm font-semibold text-[#179146] hover:bg-[#179146] hover:text-white transition-colors whitespace-nowrap"
      >
        Все бренды
      </Link>
    </div>
  );
}