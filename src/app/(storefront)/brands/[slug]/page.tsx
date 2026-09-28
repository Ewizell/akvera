import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import BrandInfoBar from "@/components/BrandInfoBar";
import CategoryTileGrid from "@/components/CategoryTileGrid";
import ShowAllProductsButton from "@/components/ShowAllProductsButton";
import { getBrandCategories } from "@/lib/catalog-query";
import { getVisibleCategoryIds } from "@/lib/visibility";
import { stripHtml, absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    select: { name: true, description: true, logoUrl: true },
  });
  if (!brand) return {};

  const title = `${brand.name} — купить оборудование ${brand.name} | Akvera`;
  const description = brand.description
    ? stripHtml(brand.description).slice(0, 160)
    : `Каталог оборудования бренда ${brand.name}: категории, цены, наличие, характеристики. Каталог Akvera.`;
  const url = absoluteUrl(`/brands/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      ...(brand.logoUrl ? { images: [{ url: brand.logoUrl }] } : {}),
    },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    select: { name: true, description: true, logoUrl: true },
  });
  if (!brand) notFound();

  const [rawCategories, visibleCategoryIds] = await Promise.all([
    getBrandCategories(slug),
    getVisibleCategoryIds(),
  ]);
  const categories = rawCategories.filter((c) => visibleCategoryIds.includes(c.id));

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Бренды", href: "/brands" },
    { label: brand.name },
  ];

  const tileItems = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    href: `/brands/${slug}/${c.slug}`,
    productCount: c.productCount,
    imageUrl: c.imageUrl,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Brand",
        name: brand.name,
        url: absoluteUrl(`/brands/${slug}`),
        ...(brand.logoUrl ? { logo: brand.logoUrl } : {}),
        ...(brand.description ? { description: stripHtml(brand.description) } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.label,
          ...(c.href ? { item: absoluteUrl(c.href) } : {}),
        })),
      },
      {
        "@type": "CollectionPage",
        name: `Категории бренда ${brand.name}`,
        url: absoluteUrl(`/brands/${slug}`),
        mainEntity: {
          "@type": "ItemList",
          itemListElement: categories.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            url: absoluteUrl(`/brands/${slug}/${c.slug}`),
          })),
        },
      },
    ],
  };

  return (
    <main className="max-w-[1440px] mx-auto px-20 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs items={crumbs} />

      <div className="mt-3 mb-6 flex items-end justify-between gap-4">
        <h1 className="text-[36px] font-bold leading-[1.2] text-[#0f172a]">{brand.name}</h1>
        {categories.length > 0 && <ShowAllProductsButton href={`/brands/${slug}/all`} />}
      </div>

      <BrandInfoBar name={brand.name} description={brand.description} logoUrl={brand.logoUrl} />

      {categories.length === 0 ? (
        <p className="text-gray-500">У этого бренда пока нет товаров.</p>
      ) : (
        <CategoryTileGrid items={tileItems} />
      )}
    </main>
  );
}