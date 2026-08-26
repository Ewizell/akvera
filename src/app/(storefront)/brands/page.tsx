import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const revalidate = 3600;

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
    <main className="max-w-6xl mx-auto px-4 py-10">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-2xl font-semibold mb-8">Бренды</h1>

      {brands.length === 0 ? (
        <p className="text-gray-500">Бренды пока не добавлены.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="block group border rounded-lg p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="relative w-full h-16 mb-3">
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    sizes="200px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                    {brand.name}
                  </div>
                )}
              </div>
              <p className="font-medium">{brand.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {brand._count.products} {brand._count.products === 1 ? "товар" : "товаров"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}