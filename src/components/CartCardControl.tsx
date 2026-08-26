'use client'

import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'

export default function CartCardControl({
  variantId,
  productName,
  slug,
  sku,
  price,
  image,
}: {
  variantId: string
  productName: string
  slug: string
  sku: string
  price: number | null
  image: string | null
}) {
  const { items, addItem, updateQuantity, removeItem } = useCart()
  const router = useRouter()
  const cartItem = items.find((i) => i.variantId === variantId)

  function stop(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  if (!cartItem) {
    return (
      <button
        onClick={(e) => {
          stop(e)
          addItem({ variantId, productName, variantName: '', slug, sku, price, image })
        }}
        className="mt-2 w-full bg-black text-white text-sm py-1.5 rounded hover:bg-gray-800 transition-colors"
      >
        В корзину
      </button>
    )
  }

  return (
    <div className="mt-2 flex items-center gap-2" onClick={stop}>
      <div className="flex items-center border rounded">
        <button
          onClick={(e) => {
            stop(e)
            if (cartItem.quantity <= 1) {
              removeItem(variantId)
            } else {
              updateQuantity(variantId, cartItem.quantity - 1)
            }
          }}
          className="px-2 py-1 text-sm hover:bg-gray-100"
        >
          −
        </button>
        <span className="px-2 text-sm min-w-[1.5rem] text-center">{cartItem.quantity}</span>
        <button
          onClick={(e) => {
            stop(e)
            updateQuantity(variantId, cartItem.quantity + 1)
          }}
          className="px-2 py-1 text-sm hover:bg-gray-100"
        >
          +
        </button>
      </div>
      <button
        onClick={(e) => {
          stop(e)
          router.push('/cart')
        }}
        className="flex-1 text-center text-xs text-blue-600 hover:underline"
      >
        В корзине
      </button>
    </div>
  )
}