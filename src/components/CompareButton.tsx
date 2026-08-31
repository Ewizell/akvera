'use client';

import { useState } from 'react';
import { useCompare, COMPARE_MAX_ITEMS } from '@/lib/compare-context';

interface CompareButtonProps {
  variantId: string;
  className?: string;
}

export default function CompareButton({ variantId, className }: CompareButtonProps) {
  const { isInCompare, toggleVariant } = useCompare();
  const [limitHit, setLimitHit] = useState(false);

  const active = isInCompare(variantId);

function handleClick(e: React.MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  const result = toggleVariant(variantId)
  if (!result.ok && result.reason === 'limit') {
    setLimitHit(true)
    setTimeout(() => setLimitHit(false), 2500)
  }
}

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        className={
          className ??
          `inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
            active
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:border-gray-400'
          }`
        }
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M7 14l4-4 3 3 5-6" />
        </svg>
        {active ? 'В сравнении' : 'Сравнить'}
      </button>
      {limitHit && (
        <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
          Можно сравнивать не больше {COMPARE_MAX_ITEMS} товаров. Уберите один, чтобы добавить новый.
        </div>
      )}
    </div>
  );
}