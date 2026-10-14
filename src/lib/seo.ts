// ⚠️ Задай NEXT_PUBLIC_SITE_URL в .env на проде (например https://akvera.ru) —
// иначе canonical/OG/JSON-LD будут ссылаться на дефолтный домен-заглушку.
import type { Metadata } from "next";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://akvera.ru";

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_NAME = "Akvera";

export const DEFAULT_OG_IMAGE = "/og-default.png";

export function truncate(text: string, max = 160): string {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
};

export function buildMetadata({
  title,
  description,
  path,
  image,
}: BuildMetadataInput): Metadata {
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);
  const suffix = ` | ${SITE_NAME}`;
  const pageTitle = title.endsWith(suffix)
    ? title.slice(0, -suffix.length)
    : title;
  const pageUrl = absoluteUrl(path);
  return {
    title: pageTitle,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      url: pageUrl,
      title: `${pageTitle}${suffix}`,
      description,
      siteName: SITE_NAME,
      locale: "ru_RU",
      images: [{ url: ogImage, alt: pageTitle }],
    },
  };
}
type CollectionJsonLdInput = {
  path: string;
  name: string;
  crumbs: { label: string; href?: string }[];
  itemPaths: string[];
  totalCount: number;
  offset?: number;
};

export function buildCollectionJsonLd({
  path,
  name,
  crumbs,
  itemPaths,
  totalCount,
  offset = 0,
}: CollectionJsonLdInput) {
  const pageUrl = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name,
        inLanguage: "ru-RU",
        isPartOf: {
          "@type": "WebSite",
          name: SITE_NAME,
          url: absoluteUrl("/"),
        },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: totalCount,
          itemListElement: itemPaths.map((itemPath, i) => ({
            "@type": "ListItem",
            position: offset + i + 1,
            url: absoluteUrl(itemPath),
          })),
        },
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
}