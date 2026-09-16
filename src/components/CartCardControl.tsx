'use client'

import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'

export default function CartCardControl({
  variantId,
  productName,
  slug,
  sku,
  price,
  image,
  compact = false,
}: {
  variantId: string
  productName: string
  slug: string
  sku: string
  price: number | null
  image: string | null
  compact?: boolean
}) {
  const { items, addItem, updateQuantity, removeItem } = useCart()
  const router = useRouter()
  const cartItem = items.find((i) => i.variantId === variantId)

  const height = compact ? 'h-[33px]' : 'h-[33px]'
  const textSize = compact ? 'text-sm' : 'text-sm'

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
        className={`${height} w-[98px] px-2 bg-[#179146] text-white text-sm font-manrope font-medium rounded-[6px] hover:bg-[#147a3b] transition-colors cursor-pointer`}
      >
        В корзину
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2" onClick={stop}>
      <div className={`flex items-center gap-[19px] ${height} w-[98px] bg-[#eeeff1] rounded-[6px] px-2.5 shrink-0`}>
        <button
          onClick={(e) => {
            stop(e)
            if (cartItem.quantity <= 1) {
              removeItem(variantId)
            } else {
              updateQuantity(variantId, cartItem.quantity - 1)
            }
          }}
          className="shrink-0 cursor-pointer"
          aria-label="Уменьшить количество"
        >
          <Image src="/icons/fi-rr-minus-small.svg" alt="" width={20} height={20} />
        </button>
        <span className={`${textSize} font-manrope font-medium text-[#767d83] flex-1 text-center`}>
          {cartItem.quantity}
        </span>
        <button
          onClick={(e) => {
            stop(e)
            updateQuantity(variantId, cartItem.quantity + 1)
          }}
          className="shrink-0 cursor-pointer"
          aria-label="Увеличить количество"
        >
          <Image src="/icons/fi-rr-plus-small.svg" alt="" width={20} height={20} />
        </button>
      </div>
      <button
        onClick={(e) => {
          stop(e)
          router.push('/cart')
        }}
        className={`${height} px-2 flex items-center justify-center bg-[#179146] rounded-[6px] hover:bg-[#147a3b] cursor-pointer shrink-0`}
        aria-label="Перейти в корзину"
      >
        <Image src="/icons/fi-rr-arrow-right.svg" alt="" width={24} height={24} className="brightness-0 invert" />
      </button>
    </div>
  )
}