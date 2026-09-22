export type CarouselVariant = {
  id: string
  slug: string
  sku: string
  name: string
  price: number | null
  stock: number
  product: {
    name: string
  }
  images: {
    url: string
    alt: string | null
  }[]
}