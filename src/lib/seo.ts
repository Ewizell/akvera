// ⚠️ Задай NEXT_PUBLIC_SITE_URL в .env на проде (например https://akvera.ru) —
// иначе canonical/OG/JSON-LD будут ссылаться на дефолтный домен-заглушку.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://akvera.ru";

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}