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
      className="mt-6 w-full md:w-auto px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
    >
      В корзину
    </button>
  )
}