import { ProductCarousel, type CarouselVariant } from './ProductCarousel'

export function RelatedProductsCarousel({ variants }: { variants: CarouselVariant[] }) {
  return <ProductCarousel title="Товары из этой категории" variants={variants} />
}