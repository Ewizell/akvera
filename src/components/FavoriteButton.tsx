'use client';

import { useFavorites } from '@/lib/favorites-context';

interface FavoriteButtonProps {
  variantId: string;
  className?: string;
}

export default function FavoriteButton({ variantId, className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(variantId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(variantId);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      className={
        className ??
        `inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
          active
            ? 'border-red-500 bg-red-50 text-red-600'
            : 'border-gray-300 text-gray-700 hover:border-gray-400'
        }`
      }
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
      {active ? 'В избранном' : 'В избранное'}
    </button>
  );
}