'use client';

import CardIconButton from './CardIconButton';
import { useCart } from '@/lib/cart-context';

interface RemoveFromCartButtonProps {
  variantId: string;
  className?: string;
}

export default function RemoveFromCartButton({ variantId }: RemoveFromCartButtonProps) {
  const { removeItem } = useCart();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    removeItem(variantId);
  }

  return (
    <CardIconButton
      icon="/icons/fi-rr-trash.svg"
      active={false}
      label="Удалить из корзины"
      onClick={handleClick}
    />
  );
}