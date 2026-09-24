import { prisma } from '@/lib/prisma';
import { resolveCategory, resolveBrand, uniqueVariantSlug, downloadAndSaveImage } from './helpers';
import type { ImportRow, ImportResultRow, ImportOptions } from './types';

export async function importRow(row: ImportRow, opts: ImportOptions): Promise<ImportResultRow> {
  if (!row.sku) return { sku: row.externalId || '—', status: 'skipped', message: 'нет SKU' };
  if (!row.categoryPath.length) return { sku: row.sku, status: 'skipped', message: 'нет категории' };

  try {
    const categoryId = await resolveCategory(row.categoryPath);
    if (!categoryId) return { sku: row.sku, status: 'skipped', message: 'не удалось определить категорию' };
    const brandId = await resolveBrand(row.brandName);
    const shortDescription = row.shortDescription?.slice(0, 200);

    const existing = await prisma.productVariant.findUnique({ where: { sku: row.sku } });

    if (!existing && opts.mode === 'update-only') {
      return { sku: row.sku, status: 'skipped', message: 'товар не найден в базе — создание пропущено (режим "только обновление")' };
    }
    if (existing && opts.mode === 'create-only') {
      return { sku: row.sku, status: 'skipped', message: 'товар уже есть в базе — обновление пропущено (режим "только добавление новых")' };
    }

    if (existing) {
      await prisma.product.update({
        where: { id: existing.productId },
        data: { name: row.name, categoryId, brandId, description: row.description, shortDescription },
      });
      await prisma.productVariant.update({
        where: { id: existing.id },
        data: {
          name: row.name,
          price: row.price ?? null,
          metaTitle: row.metaTitle,
          metaDescription: row.metaDescription,
          metaKeywords: row.metaKeywords,
        },
      });

      if (opts.downloadImages && row.imageUrl) {
        const mainImage = await prisma.productImage.findFirst({
          where: { variantId: existing.id, isMain: true },
        });

        if (!mainImage) {
          const localUrl = await downloadAndSaveImage(row.imageUrl);
          if (localUrl) {
            await prisma.productImage.create({ data: { variantId: existing.id, url: localUrl, isMain: true } });
          }
        } else if (opts.updateImages) {
          const localUrl = await downloadAndSaveImage(row.imageUrl);
          if (localUrl) {
            await deleteFromS3(mainImage.url);
            await prisma.productImage.update({
              where: { id: mainImage.id },
              data: { url: localUrl },
            });
          }
        }
      }
      return { sku: row.sku, status: 'updated' };
    }

    const slug = await uniqueVariantSlug(row.name, row.sku);
    const product = await prisma.product.create({
      data: { name: row.name, categoryId, brandId, description: row.description, shortDescription },
    });
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: row.name,
        sku: row.sku,
        slug,
        price: row.price ?? null,
        stock: opts.defaultStock,
        attributes: {},
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        metaKeywords: row.metaKeywords,
      },
    });

    if (opts.downloadImages && row.imageUrl) {
      const localUrl = await downloadAndSaveImage(row.imageUrl);
      if (localUrl) {
        await prisma.productImage.create({ data: { variantId: variant.id, url: localUrl, isMain: true } });
      }
    }
    return { sku: row.sku, status: 'created' };
  } catch (e) {
    return { sku: row.sku, status: 'error', message: e instanceof Error ? e.message : String(e) };
  }
}