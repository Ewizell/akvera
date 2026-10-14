import { prisma } from "@/lib/prisma";
import BrandTileGrid from "@/components/BrandTileGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { buildCollectionJsonLd, buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Бренды оборудования — производители в каталоге | Akvera",
  description:
    "Все бренды оборудования в каталоге Akvera. Выбирайте технику проверенных производителей для вашего бизнеса.",
  path: "/brands",
});

export default async function BrandsCatalogPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Бренды" },
  ];

  const brandsWithProducts = brands.filter((b) => b._count.products > 0);

  const jsonLd = buildCollectionJsonLd({
    path: "/brands",
    name: "Бренды оборудования",
    crumbs,
    itemPaths: brandsWithProducts.map((b) => `/brands/${b.slug}`),
    totalCount: brandsWithProducts.length,
  });

  return (
    <main className="max-w-[1440px] mx-auto px-20 py-10">
      <JsonLd data={jsonLd} />

      <Breadcrumbs items={crumbs} />

      <h1 className="mt-3 text-[36px] font-bold leading-[1.2] text-[#0f172a]">Бренды</h1>

      <p className="mt-3 mb-8 max-w-3xl text-sm leading-6 text-[#66717d]">
        В каталоге Akvera представлено оборудование брендов:{" "}
        {brandsWithProducts.map((b) => b.name).join(", ")}. Выберите бренд,
        чтобы посмотреть его категории, цены и характеристики моделей.
      </p>

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