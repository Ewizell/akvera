"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import FavoriteButton from "./FavoriteButton";
import CompareButton from "./CompareButton";

export type HomeCarouselVariant = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  price: number | null;
  stock: number;
  product: { name: string };
  images: { url: string; alt: string | null }[];
};

export default function HomeProductCard({
  variant,
}: {
  variant: HomeCarouselVariant;
}) {
  const [copied, setCopied] = useState(false);
  const { addItem } = useCart();
  const image = variant.images[0];

  function copySku(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    navigator.clipboard.writeText(variant.sku);
    setCopied(true);

    setTimeout(() => setCopied(false), 1500);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      variantId: variant.id,
      productName: variant.product.name,
      variantName: variant.name,
      slug: variant.slug,
      sku: variant.sku,
      price: variant.price,
      image: image?.url ?? null,
    });
  }

  return (
    <Link
      href={`/product/${variant.slug}`}
      className="
        group
        relative
        flex
        h-full
        w-full
        cursor-pointer
        flex-col
        overflow-hidden
        rounded-2xl
        bg-white
        transition-all
        duration-300
        ease-out
        hover:-translate-y-0.5
        hover:shadow-[0_12px_35px_rgba(40,49,61,0.09)]
      "
    >
      {/* Изображение */}
      <div
        className="
          relative
          aspect-square
          w-full
          overflow-hidden
          rounded-2xl
          bg-[#f3f4f6]
        "
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? variant.name}
            fill
            className="
              object-contain
              p-3
              sm:p-5
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.04]
            "
            // Размер под реальную ширину карточки: 2,2 в ряд на телефоне,
            // 3 на планшете, 4-5 на десктопе
            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 46vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#969da5]">
            Нет фото
          </div>
        )}

        {/* Избранное / сравнение */}
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 sm:right-3 sm:top-3 sm:gap-2">
          <FavoriteButton variantId={variant.id} />
          <CompareButton variantId={variant.id} />
        </div>
      </div>

      {/* Контент */}
      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
        {/* Цена */}
        <div>
          <p className="text-lg font-semibold tracking-[-0.02em] text-[#28313d] sm:text-xl">
            {variant.price !== null
              ? `${variant.price.toLocaleString("ru-RU")} ₽`
              : "Цена по запросу"}
          </p>

          {/* Название */}
          <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-[18px] text-[#28313d] transition-colors duration-300 group-hover:text-accent sm:mt-2.5 sm:text-sm sm:leading-5">
            {variant.name || variant.product.name}
          </p>
        </div>

        {/* Нижняя часть */}
        <div className="mt-auto pt-3 sm:pt-5">
          {/* На телефоне наличие и артикул друг под другом, от sm — в одну строку */}
          <div className="flex min-w-0 flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            {/* Наличие */}
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  ${
                    variant.stock > 0
                      ? "bg-accent"
                      : "bg-[#aeb4ba]"
                  }
                `}
              />

              <p className="truncate text-[13px] font-medium text-[#767d83]">
                {variant.stock > 0
                  ? `${variant.stock} шт. на складе`
                  : "По запросу"}
              </p>
            </div>

            {/* SKU */}
            <div className="relative max-w-full min-w-0 sm:shrink-0">
              <button
                type="button"
                onClick={copySku}
                className="
                  group/sku
                  flex
                  max-w-full
                  sm:max-w-[105px]
                  cursor-pointer
                  items-center
                  gap-1
                  text-[#969da5]
                  transition-colors
                  duration-200
                  hover:text-[#28313d]
                "
                aria-label="Скопировать артикул"
              >
                <span className="truncate text-xs font-medium underline-offset-2 group-hover/sku:underline">
                  {variant.sku}
                </span>

                <Image
                  src="/icons/fi-rr-copy-alt.svg"
                  alt=""
                  width={13}
                  height={13}
                  className="shrink-0 opacity-60 transition-opacity group-hover/sku:opacity-100"
                />
              </button>

              {copied && (
                <div
                  className="
                    absolute
                    bottom-full
                    left-0
                    sm:left-auto
                    sm:right-0
                    z-20
                    mb-2
                    whitespace-nowrap
                    rounded-lg
                    bg-[#28313d]
                    px-2.5
                    py-1.5
                    text-xs
                    font-medium
                    text-white
                    shadow-lg
                  "
                >
                  Скопировано
                </div>
              )}
            </div>
          </div>

          {/* Корзина */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="
              mt-3
              sm:mt-4
              flex
              h-11
              sm:h-10
              w-full
              cursor-pointer
              items-center
              justify-center
              rounded-xl
              bg-[#116b36]
              text-sm
              font-semibold
              text-white
              shadow-[0_3px_8px_rgba(15,23,42,0.12)]
              transition-all
              duration-300
              hover:bg-[#0d572c]
              hover:shadow-[0_7px_18px_rgba(15,23,42,0.20)]
              active:bg-[#094622]
              active:shadow-[0_3px_8px_rgba(15,23,42,0.15)]
            "
          >
            В корзину
          </button>
        </div>
      </div>
    </Link>
  );
}