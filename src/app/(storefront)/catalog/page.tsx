import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import CategoryTileGrid from "@/components/CategoryTileGrid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Каталог",
  description:
    "Каталог оборудования Akvera: все категории и подкатегории товаров.",
};

export default async function CatalogPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  const catalogJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Каталог",
    url: `${siteUrl}/catalog`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: categories.map((cat, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/category/${cat.slug}`,
        name: cat.name,
      })),
    },
  };

  const tileItems = categories.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    href: `/category/${cat.slug}`,
    productCount: cat._count.products,
    imageUrl: cat.imageUrl,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogJsonLd) }}
      />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <nav className="mb-5 flex items-center gap-3 text-[14px] font-semibold uppercase tracking-[2px] text-[#179146]">
          <span>Главная</span>
          <span>/</span>
        </nav>

        <div className="mb-8 flex items-end justify-between">
          <h1 className="text-[36px] font-bold leading-[1.2] text-[#0f172a]">Каталог</h1>
          <Link href="/catalog/all" className="text-sm text-blue-600 hover:underline">
            Показать все товары →
          </Link>
        </div>

        {categories.length > 0 ? (
          <CategoryTileGrid items={tileItems} />
        ) : (
          <p className="text-gray-500 text-center py-20">Категории пока не добавлены</p>
        )}
      </main>
    </>
  );
}