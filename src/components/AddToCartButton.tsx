'use client'

import { useCart } from '@/lib/cart-context'

export default function AddToCartButton({
  variantId,
  productName,
  variantName,
  slug,
  sku,
  price,
  image,
}: {
  variantId: string
  productName: string
  variantName: string
  slug: string
  sku: string
  price: number | null
  image: string | null
}) {
  const { addItem } = useCart()

  return (
    <button
      onClick={() => addItem({ variantId, productName, variantName, slug, sku, price, image })}
      className="w-full h-[44px] flex items-center justify-center bg-accent text-white rounded-[12px] font-montserrat font-semibold text-[16px] hover:bg-accent-hover transition-colors"
    >
      В корзину
    </button>
  )
}