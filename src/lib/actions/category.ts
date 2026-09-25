'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadImageServer } from '@/lib/actions/upload'

type CategoryNode = {
  id: string
  name: string
  slug: string
  iconUrl: string | null
  productCount: number
  children: CategoryNode[]
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const parentId = formData.get('parentId') as string

  try {
    let imageUrl: string | undefined
    let iconUrl: string | undefined

    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadImageServer(imageFile, 'categories')
      if (uploadResult.success) {
        imageUrl = uploadResult.url
      }
    }

    const iconFile = formData.get('icon') as File | null
    if (iconFile && iconFile.size > 0) {
      const uploadResult = await uploadImageServer(iconFile, 'category-icons')
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error ?? 'Не удалось загрузить иконку' }
      }
      iconUrl = uploadResult.url
    }

    const isHidden = formData.get('isHidden') === 'on'

    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        isHidden,
        parent: parentId ? { connect: { id: parentId } } : { disconnect: true },
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(iconUrl !== undefined ? { iconUrl } : {}),
      },
    })

    revalidatePath('/admin/categories')
    revalidatePath('/catalog')
    revalidatePath('/category', 'layout')

    return { success: true }
  } catch (error) {
    console.error('updateCategory error:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка сохранения.',
    }
  }
}

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const parentId = formData.get('parentId') as string

  try {
    let imageUrl: string | undefined
    let iconUrl: string | undefined

    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadImageServer(imageFile, 'categories')
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error ?? 'Не удалось загрузить изображение' }
      }
      imageUrl = uploadResult.url
    }

    const iconFile = formData.get('icon') as File | null
    if (iconFile && iconFile.size > 0) {
      const uploadResult = await uploadImageServer(iconFile, 'category-icons')
      if (uploadResult.success) {
        iconUrl = uploadResult.url
      }
    }

    const isHidden = formData.get('isHidden') === 'on'

    await prisma.category.create({
      data: {
        name,
        slug,
        isHidden,
        ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(iconUrl !== undefined ? { iconUrl } : {}),
      },
    })

    revalidatePath('/admin/categories')
    revalidatePath('/catalog')
    revalidatePath('/category', 'layout')

    return { success: true }
  } catch (error) {
    console.error('createCategory error:', error)

    return {
      success: false,
      error:
        'Не удалось создать категорию. Проверьте, что название и slug уникальны.',
    }
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    })

    revalidatePath('/admin/categories')
    revalidatePath('/catalog')
    revalidatePath('/category', 'layout')

    return { success: true }
  } catch (error) {
    console.error('deleteCategory error:', error)

    return {
      success: false,
      error:
        'Нельзя удалить категорию, у которой есть подкатегории или товары. Сначала удалите или перенесите их.',
    }
  }
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const categories = await prisma.category.findMany({
    where: {
      isHidden: false,
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      iconUrl: true,
      _count: { select: { products: true } },
    },
  })

  const byId = new Map<string, CategoryNode>(
    categories.map((c) => [
      c.id,
      {
        id: c.id,
        name: c.name,
        slug: c.slug,
        iconUrl: c.iconUrl,
        productCount: c._count.products,
        children: [],
      },
    ])
  )

  const roots: CategoryNode[] = []

  for (const category of categories) {
    const node = byId.get(category.id)!

    // родитель тоже мог быть скрыт и потому отсутствовать в выборке —
    // такой узел просто не попадёт в дерево вообще
    if (category.parentId) {
      byId.get(category.parentId)?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
export async function toggleCategoryHidden(id: string, isHidden: boolean) {
  await prisma.category.update({ where: { id }, data: { isHidden } })
  revalidatePath('/admin/categories')
  revalidatePath('/catalog')
  revalidatePath('/category', 'layout')
  return { success: true }
}