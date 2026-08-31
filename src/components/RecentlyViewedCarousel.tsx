'use client'

import { useEffect, useState } from 'react'
import { ProductCarousel, type CarouselVariant } from './ProductCarousel'
import { addRecentlyViewed, getRecentlyViewed, type RecentlyViewedItem } from '@/lib/recently-viewed'

export function RecentlyViewedCarousel({ current }: { current: RecentlyViewedItem }) {
  const [items, setItems] = useState<CarouselVariant[]>([])

  useEffect(() => {
    addRecentlyViewed(current)
    setItems(getRecentlyViewed().filter((i) => i.id !== current.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id])

  return <ProductCarousel title="Вы смотрели" variants={items} />
}