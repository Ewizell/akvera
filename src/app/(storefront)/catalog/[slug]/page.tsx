import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { Metadata } from "next";
import AddToCartButton from "@/components/AddToCartButton";

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
      },
    },
    images: {
      orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }],
    },
    documents: true,
  },
});

if (!variant) {
  notFound();
}

const category = variant.product.category;

const crumbs = [
  { label: "AKVERA", href: "/" },
  { label: "Каталог", href: "/catalog" },
  ...(category?.parent
    ? [{ label: category.parent.name, href: `/catalog?category=${category.parent.slug}` }]
    : []),
  ...(category
    ? [{ label: category.name, href: `/catalog?category=${category.slug}` }]
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
      url: `${siteUrl}/catalog/${variant.slug}`,
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
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {variant.images[0] ? (
              <Image
                src={variant.images[0].url}
                alt={variant.images[0].alt || variant.product.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Нет фото
              </div>
            )}
          </div>

          {variant.images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {variant.images.slice(1).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square bg-gray-100 rounded overflow-hidden"
                >
                  <Image
                    src={img.url}
                    alt={img.alt || variant.product.name}
                    fill
                    className="object-contain p-1"
                    sizes="100px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Инфо */}
      <div>
        <h1 className="text-2xl font-semibold">{variant.product.name}</h1>
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
          price={variant.price}
          image={variant.images[0]?.url || null}
        />
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
    </main>
  );
}