import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 3600;

export default async function CatalogPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: {
      children: {
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      },
      _count: { select: { products: true } },
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Каталог</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((cat) => (
          <div key={cat.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/category/${cat.slug}`}
                className="font-medium hover:underline"
              >
                {cat.name}
              </Link>
              {cat.children.length > 0 && (
                <Link
                  href={`/category/${cat.slug}/all`}
                  className="text-xs text-blue-600 hover:underline shrink-0 ml-2"
                >
                  Все товары →
                </Link>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-2">{cat._count.products} товаров</p>

            {cat.children.length > 0 && (
              <ul className="space-y-1 text-sm">
                {cat.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/category/${cat.slug}/${child.slug}`}
                      className="text-gray-600 hover:underline"
                    >
                      {child.name}
                    </Link>
                    <span className="text-xs text-gray-400 ml-1">
                      ({child._count.products})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-gray-500 text-center py-20">Категории пока не добавлены</p>
      )}
    </main>
  );
}