'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadImageServer } from './upload'

const MAX_LOGO_SIZE = 5 * 1024 * 1024 // 5 МБ

export async function uploadBrandLogo(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const file = formData.get('file') as File | null

  if (!file || file.size === 0) {
    return { success: false, error: 'Файл не выбран' }
  }

  if (file.size > MAX_LOGO_SIZE) {
    return { success: false, error: 'Файл слишком большой (максимум 5 МБ)' }
  }

  return uploadImageServer(file, 'brands')
}

export async function createBrand(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const logoUrl = formData.get('logoUrl') as string
  const description = formData.get('description') as string

  try {
    await prisma.brand.create({
      data: { name, slug, logoUrl: logoUrl || null, description: description || null },
    })
    revalidatePath('/admin/brands')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Не удалось создать бренд. Проверьте, что slug уникален.' }
  }
}

export async function updateBrand(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const logoUrl = formData.get('logoUrl') as string
  const description = formData.get('description') as string

  try {
    await prisma.brand.update({
      where: { id },
      data: { name, slug, logoUrl: logoUrl || null, description: description || null },
    })
    revalidatePath('/admin/brands')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Не удалось сохранить. Проверьте, что slug уникален.' }
  }
}

export async function deleteBrand(id: string) {
  try {
    await prisma.brand.delete({ where: { id } })
    revalidatePath('/admin/brands')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Не удалось удалить бренд (возможно, есть привязанные товары).' }
  }
}