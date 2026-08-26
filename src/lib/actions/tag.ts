'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTags() {
  return prisma.tag.findMany({ orderBy: { name: 'asc' } })
}

export async function createTag(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string

  try {
    await prisma.tag.create({ data: { name, slug } })
    revalidatePath('/admin/tags')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Не удалось создать тег. Проверьте, что название и slug уникальны.' }
  }
}

export async function updateTag(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string

  try {
    await prisma.tag.update({ where: { id }, data: { name, slug } })
    revalidatePath('/admin/tags')
    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Не удалось сохранить. Проверьте, что название и slug уникальны.' }
  }
}

export async function deleteTag(id: string) {
  try {
    await prisma.tag.delete({ where: { id } })
    revalidatePath('/admin/tags')
    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Не удалось удалить тег.' }
  }
}