import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { Metadata } from "next";
import AddToCartButton from "@/components/AddToCartButton";
import CompareButtonWithLabel from "@/components/CompareButtonWithLabel";
import { ProductGallery } from "@/components/ProductGallery";
import { getRelatedVariants, getOtherVariants } from "@/lib/actions/product";
import { RelatedProductsCarousel } from "@/components/RelatedProductsCarousel";
import { RecentlyViewedCarousel } from "@/components/RecentlyViewedCarousel";
import { OtherVariantsTile } from "@/components/OtherVariantsTile";
import FavoriteButtonWithLabel from "@/components/FavoriteButtonWithLabel";
import { CopyField } from "@/components/CopyField";

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
        category: { include: { parent: true, attributes: true } },
        brand: true,
        tags: true,
        documents: { include: { document: true } },
      },
    },
    images: {
      orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }],
    },
    documents: { include: { document: true } },
    tags: true,
  },
});

if (!variant) {
  notFound();
}

const category = variant.product.category;
const attrValues = variant.attributes as Record<string, unknown> | null;
const specs = (category?.attributes ?? [])
  .map((attr) => ({ label: attr.label, value: attrValues?.[attr.key] }))
  .filter((s) => s.value !== undefined && s.value !== null && s.value !== "");
  
const relatedVariants = await getRelatedVariants(
  variant.product.categoryId,
  variant.id
);

const otherVariants = await getOtherVariants(variant.productId, variant.id);

const mergedTagsMap = new Map<string, { id: string; name: string; slug: string }>();
for (const t of variant.product.tags) mergedTagsMap.set(t.id, t);
for (const t of variant.tags) mergedTagsMap.set(t.id, t);
const productTags = Array.from(mergedTagsMap.values());

