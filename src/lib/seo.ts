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
  const ogImage = absoluteUrl(image || "/opengraph-image");
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      siteName: SITE_NAME,
      locale: "ru_RU",
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}