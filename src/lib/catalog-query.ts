import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 12;

export type CatalogFilters = {
  categoryId?: string; // точное совпадение — лист/родитель-без-детей, либо конкретная подкатегория
  categoryIds?: string[]; // OR — используется для /category/[slug]/all (родитель + все дети)
  brand?: string;
  q?: string;
  tags?: string[]; // slugs, OR-логика
  sort?: "price_asc" | "price_desc" | "stock";
};

export type CatalogCard = {
  id: string;
  variantId: string;
  sku: string;
  slug: string;
  name: string;
  brandName: string | null;
  shortDescription: string | null;
  image: string | null;
  price: number | null;
  stock: number;
  attrs: { label: string; value: string }[];
  tags: { id: string; name: string; slug: string }[];
};

const cardInclude = {
  brand: true,
  category: { include: { attributes: true } },
  tags: true,
  variants: {
    orderBy: { price: "asc" as const },
    take: 1,
    include: {
      images: { orderBy: [{ isMain: "desc" as const }, { sortOrder: "asc" as const }], take: 1 },
      tags: true,
    },
  },
};

function buildCard(product: any): CatalogCard {
  const variant = product.variants[0];
  const image = variant?.images[0];
  const attrSchema = product.category?.attributes ?? [];
  const attrs = attrSchema
    .filter((a: any) => {
      const v = (variant?.attributes as Record<string, unknown> | undefined)?.[a.key];
      return v !== undefined && v !== "";
    })
    .slice(0, 4)
    .map((a: any) => ({
      label: a.label,
      value: `${(variant!.attributes as Record<string, unknown>)[a.key]}${a.unit ?? ""}`,
    }));

  const mergedTagsMap = new Map<string, { id: string; name: string; slug: string }>();
  for (const t of product.tags) mergedTagsMap.set(t.id, t);
  for (const t of variant?.tags ?? []) mergedTagsMap.set(t.id, t);

  return {
    id: product.id,
    variantId: variant?.id ?? "",
    sku: variant?.sku ?? "",
    slug: variant?.slug ?? "",
    name: product.name,
    brandName: product.brand?.name ?? null,
    shortDescription: product.shortDescription ?? null,
    image: image?.url ?? null,
    price: variant?.price ? Number(variant.price) : null,
    stock: variant?.stock ?? 0,
    attrs,
    tags: Array.from(mergedTagsMap.values()),
  };
}

export async function getCatalogProducts(
  filters: CatalogFilters,
  page: number
): Promise<{ cards: CatalogCard[]; totalCount: number }> {
  const { categoryId, categoryIds, brand, q, tags, sort } = filters;

  const categoryFilter = categoryId
    ? { id: categoryId }
    : categoryIds && categoryIds.length > 0
    ? { id: { in: categoryIds } }
    : undefined;

  const baseWhere = {
    category: categoryFilter,
    brand: brand ? { slug: brand } : undefined,
    tags: tags && tags.length > 0 ? { some: { slug: { in: tags } } } : undefined,
  };

  let matchedProductIds: string[] | null = null;
  if (q && q.trim()) {
    const prefix = `${q}%`;
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT p.id, MAX(
        CASE
          WHEN p.name ILIKE ${prefix} OR v.sku ILIKE ${prefix} OR v.name ILIKE ${prefix} THEN 1.0
          ELSE GREATEST(
            similarity(p.name, ${q}),
            similarity(coalesce(v.sku, ''), ${q}),
            similarity(coalesce(v.name, ''), ${q})
          )
        END
      ) AS max_sim
      FROM "Product" p
      LEFT JOIN "ProductVariant" v ON v."productId" = p.id
      WHERE p.name ILIKE ${prefix} OR v.sku ILIKE ${prefix} OR v.name ILIKE ${prefix}
         OR p.name % ${q} OR v.sku % ${q} OR v.name % ${q}
      GROUP BY p.id
      ORDER BY max_sim DESC
    `;
    const allMatchedIds = rows.map((r) => r.id);

    // применяем фильтры категории/бренда/тегов к результатам поиска,
    // сохраняя порядок релевантности
    if (category || brand || (tags && tags.length > 0)) {
      const validRows = await prisma.product.findMany({
        where: { id: { in: allMatchedIds }, ...baseWhere },
        select: { id: true },
      });
      const validIds = new Set(validRows.map((r) => r.id));
      matchedProductIds = allMatchedIds.filter((id) => validIds.has(id));
    } else {
      matchedProductIds = allMatchedIds;
    }
  }

  const skip = (page - 1) * PAGE_SIZE;

  // Сортировка по цене/наличию требует полной выборки (без skip/take на уровне БД),
  // так как Prisma не сортирует Product по полю связанного ProductVariant напрямую.
  if (sort) {
    const where = matchedProductIds
      ? { id: { in: matchedProductIds } }
      : baseWhere;

    const allProducts = await prisma.product.findMany({
      where,
      include: cardInclude,
    });

    let cards = allProducts.map(buildCard);

    if (matchedProductIds) {
      // сохраняем релевантность как вторичный признак порядка при равенстве по сортировке
      const orderIndex = new Map(matchedProductIds.map((id, i) => [id, i]));
      cards = cards.sort((a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0));
    }

    if (sort === "price_asc" || sort === "price_desc") {
      cards = cards.sort((a, b) => {
        // товары "по запросу" (price === null) всегда уходят в конец
        if (a.price === null && b.price === null) return 0;
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return sort === "price_asc" ? a.price - b.price : b.price - a.price;
      });
    } else if (sort === "stock") {
      cards = cards.sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0));
    }

    const totalCount = cards.length;
    const pageCards = cards.slice(skip, skip + PAGE_SIZE);
    return { cards: pageCards, totalCount };
  }

  // Без активной сортировки — прежнее поведение (эффективная пагинация на уровне БД)
  const totalCount = matchedProductIds
    ? matchedProductIds.length
    : await prisma.product.count({ where: baseWhere });

  let products;
  if (matchedProductIds) {
    const pageIds = matchedProductIds.slice(skip, skip + PAGE_SIZE);
    const rawProducts = await prisma.product.findMany({
      where: { id: { in: pageIds } },
      include: cardInclude,
    });
    products = pageIds
      .map((id) => rawProducts.find((p) => p.id === id))
      .filter((p): p is (typeof rawProducts)[number] => Boolean(p));
  } else {
    products = await prisma.product.findMany({
      where: baseWhere,
      include: cardInclude,
      orderBy: { name: "asc" },
      skip,
      take: PAGE_SIZE,
    });
  }

  const cards = products.map(buildCard);
  return { cards, totalCount };
}