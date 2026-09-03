import { prisma } from '@/lib/prisma'
import ProductList from '@/components/ProductList'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
    include: {
      category: { include: { attributes: { orderBy: { sortOrder: 'asc' } } } },
      tags: true,
      variants: {
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          documents: true,
          tags: true,
        },
      },
    },
  })

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { attributes: { orderBy: { sortOrder: 'asc' } } },
  })

  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  })

  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  })

  const serializedProducts = products.map((p) => ({
    ...p,
    tagIds: p.tags.map((t) => t.id),
    variants: p.variants.map((v) => ({
      ...v,
      price: v.price ? Number(v.price) : null,
      tagIds: v.tags.map((t) => t.id),
    })),
  }))

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <ProductList products={serializedProducts} categories={categories} brands={brands} tags={tags} />
    </div>
  )
}