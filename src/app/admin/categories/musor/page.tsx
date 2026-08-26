import { prisma } from '@/lib/prisma'
import ProductList from '@/components/ProductList'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
    include: {
      category: { include: { attributes: { orderBy: { sortOrder: 'asc' } } } },
      variants: true,
    },
  })

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { attributes: { orderBy: { sortOrder: 'asc' } } },
  })

  const serializedProducts = products.map((p) => ({
    ...p,
    variants: p.variants.map((v) => ({ ...v, price: Number(v.price) })),
  }))

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Товары</h1>
      <ProductList products={serializedProducts} categories={categories} />
    </div>
  )
}