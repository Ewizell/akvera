import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 40;

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
  variantName: string | null;
  brandName: string | null;
  shortDescription: string | null;
  image: string | null;
  images: string[]; // ← новое: все картинки варианта, для слайдера в карточке
  price: number | null;
  stock: number;
  attrs: { label: string; value: string }[];
  tags: { id: string; name: string; slug: string }[];
};

export const cardInclude = {
  product: {
    include: {
      brand: true,
      category: { include: { attributes: true } },
      tags: true,
    },
  },
  images: { orderBy: [{ isMain: "desc" as const }, { sortOrder: "asc" as const }] }, // ← убрали take: 1
  tags: true,
};

export function buildCard(variant: any): CatalogCard {
  const product = variant.product;
  const images: string[] = (variant.images ?? []).map((img: any) => img.url);
  const attrSchema = product.category?.attributes ?? [];
  const attrs = attrSchema
    .filter((a: any) => {
      const v = (variant.attributes as Record<string, unknown> | undefined)?.[a.key];
      return v !== undefined && v !== "";
    })
    .slice(0, 4)
    .map((a: any) => ({
      label: a.label,
      value: `${(variant.attributes as Record<string, unknown>)[a.key]}${a.unit ?? ""}`,
    }));

  const mergedTagsMap = new Map<string, { id: string; name: string; slug: string }>();
  for (const t of product.tags) mergedTagsMap.set(t.id, t);
  for (const t of variant.tags ?? []) mergedTagsMap.set(t.id, t);

  return {
    id: variant.id,
    variantId: variant.id,
    sku: variant.sku,
    slug: variant.slug,
    name: product.name,
    variantName: variant.name || null,
    brandName: product.brand?.name ?? null,
    shortDescription: product.shortDescription ?? null,
    image: images[0] ?? null,
    images,
    price: variant.price !== null ? Number(variant.price) : null,
    stock: variant.stock,
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
      attrConditions.push({
        OR: values.flatMap((v) => {
          const num = Number(v);
          const conditions: Record<string, unknown>[] = [{ attributes: { path: [key], equals: v } }];
          if (v.trim() !== "" && !Number.isNaN(num)) {
            conditions.push({ attributes: { path: [key], equals: num } });
          }
          return conditions;
        }),
      });
    }
  }
  if (attrRanges) {
    for (const [key, range] of Object.entries(attrRanges)) {
      if (range.min !== undefined) attrConditions.push({ attributes: { path: [key], gte: range.min } });
      if (range.max !== undefined) attrConditions.push({ attributes: { path: [key], lte: range.max } });
    }
  }

  // фильтры теперь применяются напрямую к ProductVariant — каждое исполнение это своя карточка
  const andConditions: Record<string, unknown>[] = [];
  if (priceMin !== undefined || priceMax !== undefined) {
    andConditions.push({
      OR: [
        { price: null }, // "цена по запросу" — всегда проходит числовой фильтр цены
        {
          price: {
            ...(priceMin !== undefined ? { gte: priceMin } : {}),
            ...(priceMax !== undefined ? { lte: priceMax } : {}),
          },
        },
      ],
    });
  }
  if (inStock) andConditions.push({ stock: { gt: 0 } });
  if (attrConditions.length > 0) andConditions.push(...attrConditions);
  if (tags && tags.length > 0) {
    // тег может быть проставлен и на товаре, и на конкретном исполнении
    andConditions.push({
      OR: [{ tags: { some: { slug: { in: tags } } } }, { product: { tags: { some: { slug: { in: tags } } } } }],
    });
  }

  const baseWhere = {
    product: {
      category: categoryFilter,
      brand: brand ? { slug: brand } : undefined,
    },
    ...(andConditions.length > 0 ? { AND: andConditions } : {}),
  };

  let matchedVariantIds: string[] | null = null;
  if (q && q.trim()) {
    const prefix = `${q}%`;
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT v.id, MAX(
        CASE
          WHEN p.name ILIKE ${prefix} OR v.sku ILIKE ${prefix} OR v.name ILIKE ${prefix} THEN 1.0
          ELSE GREATEST(
            similarity(p.name, ${q}),
            similarity(coalesce(v.sku, ''), ${q}),
            similarity(coalesce(v.name, ''), ${q})
          )
        END
      ) AS max_sim
      FROM "ProductVariant" v
      JOIN "Product" p ON p.id = v."productId"
      WHERE p.name ILIKE ${prefix} OR v.sku ILIKE ${prefix} OR v.name ILIKE ${prefix}
         OR p.name % ${q} OR v.sku % ${q} OR v.name % ${q}
      GROUP BY v.id
      ORDER BY max_sim DESC
    `;
    const allMatchedIds = rows.map((r) => r.id);

    const validRows = await prisma.productVariant.findMany({
      where: { id: { in: allMatchedIds }, ...baseWhere },
      select: { id: true },
    });
    const validIds = new Set(validRows.map((r) => r.id));
    matchedVariantIds = allMatchedIds.filter((id) => validIds.has(id));
  }

  const skip = (page - 1) * PAGE_SIZE;

  // Сортировка по цене/наличию требует полной выборки (сортируем в JS)
  if (sort) {
    const where = matchedVariantIds ? { id: { in: matchedVariantIds } } : baseWhere;

    const allVariants = await prisma.productVariant.findMany({
      where,
      include: cardInclude,
    });

    let cards = allVariants.map(buildCard);

    if (matchedVariantIds) {
      const orderIndex = new Map(matchedVariantIds.map((id, i) => [id, i]));
      cards = cards.sort((a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0));
    }

    if (sort === "price_asc" || sort === "price_desc") {
      cards = cards.sort((a, b) => {
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

  // Без активной сортировки — эффективная пагинация на уровне БД
  const totalCount = matchedVariantIds
    ? matchedVariantIds.length
    : await prisma.productVariant.count({ where: baseWhere });

  let variants;
  if (matchedVariantIds) {
    const pageIds = matchedVariantIds.slice(skip, skip + PAGE_SIZE);
    const rawVariants = await prisma.productVariant.findMany({
      where: { id: { in: pageIds } },
      include: cardInclude,
    });
    variants = pageIds
      .map((id) => rawVariants.find((v) => v.id === id))
      .filter((v): v is (typeof rawVariants)[number] => Boolean(v));
  } else {
    variants = await prisma.productVariant.findMany({
      where: baseWhere,
      include: cardInclude,
      orderBy: [{ product: { name: "asc" } }, { name: "asc" }],
      skip,
      take: PAGE_SIZE,
    });
  }

  const cards = variants.map(buildCard);
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

export type AttributeFilterOption = {
  key: string;
  label: string;
  unit: string | null;
  fieldType: "number" | "select";
  options: string[];
};

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
      const uniqueNums = Array.from(new Set(rawValues.map((v) => Number(v)))).filter((n) => !Number.isNaN(n));
      uniqueNums.sort((a, b) => a - b);
      return {
        key: attr.key,
        label: attr.label,
        unit: attr.unit,
        fieldType: "number",
        options: uniqueNums.map((n) => String(n)),
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
export type CategoryAncestor = { id: string; name: string; slug: string };

export async function getCategoryAncestors(parentId: string | null): Promise<CategoryAncestor[]> {
  const chain: CategoryAncestor[] = [];
  let currentId = parentId;
  while (currentId) {
    const cat = await prisma.category.findUnique({
      where: { id: currentId },
      select: { id: true, name: true, slug: true, parentId: true },
    });
    if (!cat) break;
    chain.unshift({ id: cat.id, name: cat.name, slug: cat.slug });
    currentId = cat.parentId;
  }
  return chain;
}

export async function getDescendantCategoryIds(rootId: string): Promise<string[]> {
  const all = await prisma.category.findMany({ select: { id: true, parentId: true } });
  const byParent = new Map<string, string[]>();
  for (const c of all) {
    const key = c.parentId ?? "__root__";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c.id);
  }
  const result: string[] = [rootId];
  const stack = [rootId];
  while (stack.length > 0) {
    const id = stack.pop()!;
    for (const childId of byParent.get(id) ?? []) {
      result.push(childId);
      stack.push(childId);
    }
  }
  return result;
}

export type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  allProductsHref: string;
  ownProductsHref: string | null;
  children: CategoryTreeNode[];
};

export async function buildCategoryTree(
  rootId: string,
  rootAncestorSlugs: string[]
): Promise<CategoryTreeNode | null> {
  const all = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, parentId: true, _count: { select: { products: true } } },
  });
  const byParent = new Map<string, typeof all>();
  for (const c of all) {
    const key = c.parentId ?? "__root__";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }
  const root = all.find((c) => c.id === rootId);
  if (!root) return null;

  function build(cat: (typeof all)[number], pathSlugs: string[]): CategoryTreeNode {
    const fullPath = [...pathSlugs, cat.slug];
    const pagePath = `/category/${fullPath.join("/")}`;
    const children = (byParent.get(cat.id) ?? [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "ru"))
      .map((child) => build(child, fullPath));

    const hasChildren = children.length > 0;

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      productCount: cat._count.products,
      allProductsHref: hasChildren ? `${pagePath}/all` : pagePath,
      ownProductsHref: hasChildren ? `${pagePath}/own` : null,
      children,
    };
  }

  return build(root, rootAncestorSlugs);
}
export type CategoryChildItem = {
  id: string;
  name: string;
  slug: string;
  href: string;
  productCount: number;
};

export async function getCategoryChildren(
  categoryId: string,
  pathSlugs: string[] // цепочка slug'ов от корня до текущей категории (для построения href)
): Promise<CategoryChildItem[]> {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
  });

  return children
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "ru"))
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      productCount: c._count.products,
      href: `/category/${[...pathSlugs, c.slug].join("/")}`,
    }));
}