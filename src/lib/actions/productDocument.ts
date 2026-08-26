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

  await prisma.productDocument.create({
    data: {
      variantId,
      title,
      type,
      url: uploadResult.url,
    },
  })

  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteDocument(id: string) {
  const doc = await prisma.productDocument.findUnique({ where: { id } })
  if (!doc) {
    return { success: false, error: 'Документ не найден' }
  }

  const filePath = path.join(process.cwd(), 'public', doc.url)
  if (existsSync(filePath)) {
    await unlink(filePath)
  }

  await prisma.productDocument.delete({ where: { id } })

  revalidatePath('/admin/products')
  return { success: true }
}