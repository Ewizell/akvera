'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import CartPopup from './CartPopup';

export default function CartButton() {
  const {
    isOpen,
    openCart,
    closeCart,
    totalCount,
  } = useCart();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        closeCart();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener(
          'mousedown',
          handleClickOutside
        );
      };
    }
  }, [isOpen, closeCart]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() =>
          isOpen ? closeCart() : openCart()
        }
        aria-label="Открыть корзину"
        className="
          group
          flex
          min-w-[84px]
          cursor-pointer
          flex-col
          items-center
          justify-center
          gap-1
          rounded-xl
          px-2
          py-1.5
          transition-colors
          duration-200
          hover:bg-[#e2f0ef]
        "
      >
        <div className="relative">
          <Image
            src="/icons/fi-br-shopping-cart.svg"
            alt=""
            width={22}
            height={22}
            className="transition-opacity duration-200 group-hover:opacity-90"
          />

          {totalCount > 0 && (
            <span
              className="
                absolute
                -right-2
                -top-1
                inline-flex
                h-4
                min-w-4
                items-center
                justify-center
                rounded-full
                bg-accent
                px-1
                text-[10px]
                font-semibold
                leading-none
                text-white
              "
            >
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          )}
        </div>

        <span className="whitespace-nowrap text-[13px] font-medium leading-4 text-[#475569]">
          Корзина
        </span>
      </button>

      {isOpen && <CartPopup />}
    </div>
  );
}