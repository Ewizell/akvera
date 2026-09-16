'use client';

import Image from 'next/image';
import { useFavorites } from '@/lib/favorites-context';

interface FavoriteButtonWithLabelProps {
  variantId: string;
  className?: string;
}

export default function FavoriteButtonWithLabel({ variantId, className }: FavoriteButtonWithLabelProps) {
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
      className={`flex items-center gap-1 font-manrope font-medium text-[14px] ${
        active ? 'text-[#e0245e]' : 'text-[#1c2116]'
      } ${className ?? ''}`}
    >
      <Image
        src="/icons/fi-br-heart.svg"
        alt=""
        width={14}
        height={14}
        style={active ? { filter: 'invert(24%) sepia(87%) saturate(4000%) hue-rotate(340deg)' } : undefined}
      />
      {active ? 'Убрать из избранного' : 'В избранное'}
    </button>
  );
}