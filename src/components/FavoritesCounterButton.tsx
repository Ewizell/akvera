'use client';

import Link from 'next/link';
import { useFavorites } from '@/lib/favorites-context';

export default function FavoritesCounterButton() {
  const { count } = useFavorites();

  return (
    <Link href="/favorites" className="relative inline-flex items-center gap-1.5 hover:underline">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
      Избранное
      {count > 0 && (
        <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-xs w-5 h-5">
          {count}
        </span>
      )}
    </Link>
  );
}