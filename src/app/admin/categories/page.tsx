import { prisma } from '@/lib/prisma'
import CategoryList from '@/components/CategoryList'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { attributes: { orderBy: { sortOrder: 'asc' } } },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8 text-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Категории</h1>
        <CategoryList categories={categories} />
      </div>
    </div>
  )
}