import { prisma } from '@/lib/prisma'
import CategoryList from '@/components/CategoryList'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { attributes: { orderBy: { sortOrder: 'asc' } } },
  })

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Категории</h1>
      <CategoryList categories={categories} />
    </div>
  )
}