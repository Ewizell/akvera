'use server'

import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 МБ

export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const file = formData.get('file') as File | null

  if (!file || file.size === 0) {
    return { success: false, error: 'Файл не выбран' }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: 'Разрешены только изображения (JPEG, PNG, WebP, GIF)' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Файл слишком большой (максимум 10 МБ)' }
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = path.extname(file.name) || '.jpg'
  const filename = `${crypto.randomUUID()}${ext}`

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  await writeFile(path.join(uploadDir, filename), buffer)

  return { success: true, url: `/uploads/products/${filename}` }
}