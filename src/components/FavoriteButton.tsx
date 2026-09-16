'use client';

import CardIconButton from './CardIconButton';
import { useFavorites } from '@/lib/favorites-context';

interface FavoriteButtonProps {
  variantId: string;
  className?: string;
}

export default function FavoriteButton({ variantId }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(variantId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(variantId);
  }

  return (
    <CardIconButton
      icon="/icons/fi-br-heart.svg"
      active={active}
      activeFilter="invert(24%) sepia(87%) saturate(4000%) hue-rotate(340deg)"
      label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
      onClick={handleClick}
    />
  );
}