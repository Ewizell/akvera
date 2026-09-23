'use client'

import { useEffect, useState } from 'react'
import { ProductCarousel, type CarouselVariant } from './ProductCarousel'
import {
  addRecentlyViewed,
  getRecentlyViewed,
  type RecentlyViewedItem,
} from '@/lib/recently-viewed'

export function RecentlyViewedCarousel({
  current,
}: {
  current: RecentlyViewedItem
}) {
  const [items, setItems] = useState<CarouselVariant[]>([])

  useEffect(() => {
    addRecentlyViewed(current)

    const recentlyViewed = getRecentlyViewed()
      .filter((item) => item.id !== current.id)
      .map((item): CarouselVariant => ({
        id: item.id,
        slug: item.slug,
        sku: item.sku,
        name: item.name,
        price: item.price,
        stock: 0,
        product: item.product,
        images: item.images,
      }))

    setItems(recentlyViewed)
  }, [current.id])

  return (
    <ProductCarousel
      title="Вы смотрели"
      variants={items}
    />
  )
}