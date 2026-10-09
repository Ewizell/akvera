'use server'

import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { s3, S3_BUCKET, S3_PUBLIC_URL } from '@/lib/s3'
import { getAdminSession } from '@/lib/auth/assert-admin'
import { IMAGE_TYPES, MAX_IMAGE_BYTES, safeSubfolder } from '@/lib/s3-rules'

export async function deleteFromS3(url: string): Promise<void> {
  if (!(await getAdminSession())) return
  if (!url.startsWith(S3_PUBLIC_URL + '/')) return // не наш файл — пропускаем
  const key = url.slice(S3_PUBLIC_URL.length + 1) // +1 убирает "/"
  if (!key || key.includes('..')) return
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }))
}

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
  if (!(await getAdminSession())) return { success: false, error: 'Нет доступа' }

  const ext = IMAGE_TYPES[fileType]
  if (!ext) {
    return {
      success: false,
      error: 'Разрешены только изображения (JPEG, PNG, WebP, GIF, SVG)',
    }
  }
  const folder = safeSubfolder(subfolder)
  if (!folder) return { success: false, error: 'Некорректная папка' }

  const key = `${folder}/${randomUUID()}.${ext}`

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
  if (!(await getAdminSession())) return { success: false, error: 'Нет доступа' }

  const ext = IMAGE_TYPES[file.type]
  if (!ext) {
    return {
      success: false,
      error: 'Разрешены только изображения (JPEG, PNG, WebP, GIF, SVG)',
    }
  }
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: 'Файл пустой или больше 10 МБ' }
  }
  const folder = safeSubfolder(subfolder)
  if (!folder) return { success: false, error: 'Некорректная папка' }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const key = `${folder}/${randomUUID()}.${ext}`

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