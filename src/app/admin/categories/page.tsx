import { prisma } from "@/lib/prisma";
import CategoryList from "@/components/CategoryList";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      attributes: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f8fa] to-[#eef0f3] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8a93a1] shadow-sm ring-1 ring-black/[0.04]">
            Каталог
            <span className="h-1 w-1 rounded-full bg-[#c29e57]" />
            Структура
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#1e2a38]">
            Категории
          </h1>

          <p className="mt-1.5 text-sm text-[#737d8c]">
            Управление структурой каталога и характеристиками товаров
          </p>
        </div>

        <CategoryList categories={categories} />
      </div>
    </main>
  );
}