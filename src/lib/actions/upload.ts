'use server'

import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 МБ

export async function uploadImage(
  formData: FormData,
  subfolder: string = 'products'
): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  // Поддерживаем оба имени поля: image и file
  const file =
    (formData.get('image') as File | null) ??
    (formData.get('file') as File | null)

  if (!file || file.size === 0) {
    return {
      success: false,
      error: 'Файл не выбран',
    }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      success: false,
      error:
        'Разрешены только изображения (JPEG, PNG, WebP, GIF)',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: 'Файл слишком большой (максимум 10 МБ)',
    }
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = path.extname(file.name) || '.jpg'
  const filename = `${crypto.randomUUID()}${ext}`

  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    subfolder
  )

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, {
      recursive: true,
    })
  }

  const filePath = path.join(uploadDir, filename)

  await writeFile(filePath, buffer)

  const url = `/uploads/${subfolder}/${filename}`

  console.log('Image uploaded:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    filePath,
    url,
  })

  return {
    success: true,
    url,
  }
}
