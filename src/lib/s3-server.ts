import { PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { s3, S3_BUCKET, S3_PUBLIC_URL } from '@/lib/s3'
import { FILE_TYPES, MAX_FILE_BYTES, fileExt } from '@/lib/s3-rules'

export async function storeDocument(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const file = formData.get('file')

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: 'Файл не выбран' }
  }
  if (file.size > MAX_FILE_BYTES) {
    return { success: false, error: 'Файл слишком большой (максимум 20 МБ)' }
  }

  const ext = fileExt(file.name)
  const contentType = FILE_TYPES[ext]
  if (!contentType) {
    return { success: false, error: 'Неподдерживаемый формат файла' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const key = `documents/${randomUUID()}${ext}`

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )

  return { success: true, url: `${S3_PUBLIC_URL}/${key}` }
}