// документы товара (общие) + документы исполнения — с дедупликацией по documentId
const documentsMap = new Map<string, { id: string; title: string; type: string; url: string }>();
for (const d of variant.product.documents) {
  documentsMap.set(d.documentId, { id: d.id, title: d.document.title, type: d.document.type, url: d.document.url });
}
for (const d of variant.documents) {
  documentsMap.set(d.documentId, { id: d.id, title: d.document.title, type: d.document.type, url: d.document.url });
}
const documents = Array.from(documentsMap.values());

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
  const applicationAreas = variant.applicationAreas.length > 0 ? variant.applicationAreas : variant.product.applicationAreas;
  const advantages = variant.advantages.length > 0 ? variant.advantages : variant.product.advantages;

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
    <main className="max-w-[1440px] mx-auto px-[80px] py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <Breadcrumbs items={crumbs} />

      <div className="flex items-end justify-between gap-6">
        <h1 className="flex-1 font-manrope font-bold text-[24px] text-[#1c2126]">
          {variant.name || variant.product.name}
        </h1>
      </div>

      {productTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {productTags.map((tag) => (
            <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_328px] gap-[24px] mt-[16px] items-center">
        <div className="flex gap-[16px] items-center">
          {variant.sku && <CopyField label="Артикул:" value={variant.sku} />}
          <CopyField label="Код товара:" value={variant.id} />
        </div>
        <div className="hidden lg:block" />
        <div className="flex gap-[16px] items-center px-[8px]">
          <FavoriteButtonWithLabel
            variantId={variant.id}
            className="text-[14px] font-manrope font-medium text-[#1c2116] cursor-pointer transition-colors duration-200 hover:text-[#179146]"
          />
          <CompareButtonWithLabel
            variantId={variant.id}
            className="text-[14px] font-manrope font-medium text-[#1c2116] cursor-pointer transition-colors duration-200 hover:text-[#179146]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_328px] gap-[24px] mt-[24px] items-start">
        {/* Галерея + характеристики */}
        <div className="flex flex-col lg:flex-row gap-[24px]">
          <ProductGallery images={variant.images} productName={variant.product.name} />

          {specs.length > 0 && (
            <div className="flex flex-col gap-[14px] py-[12px] lg:border-l lg:border-[#f0f0f0] lg:pl-[24px] w-full lg:w-[312px]">
              <p className="font-manrope font-semibold text-[18px] text-[#1c2126]">
                Характеристики товара:
              </p>
              <div className="flex flex-col gap-[12px]">
                {specs.map((spec, i) => (
                  <div key={i} className="flex gap-[6px] items-start">
                    <span className="bg-[#179146] rounded-[12px] w-[3px] h-[17px] shrink-0" />
                    <span className="font-manrope font-medium text-[14px] text-[#484f55]">
                      {spec.label}:
                    </span>
                    <span className="font-manrope font-medium text-[14px] text-[#1c2126]">
                      {String(spec.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Разделитель между характеристиками и блоком цены */}
        <div className="hidden lg:block bg-[#d9d9d9] w-px self-stretch" />

        {/* Цена / действия */}
        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[4px] px-[8px]">
            <p className="font-montserrat font-semibold text-[28px] text-[#1c2126]">
              {variant.price
                ? `${Number(variant.price).toLocaleString("ru-RU")} ₽`
                : "Цена по запросу"}
            </p>
            <p className="font-manrope font-medium text-[14px] text-[#767d83]">
              {variant.stock > 0 ? `${variant.stock} шт. на складе` : "Под заказ"}
            </p>
          </div>

          <div className="flex flex-col gap-[12px]">
            <AddToCartButton
              variantId={variant.id}
              productName={variant.product.name}
              variantName={variant.name}
              slug={variant.slug}
              sku={variant.sku}
              price={variant.price ? Number(variant.price) : null}
              image={variant.images[0]?.url || null}
            />
            <Link
              href="/contacts"
              className="w-full h-[44px] flex items-center justify-center bg-[#f0f0f0] hover:bg-[#e5e5e5] rounded-[12px] font-montserrat font-semibold text-[16px] text-[#1c2116] transition-colors"
            >
              Контакты менеджеров
            </Link>
          </div>

          <div className="flex flex-col">
            <div className="bg-[#d9d9d9] h-px w-full" />
            <div className="flex flex-col gap-[8px] px-[8px] py-[16px]">
              <div className="flex gap-[4px] items-center">
                <Image src="/icons/fi-br-info.svg" alt="" width={16} height={16} className="shrink-0" />
                <p className="font-montserrat font-semibold text-[16px] text-[#1c2116]">Внимание!</p>
              </div>
              <p className="font-manrope text-[14px] text-[#1c2116]">
                Цены носят информационный характер и не являются публичной офертой
              </p>
            </div>
            <div className="bg-[#d9d9d9] h-px w-full" />
            <div className="flex flex-col gap-[8px] px-[8px] py-[12px] font-manrope text-[14px] text-[#1c2116]">
              <p>
                Также вы можете оформить заказ или задать вопрос по{" "}
                <a href="mailto:info@akvera.ru" className="font-medium text-[#0082b2]">
                  электронной почте.
                </a>
              </p>
              <p>
                Наши{" "}
                <Link href="/contacts" className="font-medium text-[#0082b2]">
                  менеджеры
                </Link>{" "}
                предоставят информацию по обращению, проконсультируют по продукции и помогут с оформлением заказа.
              </p>
            </div>
          </div>

          <OtherVariantsTile variants={otherVariants} />
        </div>
      </div>

      {/* Нижний блок: описание / применение / преимущества + бренд / документация */}
      <div className="flex flex-col gap-[6px] mt-[24px]">
        <div className="bg-[#d9d9d9] h-px w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_328px] gap-[24px] pt-[18px]">
          <div className="flex flex-col gap-[16px] w-full">
            {description && (
              <div className="flex flex-col gap-[14px] pb-[12px] px-[12px] text-[#1c2126]">
                <p className="font-montserrat font-semibold text-[18px]">Описание:</p>
                <div
                  className="prose prose-sm max-w-none font-manrope text-[14px]"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            )}

            {(applicationAreas.length > 0 || advantages.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[12px] gap-y-[12px]">
                {applicationAreas.length > 0 && (
                  <div className="flex flex-col gap-[12px] pb-[12px] pl-[12px]">
                    <p className="font-montserrat font-semibold text-[18px] text-[#1c2126]">
                      Область применения:
                    </p>
                    <div className="flex flex-col gap-[10px]">
                      {applicationAreas.map((item, i) => (
                        <div key={i} className="flex gap-[6px] items-center">
                          <span className="bg-[#179146] rounded-[12px] w-[3px] h-[17px] shrink-0" />
                          <span className="font-manrope font-medium text-[14px] text-[#1c2126]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {advantages.length > 0 && (
                  <div className="flex flex-col gap-[12px] pb-[12px] pl-[12px]">
                    <p className="font-montserrat font-semibold text-[18px] text-[#1c2126]">
                      Преимущества:
                    </p>
                    <div className="flex flex-col gap-[10px]">
                      {advantages.map((item, i) => (
                        <div key={i} className="flex gap-[6px] items-start">
                          <span className="bg-[#179146] rounded-[12px] w-[3px] self-stretch shrink-0" />
                          <span className="font-manrope font-medium text-[14px] text-[#1c2126]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:block bg-[#d9d9d9] w-px self-stretch" />

          <div className="flex flex-col gap-[16px]">
              {variant.product.brand && (
                <div className="flex flex-col gap-[12px] pt-[12px] px-[7px]">
                  <div className="flex flex-col gap-[8px] text-[#1c2126]">
                    <div className="flex items-center justify-between gap-[8px]">
                      <div className="flex font-montserrat font-semibold gap-[4px] text-[16px]">
                        <span>Бренд:</span>
                        <span>{variant.product.brand.name}</span>
                      </div>
                      {variant.product.brand.logoUrl && (
                        <div className="relative w-[60px] h-[60px] shrink-0">
                          <Image
                            src={variant.product.brand.logoUrl}
                            alt={variant.product.brand.name}
                            fill
                            className="object-contain"
                            sizes="40px"
                          />
                        </div>
                      )}
                    </div>
                    {variant.product.brand.description && (
                      <p className="font-montserrat text-[14px] leading-[1.2]">
                        {variant.product.brand.description}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/brands/${variant.product.brand.slug}`}
                    className="h-[44px] flex items-center justify-center bg-[#179146] hover:bg-[#147a3a] rounded-[10px] font-montserrat font-semibold text-[16px] text-white transition-colors"
                  >
                    Все товары бренда
                  </Link>
                </div>
              )}

              {documents.length > 0 && (
                <>
                  <div className="bg-[#d9d9d9] h-px w-full" />
                  <div className="flex flex-col gap-[8px] px-[8px]">
                    <p className="font-montserrat font-semibold text-[16px] text-[#1c2126] px-[8px]">
                      Документация:
                    </p>
                    <div className="flex flex-col gap-[8px] px-[8px]">
                      {documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          download
                          className="flex gap-[6px] items-center"
                        >
                          <span className="bg-[#179146] rounded-[12px] w-[3px] h-[17px] shrink-0" />
                          <span className="flex gap-[4px] items-center font-manrope font-medium text-[14px] text-[#1c2126]">
                            {doc.title}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="11" cy="11" r="8" />
                              <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
        </div>
      </div>

      <RelatedProductsCarousel variants={relatedVariants} />

      <RecentlyViewedCarousel
        current={{
          id: variant.id,
          slug: variant.slug,
          sku: variant.sku,
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
