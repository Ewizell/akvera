'use server'
import { assertAdmin } from '@/lib/auth/assert-admin'
import { prisma } from '@/lib/prisma'
import { revalidateSite } from '@/lib/revalidate'
import { uploadImageServer } from './upload'

const MAX_LOGO_SIZE = 5 * 1024 * 1024 // 5 МБ

export async function uploadBrandLogo(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  await assertAdmin()

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
  await assertAdmin()

  const name = (formData.get('name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim()
  const logoUrl = formData.get('logoUrl') as string
  const description = formData.get('description') as string

  if (!name || !slug) {
    return { success: false, error: 'Укажите название и slug' }
  }

  try {
    await prisma.brand.create({
      data: { name, slug, logoUrl: logoUrl || null, description: description || null },
    })
    revalidateSite()
    return { success: true }
  } catch {
    return { success: false, error: 'Не удалось создать бренд. Проверьте, что slug уникален.' }
  }
}

export async function updateBrand(id: string, formData: FormData) {
  await assertAdmin()

  const name = (formData.get('name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim()
  const logoUrl = formData.get('logoUrl') as string
  const description = formData.get('description') as string

  if (!name || !slug) {
    return { success: false, error: 'Укажите название и slug' }
  }

  try {
    await prisma.brand.update({
      where: { id },
      data: { name, slug, logoUrl: logoUrl || null, description: description || null },
    })
    revalidateSite()
    return { success: true }
  } catch {
    return { success: false, error: 'Не удалось сохранить. Проверьте, что slug уникален.' }
  }
}

export async function deleteBrand(id: string) {
  await assertAdmin()

  try {
    await prisma.brand.delete({ where: { id } })
    revalidateSite()
    return { success: true }
  } catch {
    return { success: false, error: 'Не удалось удалить бренд (возможно, есть привязанные товары).' }
  }
}