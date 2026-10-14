import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CategoryProductListing from "@/components/CategoryProductListing";
import BrandInfoBar from "@/components/BrandInfoBar";
import { parseCatalogSearchParams, getBrandCategories } from "@/lib/catalog-query";
import { getVisibleCategoryIds } from "@/lib/visibility";
import { SITE_NAME, absoluteUrl, buildMetadata } from "@/lib/seo";
import type { CategoryNavData } from "@/components/CategoryFilterSidebar";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
}): Promise<Metadata> {
  const { slug, categorySlug } = await params;

  const [brand, category] = await Promise.all([
    prisma.brand.findUnique({ where: { slug }, select: { name: true, logoUrl: true } }),
    prisma.category.findUnique({ where: { slug: categorySlug }, select: { name: true } }),
  ]);
  if (!brand || !category) return {};

  const title = `${category.name} ${brand.name} — купить, цены, наличие | Akvera`;
  const description = `${category.name} бренда ${brand.name}: цены, наличие и характеристики в каталоге Akvera.`;

  return buildMetadata({
    title,
    description,
    path: `/brands/${slug}/${categorySlug}`,
    image: brand.logoUrl,
  });
}

export default async function BrandCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug, categorySlug } = await params;
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

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  if (!activeCategory) notFound(); // либо категории нет, либо у бренда нет в ней товаров

  const categoryNav: CategoryNavData = {
    allProductsLink: { label: "Все категории", href: `/brands/${slug}/all` },
    activeSlug: categorySlug,
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
    { label: activeCategory.name },
  ];

  return (
    <CategoryProductListing
      title={`${activeCategory.name.toUpperCase()} ${brand.name.toUpperCase()}`}
      basePath={`/brands/${slug}/${categorySlug}`}
      categoryId={activeCategory.id}
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
        const pageUrl = absoluteUrl(`/brands/${slug}/${categorySlug}`);

        return {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${pageUrl}#webpage`,
              url: pageUrl,
              name: `${activeCategory.name} — ${brand.name}`,
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