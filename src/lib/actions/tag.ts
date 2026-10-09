'use server'
import { assertAdmin } from '@/lib/auth/assert-admin'

import { prisma } from '@/lib/prisma'
import { revalidateSite } from '@/lib/revalidate'

export async function getTags() {
  return prisma.tag.findMany({ orderBy: { name: 'asc' } })
}

export async function createTag(formData: FormData) {
  await assertAdmin()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string

  try {
    await prisma.tag.create({ data: { name, slug } })
    revalidateSite()
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Не удалось создать тег. Проверьте, что название и slug уникальны.' }
  }
}

export async function updateTag(id: string, formData: FormData) {
  await assertAdmin()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string

  try {
    await prisma.tag.update({ where: { id }, data: { name, slug } })
    revalidateSite()
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Не удалось сохранить. Проверьте, что название и slug уникальны.' }
  }
}

export async function deleteTag(id: string) {
  await assertAdmin()
  try {
    await prisma.tag.delete({ where: { id } })
    revalidateSite()
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Не удалось удалить тег.' }
  }
}
