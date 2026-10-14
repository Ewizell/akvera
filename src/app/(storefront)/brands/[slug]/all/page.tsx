import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CategoryProductListing from "@/components/CategoryProductListing";
import BrandInfoBar from "@/components/BrandInfoBar";
import { parseCatalogSearchParams, getBrandCategories } from "@/lib/catalog-query";
import { getVisibleCategoryIds } from "@/lib/visibility";
import { SITE_NAME, absoluteUrl, buildMetadata, stripHtml } from "@/lib/seo";
import type { CategoryNavData } from "@/components/CategoryFilterSidebar";
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

  const title = `Все товары ${brand.name} — каталог, цены, наличие | Akvera`;
  const description = `Все товары бренда ${brand.name}: цены, наличие, характеристики. Каталог Akvera.`;

  return buildMetadata({
    title,
    description,
    path: `/brands/${slug}/all`,
    image: brand.logoUrl,
  });
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

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

  const categoryNav: CategoryNavData = {
    allProductsLink: { label: "Все категории", href: `/brands/${slug}/all` },
    activeSlug: null,
    items: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      href: `/brands/${slug}/${c.slug}`,
      productCount: c.productCount,
    })),
  };

  const { page, tags, sort, priceMin, priceMax, inStock, attrValues, attrRanges } =
    parseCatalogSearchParams(sp);

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Бренды", href: "/brands" },
    { label: brand.name, href: `/brands/${slug}` },
    { label: "Все товары" },
  ];

  return (
    <CategoryProductListing
      title={`ТОВАРЫ БРЕНДА ${brand.name}`.toUpperCase()}
      basePath={`/brands/${slug}/all`}
      brand={slug}
      tags={tags}
      sort={sort}
      page={page}
      crumbs={crumbs}
      backHref={`/brands/${slug}`}
      categoryNav={categoryNav}
      headerContent={
        <BrandInfoBar name={brand.name} description={brand.description} logoUrl={brand.logoUrl} />
      }
      priceMin={priceMin}
      priceMax={priceMax}
      inStock={inStock}
      attrValues={attrValues}
      attrRanges={attrRanges}
      jsonLd={({ cards }) => {
        const brandUrl = absoluteUrl(`/brands/${slug}`);
        const pageUrl = absoluteUrl(`/brands/${slug}/all`);

        return {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${pageUrl}#webpage`,
              url: pageUrl,
              name: `Все товары бренда ${brand.name}`,
              inLanguage: "ru-RU",
              isPartOf: {
                "@type": "WebSite",
                name: SITE_NAME,
                url: absoluteUrl("/"),
              },
              about: { "@id": `${brandUrl}#brand` },
              breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
              mainEntity: {
                "@type": "ItemList",
                itemListElement: cards.map((card, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  url: absoluteUrl(`/product/${card.slug}`),
                })),
              },
            },
            {
              "@type": "Brand",
              "@id": `${brandUrl}#brand`,
              name: brand.name,
              url: brandUrl,
              ...(brand.logoUrl ? { logo: absoluteUrl(brand.logoUrl) } : {}),
              ...(brand.description
                ? { description: stripHtml(brand.description).slice(0, 5000) }
                : {}),
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${pageUrl}#breadcrumb`,
              itemListElement: crumbs.map((c, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: c.label,
                ...(c.href ? { item: absoluteUrl(c.href) } : {}),
              })),
            },
          ],
        };
      }}
    />
  );
}