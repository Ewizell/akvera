import { prisma } from '@/lib/prisma'
import ProductList from '@/components/ProductList'

export default async function ProductsPage() {
  const [products, categories, brands, tags] =
    await Promise.all([
      prisma.product.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: {
            include: {
              attributes: true,
            },
          },
          brand: true,
          documents: {
            include: {
              document: true,
            },
          },
          variants: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              images: {
                orderBy: {
                  sortOrder: 'asc',
                },
              },
              documents: {
                include: {
                  document: true,
                },
              },
              tags: true,
            },
          },
          tags: true,
        },
      }),

      prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
        include: {
          attributes: true,
        },
      }),

      prisma.brand.findMany({
        orderBy: {
          name: 'asc',
        },
      }),

      prisma.tag.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
    ])

  const serializedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    brandId: product.brandId,
    description: product.description,
    shortDescription: product.shortDescription,
    isHidden: product.isHidden,
    applicationAreas: product.applicationAreas,
    advantages: product.advantages,

    category: {
      name: product.category.name,
      attributes: product.category.attributes.map(
        (attribute) => ({
          id: attribute.id,
          key: attribute.key,
          label: attribute.label,
          fieldType: attribute.fieldType,
          unit: attribute.unit,
        }),
      ),
    },

    documents: product.documents.map((doc) => ({
      id: doc.id,
      documentId: doc.documentId,
      document: {
        title: doc.document.title,
        type: doc.document.type,
        url: doc.document.url,
      },
    })),

    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      slug: variant.slug,

      price:
        variant.price !== null
          ? Number(variant.price)
          : null,

      stock: variant.stock,

      attributes:
        variant.attributes &&
        typeof variant.attributes === 'object'
          ? (variant.attributes as Record<string, unknown>)
          : {},

      metaTitle: variant.metaTitle,
      metaDescription: variant.metaDescription,
      metaKeywords: variant.metaKeywords,
      applicationAreas: variant.applicationAreas,
      advantages: variant.advantages,

      images: variant.images.map((image) => ({
        id: image.id,
        url: image.url,
        isMain: image.isMain,
      })),

      documents: variant.documents.map((doc) => ({
        id: doc.id,
        documentId: doc.documentId,
        document: {
          title: doc.document.title,
          type: doc.document.type,
          url: doc.document.url,
        },
      })),

      tagIds: variant.tags.map((tag) => tag.id),
    })),

    tagIds: product.tags.map((tag) => tag.id),
  }))

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#28313d]">
      <ProductList
        products={serializedProducts}
        categories={categories}
        brands={brands}
        tags={tags}
      />
    </div>
  )
}