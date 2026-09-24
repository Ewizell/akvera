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