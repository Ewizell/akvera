'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadDocumentServer } from './uploadDocument'
import { deleteFromS3 } from './upload'

// --- Медиатека: сама сущность Document ---

export async function createDocument(formData: FormData) {
  const uploadResult = await uploadDocumentServer(formData)
  if (!uploadResult.success || !uploadResult.url) {
    return { success: false, error: uploadResult.error ?? 'Ошибка загрузки' }
  }

  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const tagsRaw = formData.get('tags') as string // CSV: "паспорт,котлы"
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : []

  const document = await prisma.document.create({
    data: { title, type, url: uploadResult.url, tags },
  })

  revalidatePath('/admin/documents')
  return { success: true, document }
}

export async function updateDocument(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : []

  await prisma.document.update({ where: { id }, data: { title, type, tags } })
  revalidatePath('/admin/documents')
  return { success: true }
}

export async function deleteDocument(id: string) {
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { _count: { select: { products: true, variants: true } } },
  })

  if (!doc) return { success: false, error: 'Документ не найден' }

  if (doc._count.products > 0 || doc._count.variants > 0) {
    return {
      success: false,
      error: `Документ используется в ${doc._count.products} товар(ах) и ${doc._count.variants} исполнени(ях). Сначала отвяжите его.`,
    }
  }

  await deleteFromS3(doc.url)

  await prisma.document.delete({ where: { id } })
  revalidatePath('/admin/documents')
  return { success: true }
}

export async function listDocuments(query?: string) {
  return prisma.document.findMany({
    where: query
      ? { OR: [{ title: { contains: query, mode: 'insensitive' } }, { tags: { has: query } }] }
      : undefined,
    include: { _count: { select: { products: true, variants: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

// --- Привязка к товару (Product) ---

export async function attachDocumentToProduct(productId: string, documentId: string) {
  const join = await prisma.productDocument.upsert({
    where: { productId_documentId: { productId, documentId } },
    create: { productId, documentId },
    update: {},
    include: { document: true },
  })
  revalidatePath('/admin/products')
  return {
    success: true,
    item: { joinId: join.id, documentId: join.documentId, title: join.document.title, type: join.document.type, url: join.document.url },
  }
}

export async function uploadAndAttachToProduct(productId: string, formData: FormData) {
  const result = await createDocument(formData)
  if (!result.success || !result.document) return { success: false, error: result.error }
  return attachDocumentToProduct(productId, result.document.id)
}

export async function detachDocumentFromProduct(productDocumentId: string) {
  await prisma.productDocument.delete({ where: { id: productDocumentId } })
  revalidatePath('/admin/products')
  return { success: true }
}

// --- Привязка к исполнению (ProductVariant) ---

export async function attachDocumentToVariant(variantId: string, documentId: string) {
  const join = await prisma.productVariantDocument.upsert({
    where: { variantId_documentId: { variantId, documentId } },
    create: { variantId, documentId },
    update: {},
    include: { document: true },
  })
  revalidatePath('/admin/products')
  return {
    success: true,
    item: { joinId: join.id, documentId: join.documentId, title: join.document.title, type: join.document.type, url: join.document.url },
  }
}

export async function uploadAndAttachToVariant(variantId: string, formData: FormData) {
  const result = await createDocument(formData)
  if (!result.success || !result.document) return { success: false, error: result.error }
  return attachDocumentToVariant(variantId, result.document.id)
}

export async function detachDocumentFromVariant(variantDocumentId: string) {
  await prisma.productVariantDocument.delete({ where: { id: variantDocumentId } })
  revalidatePath('/admin/products')
  return { success: true }
}