'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { uploadDocument } from './uploadDocument'

export async function addDocument(variantId: string, formData: FormData) {
  const uploadResult = await uploadDocument(formData)
  if (!uploadResult.success || !uploadResult.url) {
    return { success: false, error: uploadResult.error ?? 'Ошибка загрузки' }
  }

  const title = formData.get('title') as string
  const type = formData.get('type') as string

  const document = await prisma.document.create({
    data: { title, type, url: uploadResult.url },
  })
  await prisma.productVariantDocument.create({
    data: { variantId, documentId: document.id },
  })

  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteDocument(id: string) {
  const join = await prisma.productVariantDocument.findUnique({
    where: { id },
    include: {
      document: {
        include: { _count: { select: { products: true, variants: true } } },
      },
    },
  })
  if (!join) {
    return { success: false, error: 'Документ не найден' }
  }

  await prisma.productVariantDocument.delete({ where: { id } })
  if (join.document._count.products === 0 && join.document._count.variants === 1) {
    const filePath = path.join(process.cwd(), 'public', join.document.url)
    if (existsSync(filePath)) {
      await unlink(filePath)
    }
    await prisma.document.delete({ where: { id: join.document.id } })
  }

  revalidatePath('/admin/products')
  return { success: true }
}