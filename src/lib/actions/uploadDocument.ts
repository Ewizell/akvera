'use server'

import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 МБ

export async function uploadDocument(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const file = formData.get('file') as File | null

  if (!file || file.size === 0) {
    return { success: false, error: 'Файл не выбран' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Файл слишком большой (максимум 20 МБ)' }
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = path.extname(file.name) // пусто, если у файла нет расширения — это нормально
  const filename = `${crypto.randomUUID()}${ext}`

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents')
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  await writeFile(path.join(uploadDir, filename), buffer)

  return { success: true, url: `/uploads/documents/${filename}` }
}