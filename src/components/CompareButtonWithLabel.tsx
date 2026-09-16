'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCompare, COMPARE_MAX_ITEMS } from '@/lib/compare-context';

interface CompareButtonWithLabelProps {
  variantId: string;
  className?: string;
}

export default function CompareButtonWithLabel({ variantId, className }: CompareButtonWithLabelProps) {
  const { isInCompare, toggleVariant } = useCompare();
  const [limitHit, setLimitHit] = useState(false);

  const active = isInCompare(variantId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleVariant(variantId);
    if (!result.ok && result.reason === 'limit') {
      setLimitHit(true);
      setTimeout(() => setLimitHit(false), 2500);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-1 font-manrope font-medium text-[14px] ${
          active ? 'text-[#179146]' : 'text-[#1c2116]'
        } ${className ?? ''}`}
      >
        <Image
          src="/icons/fi-br-stats.svg"
          alt=""
          width={14}
          height={14}
          style={active ? { filter: 'invert(35%) sepia(60%) saturate(1000%) hue-rotate(100deg)' } : undefined}
        />
        {active ? 'Убрать из сравнения' : 'В сравнение'}
      </button>
      {limitHit && (
        <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg font-manrope">
          Можно сравнивать не больше {COMPARE_MAX_ITEMS} товаров. Уберите один, чтобы добавить новый.
        </div>
      )}
    </div>
  );
}