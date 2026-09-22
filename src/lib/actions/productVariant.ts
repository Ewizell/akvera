'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type AttrSchema = { key: string; fieldType: string }

function parseStringList(formData: FormData, name: string): string[] {
  const raw = formData.get(name) as string | null
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.map((s) => String(s).trim()).filter(Boolean) : []
  } catch {
    return []
  }
}

function parseAttributes(formData: FormData): Record<string, unknown> {
  const schemaJson = formData.get('attrsSchema') as string
  const result: Record<string, unknown> = {}

  if (schemaJson) {
    const schema: AttrSchema[] = JSON.parse(schemaJson)
    for (const { key, fieldType } of schema) {
      const raw = formData.get(`attr_${key}`)
      if (raw === null || raw === '') continue

      if (fieldType === 'number') {
        result[key] = parseFloat(raw as string)
      } else if (fieldType === 'boolean') {
        result[key] = raw === 'on' || raw === 'true'
      } else {
        result[key] = raw as string
      }
    }
  }

  const customJson = formData.get('customAttributes') as string
  if (customJson) {
    try {
      const custom = JSON.parse(customJson) as { label: string; value: string }[]
      if (custom.length > 0) {
        result.customAttributes = custom
      }
    } catch {
      // некорректный JSON — просто игнорируем
    }
  }

  return result
}

export async function createVariant(productId: string, formData: FormData) {
  const name = formData.get('name') as string
  const sku = formData.get('sku') as string
  const slug = formData.get('slug') as string
  const price = formData.get('price') as string
  const stock = formData.get('stock') as string
  const metaTitle = formData.get('metaTitle') as string
  const metaDescription = formData.get('metaDescription') as string
  const metaKeywords = formData.get('metaKeywords') as string
  const attributes = parseAttributes(formData)
  const variantTagIds = formData.getAll('variantTagIds') as string[]
  const applicationAreas = parseStringList(formData, 'applicationAreas')
  const advantages = parseStringList(formData, 'advantages')

  try {
    await prisma.productVariant.create({
      data: {
        productId,
        name,
        sku,
        slug,
        price: price ? parseFloat(price) : null,
        stock: parseInt(stock, 10) || 0,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
        tags: { connect: variantTagIds.map((tagId) => ({ id: tagId })) },
        applicationAreas,
        advantages,
        attributes: attributes as import('@/generated/prisma/client').Prisma.InputJsonObject,
      },
    })
    revalidatePath('/admin/products')
    revalidatePath(`/product/${slug}`)
    revalidatePath('/category', 'layout')
    revalidatePath('/catalog')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Не удалось создать исполнение. Проверьте, что артикул и slug уникальны.',
    }
  }
}

export async function updateVariant(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const sku = formData.get('sku') as string
  const slug = formData.get('slug') as string
  const price = formData.get('price') as string
  const stock = formData.get('stock') as string
  const metaTitle = formData.get('metaTitle') as string
  const metaDescription = formData.get('metaDescription') as string
  const metaKeywords = formData.get('metaKeywords') as string
  const attributes = parseAttributes(formData)
  const variantTagIds = formData.getAll('variantTagIds') as string[]
  const applicationAreas = parseStringList(formData, 'applicationAreas')
  const advantages = parseStringList(formData, 'advantages')

  try {
    await prisma.productVariant.update({
      where: { id },
      data: {
        name,
        sku,
        slug,
        price: price ? parseFloat(price) : null,
        stock: parseInt(stock, 10) || 0,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        tags: { set: variantTagIds.map((tagId) => ({ id: tagId })) },
        metaKeywords: metaKeywords || null,
        applicationAreas,
        advantages,
        attributes: attributes as import('@/generated/prisma/client').Prisma.InputJsonObject,
      },
    })
    revalidatePath('/admin/products')
    revalidatePath(`/product/${slug}`)
    revalidatePath('/category', 'layout')
    revalidatePath('/catalog')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Не удалось сохранить. Проверьте, что артикул и slug уникальны.',
    }
  }
}

export async function deleteVariant(id: string) {
  try {
    await prisma.productVariant.delete({ where: { id } })
    revalidatePath('/admin/products')
    revalidatePath('/category', 'layout')
    revalidatePath('/catalog')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Не удалось удалить исполнение (возможно, оно есть в заказах).',
    }
  }
}

export async function duplicateVariant(id: string) {
  try {
    const source = await prisma.productVariant.findUnique({
      where: { id },
      include: { images: true, documents: true, tags: true },
    })

    if (!source) {
      return { success: false, error: 'Исполнение не найдено' }
    }

    const suffix = Date.now().toString(36)

    await prisma.productVariant.create({
      data: {
        productId: source.productId,
        name: `${source.name} (копия)`,
        sku: `${source.sku}-copy-${suffix}`,
        slug: `${source.slug}-copy-${suffix}`,
        price: source.price,
        stock: source.stock,
        attributes: source.attributes as object,
        applicationAreas: source.applicationAreas,
        advantages: source.advantages,
        metaTitle: source.metaTitle,
        metaDescription: source.metaDescription,
        metaKeywords: source.metaKeywords,
        tags: { connect: source.tags.map((t) => ({ id: t.id })) },
        images: {
          create: source.images.map((img) => ({
            url: img.url,
            isMain: img.isMain,
            sortOrder: img.sortOrder,
          })),
        },
        documents: {
          create: source.documents.map((doc) => ({
            documentId: doc.documentId,
            sortOrder: doc.sortOrder,
          })),
        },
      },
    })

    revalidatePath('/admin/products')
    revalidatePath('/category', 'layout')
    revalidatePath('/catalog')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Не удалось скопировать исполнение.' }
  }
}