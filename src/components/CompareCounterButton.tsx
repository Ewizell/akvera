'use client';

import Link from 'next/link';
import { useCompare } from '@/lib/compare-context';

export default function CompareCounterButton() {
  const { count } = useCompare();

  return (
    <Link href="/compare" className="relative inline-flex items-center gap-1.5 hover:underline">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 3 3 5-6" />
      </svg>
      Сравнить
      {count > 0 && (
        <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-xs w-5 h-5">
          {count}
        </span>
      )}
    </Link>
  );
}