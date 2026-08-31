import { prisma } from '@/lib/prisma'
import BrandList from '@/components/BrandList'

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8 text-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Бренды</h1>
        <BrandList brands={brands} />
      </div>
    </div>
  )
}