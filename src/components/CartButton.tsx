'use client'

import { useEffect, useRef } from 'react'
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
        className="relative p-2 text-gray-700 hover:text-black"
        aria-label="Открыть корзину"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>
      {isOpen && <CartPopup />}
    </div>
  )
}