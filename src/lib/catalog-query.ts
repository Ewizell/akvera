import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 12;

export type CatalogFilters = {
  categoryId?: string; // точное совпадение — лист/родитель-без-детей, либо конкретная подкатегория
  categoryIds?: string[]; // OR — используется для /category/[slug]/all (родитель + все дети)
  brand?: string;
  q?: string;
  tags?: string[]; // slugs, OR-логика
  sort?: "price_asc" | "price_desc" | "stock";
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  attrValues?: Record<string, string[]>; // key -> выбранные значения (select-атрибуты), OR внутри ключа
  attrRanges?: Record<string, { min?: number; max?: number }>; // key -> диапазон (числовые атрибуты)
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
  const { categoryId, categoryIds, brand, q, tags, sort, priceMin, priceMax, inStock, attrValues, attrRanges } =
    filters;

  const categoryFilter = categoryId
    ? { id: categoryId }
    : categoryIds && categoryIds.length > 0
    ? { id: { in: categoryIds } }
    : undefined;

  // условия по JSONB-атрибутам варианта: одно условие на ключ, все условия объединяются через AND
  const attrConditions: Record<string, unknown>[] = [];
  if (attrValues) {
    for (const [key, values] of Object.entries(attrValues)) {
      if (values.length === 0) continue;
      attrConditions.push({ OR: values.map((v) => ({ attributes: { path: [key], equals: v } })) });
    }
  }
  if (attrRanges) {
    for (const [key, range] of Object.entries(attrRanges)) {
      if (range.min !== undefined) attrConditions.push({ attributes: { path: [key], gte: range.min } });
      if (range.max !== undefined) attrConditions.push({ attributes: { path: [key], lte: range.max } });
    }
  }

  const variantWhere =
    priceMin !== undefined || priceMax !== undefined || inStock || attrConditions.length > 0
      ? {
          ...(priceMin !== undefined || priceMax !== undefined
            ? {
                OR: [
                  { price: null }, // "цена по запросу" — всегда проходит числовой фильтр цены
                  {
                    price: {
                      ...(priceMin !== undefined ? { gte: priceMin } : {}),
                      ...(priceMax !== undefined ? { lte: priceMax } : {}),
                    },
                  },
                ],
              }
            : {}),
          ...(inStock ? { stock: { gt: 0 } } : {}),
          ...(attrConditions.length > 0 ? { AND: attrConditions } : {}),
        }
      : undefined;

  const baseWhere = {
    category: categoryFilter,
    brand: brand ? { slug: brand } : undefined,
    tags: tags && tags.length > 0 ? { some: { slug: { in: tags } } } : undefined,
    variants: variantWhere ? { some: variantWhere } : undefined,
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
    if (categoryFilter || brand || (tags && tags.length > 0) || variantWhere) {
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


export async function getPriceRange(
  filters: Pick<CatalogFilters, "categoryId" | "categoryIds" | "brand" | "tags">
): Promise<{ min: number; max: number }> {
  const categoryFilter = filters.categoryId
    ? { id: filters.categoryId }
    : filters.categoryIds && filters.categoryIds.length > 0
    ? { id: { in: filters.categoryIds } }
    : undefined;

  const result = await prisma.productVariant.aggregate({
    where: {
      price: { not: null },
      product: {
        category: categoryFilter,
        brand: filters.brand ? { slug: filters.brand } : undefined,
        tags: filters.tags && filters.tags.length > 0 ? { some: { slug: { in: filters.tags } } } : undefined,
      },
    },
    _min: { price: true },
    _max: { price: true },
  });

  return {
    min: result._min.price ? Math.floor(Number(result._min.price)) : 0,
    max: result._max.price ? Math.ceil(Number(result._max.price)) : 0,
  };
}

export type AttributeFilterOption =
  | { key: string; label: string; unit: string | null; fieldType: "number"; min: number; max: number }
  | { key: string; label: string; unit: string | null; fieldType: "select"; options: string[] };

export async function getAttributeFilterOptions(
  categoryId: string | undefined,
  categoryIds: string[] | undefined
): Promise<AttributeFilterOption[]> {
  const primaryCategoryId = categoryId ?? categoryIds?.[0];
  if (!primaryCategoryId) return [];

  const category = await prisma.category.findUnique({
    where: { id: primaryCategoryId },
    include: { attributes: { orderBy: { sortOrder: "asc" } } },
  });
  if (!category || category.attributes.length === 0) return [];

  const productCategoryFilter = categoryId ? { id: categoryId } : { id: { in: categoryIds! } };
  const variants = await prisma.productVariant.findMany({
    where: { product: { category: productCategoryFilter } },
    select: { attributes: true },
  });

  return category.attributes.map((attr): AttributeFilterOption => {
    const rawValues = variants
      .map((v) => (v.attributes as Record<string, unknown>)[attr.key])
      .filter((v) => v !== undefined && v !== null && v !== "");

    if (attr.fieldType === "number") {
      const nums = rawValues.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
      return {
        key: attr.key,
        label: attr.label,
        unit: attr.unit,
        fieldType: "number",
        min: nums.length > 0 ? Math.min(...nums) : 0,
        max: nums.length > 0 ? Math.max(...nums) : 0,
      };
    }

    const options = Array.from(new Set(rawValues.map((v) => String(v)))).sort();
    return { key: attr.key, label: attr.label, unit: attr.unit, fieldType: "select", options };
  });
}

export type ParsedCatalogParams = {
  page: number;
  tags: string[];
  sort?: CatalogFilters["sort"];
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  inStock: boolean;
  attrValues: Record<string, string[]>;
  attrRanges: Record<string, { min?: number; max?: number }>;
};

export function parseCatalogSearchParams(sp: Record<string, string | string[] | undefined>): ParsedCatalogParams {
  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const page = Math.max(1, parseInt(get("page") ?? "1", 10) || 1);
  const tagsParam = get("tags");
  const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
  const sortParam = get("sort");
  const sort =
    sortParam === "price_asc" || sortParam === "price_desc" || sortParam === "stock" ? sortParam : undefined;
  const brand = get("brand") || undefined;
  const priceMinParam = get("priceMin");
  const priceMaxParam = get("priceMax");
  const priceMin = priceMinParam ? Number(priceMinParam) : undefined;
  const priceMax = priceMaxParam ? Number(priceMaxParam) : undefined;
  const inStock = get("stock") === "1";

  const attrValues: Record<string, string[]> = {};
  const attrRanges: Record<string, { min?: number; max?: number }> = {};

  for (const key of Object.keys(sp)) {
    if (!key.startsWith("attr_")) continue;
    const value = get(key);
    if (!value) continue;

    if (key.endsWith("_min")) {
      const attrKey = key.slice("attr_".length, -"_min".length);
      attrRanges[attrKey] = { ...attrRanges[attrKey], min: Number(value) };
    } else if (key.endsWith("_max")) {
      const attrKey = key.slice("attr_".length, -"_max".length);
      attrRanges[attrKey] = { ...attrRanges[attrKey], max: Number(value) };
    } else {
      const attrKey = key.slice("attr_".length);
      attrValues[attrKey] = value.split(",").filter(Boolean);
    }
  }

  return { page, tags, sort, brand, priceMin, priceMax, inStock, attrValues, attrRanges };
}