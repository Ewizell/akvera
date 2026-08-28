'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const parentId = formData.get('parentId') as string

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        parentId: parentId || null,
      },
    })
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Не удалось сохранить. Проверьте, что название и slug уникальны.',
    }
  }
}

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const parentId = formData.get('parentId') as string

  try {
    await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null,
      },
    })
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Не удалось создать категорию. Проверьте, что название и slug уникальны.',
    }
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Нельзя удалить категорию, у которой есть подкатегории или товары. Сначала удалите или перенесите их.',
    }
  }
}