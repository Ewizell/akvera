'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { uploadImage } from './upload'

export async function addImage(variantId: string, formData: FormData) {
  const uploadResult = await uploadImage(formData)
  if (!uploadResult.success || !uploadResult.url) {
    return { success: false, error: uploadResult.error ?? 'Ошибка загрузки' }
  }

  const isMain = formData.get('isMain') === 'on'

  if (isMain) {
    await prisma.productImage.updateMany({
      where: { variantId },
      data: { isMain: false },
    })
  }

  const image = await prisma.productImage.create({
    data: {
      variantId,
      url: uploadResult.url,
      isMain,
    },
  })

  revalidatePath('/admin/products')
  return { success: true, image, resetMain: isMain }
}

export async function deleteImage(id: string) {
  const image = await prisma.productImage.findUnique({ where: { id } })
  if (!image) {
    return { success: false, error: 'Изображение не найдено' }
  }

  const filePath = path.join(process.cwd(), 'public', image.url)
  if (existsSync(filePath)) {
    await unlink(filePath)
  }

  await prisma.productImage.delete({ where: { id } })

  revalidatePath('/admin/products')
  return { success: true, id }
}