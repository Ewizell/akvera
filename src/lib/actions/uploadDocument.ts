'use server'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3, S3_BUCKET, S3_PUBLIC_URL } from '@/lib/s3'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 МБ

export async function uploadDocumentServer(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const file = formData.get('file') as File | null

  if (!file || file.size === 0) {
    return { success: false, error: 'Файл не выбран' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Файл слишком большой (максимум 20 МБ)' }
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = file.name.includes('.') ? file.name.split('.').pop() : ''
  const key = `documents/${randomUUID()}${ext ? `.${ext}` : ''}`

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    })
  )

  return { success: true, url: `${S3_PUBLIC_URL}/${key}` }
}