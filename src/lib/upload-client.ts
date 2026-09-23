'use client'

import { getImageUploadUrl } from '@/lib/actions/upload'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 МБ — проверка теперь тут

export async function uploadImageToS3(
  file: File,
  subfolder: string = 'products'
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!file || file.size === 0) {
    return { success: false, error: 'Файл не выбран' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Файл слишком большой (максимум 10 МБ)' }
  }

  const { success, uploadUrl, url, error } = await getImageUploadUrl(file.name, file.type, subfolder)
  if (!success || !uploadUrl) {
    return { success: false, error: error ?? 'Не удалось получить ссылку для загрузки' }
  }

  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!putRes.ok) {
    return { success: false, error: 'Ошибка загрузки в хранилище' }
  }

  return { success: true, url }
}