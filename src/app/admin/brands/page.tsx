import { prisma } from '@/lib/prisma'
import BrandList from '@/components/BrandList'

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Бренды</h1>
      <BrandList brands={brands} />
    </div>
  )
}