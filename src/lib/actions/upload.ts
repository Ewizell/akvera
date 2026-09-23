'use server'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3, S3_BUCKET, S3_PUBLIC_URL } from '@/lib/s3'
import { randomUUID } from 'crypto'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

export async function deleteFromS3(url: string): Promise<void> {
  if (!url.startsWith(S3_PUBLIC_URL)) return // не наш файл — пропускаем
  const key = url.slice(S3_PUBLIC_URL.length + 1) // +1 убирает "/"
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }))
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

export async function getImageUploadUrl(
  fileName: string,
  fileType: string,
  subfolder: string = 'products'
): Promise<{
  success: boolean
  uploadUrl?: string
  url?: string
  error?: string
}> {
  if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
    return {
      success: false,
      error: 'Разрешены только изображения (JPEG, PNG, WebP, GIF)',
    }
  }

  const ext = fileName.includes('.') ? fileName.split('.').pop() : 'jpg'
  const key = `${subfolder}/${randomUUID()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: fileType,
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
  const url = `${S3_PUBLIC_URL}/${key}`

  return { success: true, uploadUrl, url }
}
export async function uploadImageServer(
  file: File,
  subfolder: string = 'products'
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'Разрешены только изображения (JPEG, PNG, WebP, GIF)',
    }
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const key = `${subfolder}/${randomUUID()}.${ext}`

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  )

  return { success: true, url: `${S3_PUBLIC_URL}/${key}` }
}