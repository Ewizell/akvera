import { prisma } from "@/lib/prisma";
import BrandTileGrid from "@/components/BrandTileGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Бренды",
  description:
    "Все бренды оборудования в каталоге Akvera. Выбирайте технику проверенных производителей для вашего бизнеса.",
};

export default async function BrandsCatalogPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Бренды" },
  ];

    return (
    <main className="max-w-[1440px] mx-auto px-20 py-10">
      <Breadcrumbs items={crumbs} />

      <h1 className="mt-3 mb-8 text-[36px] font-bold leading-[1.2] text-[#0f172a]">Бренды</h1>

      {brands.length === 0 ? (
        <p className="text-gray-500">Бренды пока не добавлены.</p>
      ) : (
        <BrandTileGrid
          items={brands.map((b) => ({
            id: b.id,
            slug: b.slug,
            name: b.name,
            logoUrl: b.logoUrl,
            productCount: b._count.products,
          }))}
        />
      )}
    </main>
  );
}