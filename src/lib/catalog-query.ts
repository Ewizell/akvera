import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 12;

export type CatalogFilters = {
  category?: string;
  brand?: string;
  q?: string;
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
  attrs: { label: string; value: string }[];
};

export async function getCatalogProducts(
  filters: CatalogFilters,
  page: number
): Promise<{ cards: CatalogCard[]; totalCount: number }> {
  const { category, brand, q } = filters;

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
    matchedProductIds = rows.map((r) => r.id);
  }

  const totalCount = matchedProductIds
    ? matchedProductIds.length
    : await prisma.product.count({
        where: {
          category: category ? { slug: category } : undefined,
          brand: brand ? { slug: brand } : undefined,
        },
      });

  const skip = (page - 1) * PAGE_SIZE;

  let products;
  if (matchedProductIds) {
    const pageIds = matchedProductIds.slice(skip, skip + PAGE_SIZE);
    const rawProducts = await prisma.product.findMany({
      where: { id: { in: pageIds } },
      include: {
        brand: true,
        category: { include: { attributes: true } },
        variants: {
          orderBy: { price: "asc" },
          take: 1,
          include: {
            images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }], take: 1 },
          },
        },
      },
    });
    // сохраняем порядок релевантности, потерянный при findMany с `in`
    products = pageIds
      .map((id) => rawProducts.find((p) => p.id === id))
      .filter((p): p is (typeof rawProducts)[number] => Boolean(p));
  } else {
    products = await prisma.product.findMany({
      where: {
        category: category ? { slug: category } : undefined,
        brand: brand ? { slug: brand } : undefined,
      },
      include: {
        brand: true,
        category: { include: { attributes: true } },
        variants: {
          orderBy: { price: "asc" },
          take: 1,
          include: {
            images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }], take: 1 },
          },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: PAGE_SIZE,
    });
  }

  const cards: CatalogCard[] = products.map((product) => {
    const variant = product.variants[0];
    const image = variant?.images[0];
    const attrSchema = product.category?.attributes ?? [];
    const attrs = attrSchema
      .filter((a) => {
        const v = (variant?.attributes as Record<string, unknown> | undefined)?.[a.key];
        return v !== undefined && v !== "";
      })
      .slice(0, 4)
      .map((a) => ({
        label: a.label,
        value: `${(variant!.attributes as Record<string, unknown>)[a.key]}${a.unit ?? ""}`,
      }));

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
      attrs,
    };
  });

  return { cards, totalCount };
}