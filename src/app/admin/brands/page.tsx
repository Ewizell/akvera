import { prisma } from '@/lib/prisma'
import BrandList from '@/components/BrandList'

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#929aa6]">
            Каталог • Производители
          </p>

          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.02em] text-[#28313d]">
            Бренды
          </h1>

          <p className="mt-1 text-sm text-[#737d89]">
            Управление производителями, логотипами и страницами брендов
          </p>
        </div>

        <BrandList brands={brands} />
      </div>
    </div>
  )
}