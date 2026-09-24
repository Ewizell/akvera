'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadImageServer, deleteFromS3 } from './upload'

export async function addImage(variantId: string, formData: FormData) {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { success: false, error: 'Файл не выбран' }
  }

  const uploadResult = await uploadImageServer(file, 'products')
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

  await deleteFromS3(image.url)

  await prisma.productImage.delete({ where: { id } })

  revalidatePath('/admin/products')
  return { success: true, id }
}