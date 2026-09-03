import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const revalidate = 3600;

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          variants: {
            orderBy: { createdAt: "asc" },
            take: 1,
            include: { images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }], take: 1 } },
          },
        },
      },
    },
  });

  if (!brand) {
    notFound();
  }

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: brand.name },
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  const brandJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: brand.name,
    url: `${siteUrl}/brands/${brand.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: brand.products
        .map((product, index) => {
          const variant = product.variants[0];
          if (!variant) return null;
          return {
            "@type": "ListItem",
            position: index + 1,
            url: `${siteUrl}/product/${variant.slug}`,
            name: product.name,
          };
        })
        .filter(Boolean),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
      />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <Breadcrumbs items={crumbs} />

        <div className="flex items-center gap-4 mb-8">
          {brand.logoUrl && (
            <div className="relative w-16 h-16 shrink-0">
              <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain" />
            </div>
          )}
          <h1 className="text-2xl font-semibold">{brand.name}</h1>
        </div>

        {brand.products.length === 0 ? (
          <p className="text-gray-500">У этого бренда пока нет товаров.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brand.products.map((product) => {
              const variant = product.variants[0];
              if (!variant) return null;
              const image = variant.images[0];

              return (
                <Link
                  key={product.id}
                  href={`/product/${variant.slug}`}
                  className="block group"
                >
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {image ? (
                      <Image
                        src={image.url}
                        alt={image.alt || product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Нет фото
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {variant.price ? `${variant.price.toLocaleString("ru-RU")} ₽` : "Цена по запросу"}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}