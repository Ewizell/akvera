'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type AttrSchema = { key: string; fieldType: string }

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
        shortDescription: shortDescription || null,
        attributes,
      },
    })
    revalidatePath('/admin/products')
    revalidatePath(`/catalog/${slug}`)
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
        attributes,
      },
    })
    revalidatePath('/admin/products')
    revalidatePath(`/catalog/${slug}`)
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
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Не удалось удалить исполнение (возможно, оно есть в заказах).',
    }
  }
}