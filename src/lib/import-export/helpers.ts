import { prisma } from '@/lib/prisma'; // поправь путь под свой клиент, если он называется иначе
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'item';
}

async function uniqueSlug(name: string, check: (slug: string) => Promise<boolean>): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let i = 1;
  while (await check(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function resolveCategory(pathParts: string[]): Promise<string | null> {
  if (!pathParts.length) return null;
  let parentId: string | null = null;
  let categoryId: string | null = null;

  for (const name of pathParts) {
    let cat: import('@/generated/prisma/client').Category | null = await prisma.category.findFirst({ where: { name, parentId } });
    if (!cat) {
      const slug = await uniqueSlug(name, async (s) => !!(await prisma.category.findUnique({ where: { slug: s } })));
      cat = await prisma.category.create({ data: { name, slug, parentId } });
    }
    parentId = cat.id;
    categoryId = cat.id;
  }
  return categoryId;
}

export async function resolveBrand(name?: string): Promise<string | undefined> {
  const trimmed = name?.trim();
  if (!trimmed) return undefined;

  let brand = await prisma.brand.findFirst({ where: { name: { equals: trimmed, mode: 'insensitive' } } });
  if (!brand) {
    const slug = await uniqueSlug(trimmed, async (s) => !!(await prisma.brand.findUnique({ where: { slug: s } })));
    brand = await prisma.brand.create({ data: { name: trimmed, slug } });
  }
  return brand.id;
}

export async function uniqueVariantSlug(name: string, sku: string): Promise<string> {
  return uniqueSlug(`${name}-${sku}`, async (s) => !!(await prisma.productVariant.findUnique({ where: { slug: s } })));
}

export async function downloadAndSaveImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = path.extname(new URL(url).pathname) || '.jpg';
    const filename = `${randomUUID()}${ext}`;
    const dir = path.join(process.cwd(), 'public', 'uploads', 'products');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    return `/uploads/products/${filename}`;
  } catch (e) {
    console.error('Не удалось скачать изображение:', url, e);
    return null;
  }
}