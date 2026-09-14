'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import CartPopup from './CartPopup'

export default function CartButton() {
  const { isOpen, openCart, closeCart, totalCount } = useCart()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeCart()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, closeCart])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => (isOpen ? closeCart() : openCart())}
        className="flex flex-col items-center justify-center gap-0.5"
        aria-label="Открыть корзину"
      >
        <div className="relative">
          <Image src="/icons/fi-br-shopping-cart.svg" alt="" width={24} height={24} />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-2 inline-flex items-center justify-center rounded-full bg-[#179146] text-white text-[10px] font-medium w-4 h-4">
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          )}
        </div>
        <span className="text-[#475569] text-sm font-medium">Корзина</span>
      </button>
      {isOpen && <CartPopup />}
    </div>
  )
}