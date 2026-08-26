'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createAttribute(categoryId: string, formData: FormData) {
  const key = formData.get('key') as string
  const label = formData.get('label') as string
  const fieldType = formData.get('fieldType') as string
  const unit = formData.get('unit') as string

  try {
    await prisma.categoryAttribute.create({
      data: {
        categoryId,
        key,
        label,
        fieldType,
        unit: unit || null,
      },
    })
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Такой ключ атрибута уже существует в этой категории.',
    }
  }
}

export async function updateAttribute(id: string, formData: FormData) {
  const key = formData.get('key') as string
  const label = formData.get('label') as string
  const fieldType = formData.get('fieldType') as string
  const unit = formData.get('unit') as string

  try {
    await prisma.categoryAttribute.update({
      where: { id },
      data: {
        key,
        label,
        fieldType,
        unit: unit || null,
      },
    })
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Такой ключ атрибута уже существует в этой категории.',
    }
  }
}

export async function deleteAttribute(id: string) {
  try {
    await prisma.categoryAttribute.delete({ where: { id } })
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Не удалось удалить атрибут.',
    }
  }
}