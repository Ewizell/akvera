import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { Metadata } from "next";
import AddToCartButton from "@/components/AddToCartButton";
import CompareButton from "@/components/CompareButton";
import { ProductGallery } from "@/components/ProductGallery";
import { getRelatedVariants } from "@/lib/actions/product";
import { RelatedProductsCarousel } from "@/components/RelatedProductsCarousel";
import { RecentlyViewedCarousel } from "@/components/RecentlyViewedCarousel";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const variant = await prisma.productVariant.findUnique({
    where: { slug },
    select: {
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      name: true,
      product: { select: { name: true } },
    },
  });

  if (!variant) {
    return {};
  }

  const title = variant.metaTitle || `${variant.product.name}${variant.name ? ` — ${variant.name}` : ""}`;

  return {
    title,
    description: variant.metaDescription || undefined,
    keywords: variant.metaKeywords
      ? variant.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
      : undefined,
    openGraph: {
      title,
      description: variant.metaDescription || undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const variant = await prisma.productVariant.findUnique({
  where: { slug },
  include: {
    product: {
      include: {
        category: { include: { parent: true } },
        brand: true,
        tags: true,
      },
    },
    images: {
      orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }],
    },
    documents: true,
    tags: true,
  },
});

if (!variant) {
  notFound();
}

const category = variant.product.category;

const relatedVariants = await getRelatedVariants(
  variant.product.categoryId,
  variant.id
);

const mergedTagsMap = new Map<string, { id: string; name: string; slug: string }>();
for (const t of variant.product.tags) mergedTagsMap.set(t.id, t);
for (const t of variant.tags) mergedTagsMap.set(t.id, t);
const productTags = Array.from(mergedTagsMap.values());

const crumbs = [
  { label: "AKVERA", href: "/" },
  { label: "Каталог", href: "/catalog" },
  ...(category?.parent
    ? [
        { label: category.parent.name, href: `/category/${category.parent.slug}` },
        { label: category.name, href: `/category/${category.parent.slug}/${category.slug}` },
      ]
    : category
    ? [{ label: category.name, href: `/category/${category.slug}` }]
    : []),
  { label: variant.product.name },
];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const description = variant.description || variant.product.description;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${siteUrl}${crumb.href}` } : {}),
    })),
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: variant.product.name,
    ...(variant.name ? { model: variant.name } : {}),
    ...(variant.sku ? { sku: variant.sku } : {}),
    ...(variant.product.brand ? { brand: { "@type": "Brand", name: variant.product.brand.name } } : {}),
    ...(variant.images[0] ? { image: variant.images.map((img) => `${siteUrl}${img.url}`) } : {}),
    ...(description ? { description: description.replace(/<[^>]*>/g, "").slice(0, 5000) } : {}),
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${variant.slug}`,
      priceCurrency: "RUB",
      ...(variant.price ? { price: variant.price } : {}),
      availability: variant.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
    },
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Breadcrumbs items={crumbs} />
      <div className="grid md:grid-cols-2 gap-10">
        {/* Галерея */}
        <ProductGallery images={variant.images} productName={variant.product.name} />

        {/* Инфо */}
      <div>
        <h1 className="text-2xl font-semibold">{variant.product.name}</h1>
        {productTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {productTags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
        {variant.product.brand && (
          <Link
            href={`/brands/${variant.product.brand.slug}`}
            className="text-sm text-gray-500 mt-1 hover:underline inline-block"
          >
            {variant.product.brand.name}
          </Link>
        )}
        {variant.name && (
          <p className="text-gray-500 mt-1">{variant.name}</p>
        )}

        <p className="mt-4 text-3xl font-bold">
          {variant.price
            ? `${Number(variant.price).toLocaleString("ru-RU")} ₽`
            : "Цена по запросу"}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          {variant.stock > 0 ? "В наличии" : "Под заказ"}
        </p>

        <AddToCartButton 
          variantId={variant.id}
          productName={variant.product.name}
          variantName={variant.name}
          slug={variant.product.slug}
          sku={variant.sku}
          price={variant.price ? Number(variant.price) : null}
          image={variant.images[0]?.url || null}
        />
        <CompareButton variantId={variant.id} className="mt-3 w-full sm:w-auto" />
    </div>
      </div>

      {/* Описание — HTML, чтобы можно было вставлять таблицы, списки и т.д. */}
      {description && (
        <div className="mt-14 max-w-3xl">
          <h2 className="text-lg font-semibold mb-4">Описание</h2>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}

      {variant.documents.length > 0 && (
        <div className="mt-10 max-w-3xl">
          <h2 className="text-lg font-semibold mb-4">Документация</h2>
          <ul className="space-y-2">
            {variant.documents.map((doc) => (
              <li key={doc.id}>
                <a 
                  href={doc.url}
                  download
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm">
                    
                  {doc.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RelatedProductsCarousel variants={relatedVariants} />

      <RecentlyViewedCarousel
        current={{
          id: variant.id,
          slug: variant.slug,
          name: variant.name,
          price: variant.price ? Number(variant.price) : null,
          product: { name: variant.product.name },
          images: variant.images[0]
            ? [{ url: variant.images[0].url, alt: variant.images[0].alt }]
            : [],
        }}
      />
    </main>
  );
}