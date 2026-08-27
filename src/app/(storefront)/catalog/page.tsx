import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CatalogGrid from "@/components/CatalogGrid";
import CatalogPagination from "@/components/CatalogPagination";
import CatalogFilterBar from "@/components/CatalogFilterBar";
import { getCatalogProducts, PAGE_SIZE } from "@/lib/catalog-query";

export const revalidate = 3600; // ISR: обновлять раз в час

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    q?: string;
    page?: string;
    tags?: string;
    sort?: string;
  }>;
}) {
  const { category, brand, q, page: pageParam, tags: tagsParam, sort: sortParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const selectedTagSlugs = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
  const sort = sortParam === "price_asc" || sortParam === "price_desc" || sortParam === "stock" ? sortParam : undefined;

  const [{ cards, totalCount }, categories, brands, activeCategory, activeBrand, allTags] = await Promise.all([
    getCatalogProducts({ category, brand, q, tags: selectedTagSlugs, sort }, page),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: { children: { orderBy: { name: "asc" } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    category ? prisma.category.findUnique({ where: { slug: category } }) : null,
    brand ? prisma.brand.findUnique({ where: { slug: brand } }) : null,
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function withParam(key: "category" | "brand", value: string | null) {
    const params = new URLSearchParams();
    if (key !== "category" && category) params.set("category", category);
    if (key !== "brand" && brand) params.set("brand", brand);
    if (q) params.set("q", q);
    if (value) params.set(key, value);
    const qs = params.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  }

  function pageHref(targetPage: number) {
    return filterHref({}, targetPage);
  }

  function filterHref(
    override: { tags?: string[]; sort?: string },
    targetPage: number = 1
  ) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (q) params.set("q", q);

    const nextTags = override.tags !== undefined ? override.tags : selectedTagSlugs;
    if (nextTags.length > 0) params.set("tags", nextTags.join(","));

    const nextSort = override.sort !== undefined ? override.sort : sort;
    if (nextSort) params.set("sort", nextSort);

    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Категории</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href={withParam("category", null)}
                  className={!category ? "font-medium" : "text-gray-600 hover:underline"}
                >
                  Все категории
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={withParam("category", cat.slug)}
                    className={category === cat.slug ? "font-medium" : "text-gray-600 hover:underline"}
                  >
                    {cat.name}
                  </Link>
                  {cat.children.length > 0 && (
                    <ul className="ml-3 mt-1 space-y-1">
                      {cat.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={withParam("category", child.slug)}
                            className={category === child.slug ? "font-medium" : "text-gray-500 hover:underline"}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {brands.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 mb-2">Бренды</h2>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link
                    href={withParam("brand", null)}
                    className={!brand ? "font-medium" : "text-gray-600 hover:underline"}
                  >
                    Все бренды
                  </Link>
                </li>
                {brands.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={withParam("brand", b.slug)}
                      className={brand === b.slug ? "font-medium" : "text-gray-600 hover:underline"}
                    >
                      {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div>
          <h1 className="text-2xl font-semibold mb-8">
            {q ? `Результаты по запросу «${q}»` : activeCategory?.name ?? activeBrand?.name ?? "Каталог"}
          </h1>

          <CatalogFilterBar
            allTags={allTags}
            selectedTagSlugs={selectedTagSlugs}
            currentSort={sort ?? ""}
            category={category}
            brand={brand}
            q={q}
          />

          <CatalogGrid
            key={`${category ?? ""}|${brand ?? ""}|${q ?? ""}|${selectedTagSlugs.join(",")}|${sort ?? ""}|${page}`}
            products={cards}
            filters={{ category, brand, q, tags: selectedTagSlugs, sort }}
            page={page}
            totalPages={totalPages}
          />

          {totalCount === 0 && (
            <p className="text-gray-500 text-center py-20">
              {q
                ? "По вашему запросу ничего не найдено"
                : activeCategory || activeBrand
                ? "По этому фильтру товаров пока нет"
                : "Товары пока не добавлены"}
            </p>
          )}

          {totalPages > 1 && (
          <CatalogPagination
            currentPage={page}
            totalPages={totalPages}
            category={category}
            brand={brand}
            q={q}
            tags={selectedTagSlugs}
            sort={sort}
          />
          )}
        </div>
      </div>
    </main>
  );
}