'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'

export async function createUser(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const name = (formData.get('name') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null
  const role = formData.get('role') as string

  if (!email || !password) {
    return { success: false, error: 'Укажите email и пароль' }
  }
  if (role !== 'CUSTOMER' && role !== 'ADMIN') {
    return { success: false, error: 'Некорректная роль' }
  }
  if (password.length < 8) {
    return { success: false, error: 'Пароль должен быть не короче 8 символов' }
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: { email, passwordHash, name, phone, role },
    })
    revalidatePath('/admin/users')
    return { success: true }
  } catch {
    return { success: false, error: 'Не удалось создать пользователя. Возможно, такой email уже занят.' }
  }
}

export async function updateUser(id: string, formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const name = (formData.get('name') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null
  const role = formData.get('role') as string

  if (!email) {
    return { success: false, error: 'Укажите email' }
  }
  if (role !== 'CUSTOMER' && role !== 'ADMIN') {
    return { success: false, error: 'Некорректная роль' }
  }

  const session = await auth()
  if (session?.user?.id === id && role !== 'ADMIN') {
    return { success: false, error: 'Нельзя снять роль администратора с самого себя' }
  }

  try {
    const data: Record<string, unknown> = { email, name, phone, role }
    if (password) {
      if (password.length < 8) {
        return { success: false, error: 'Пароль должен быть не короче 8 символов' }
      }
      data.passwordHash = await bcrypt.hash(password, 10)
    }

    await prisma.user.update({ where: { id }, data })
    revalidatePath('/admin/users')
    return { success: true }
  } catch {
    return { success: false, error: 'Не удалось сохранить изменения. Возможно, такой email уже занят.' }
  }
}

export async function deleteUser(id: string) {
  const session = await auth()
  if (session?.user?.id === id) {
    return { success: false, error: 'Нельзя удалить самого себя' }
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
  if (target?.role === 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    if (adminCount <= 1) {
      return { success: false, error: 'Нельзя удалить последнего администратора' }
    }
  }

  try {
    await prisma.user.delete({ where: { id } })
    revalidatePath('/admin/users')
    return { success: true }
  } catch {
    return { success: false, error: 'Не удалось удалить пользователя. Возможно, у него есть заказы.' }
  }
}