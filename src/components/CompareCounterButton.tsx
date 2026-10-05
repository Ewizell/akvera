'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCompare } from '@/lib/compare-context';

export default function CompareCounterButton() {
  const { count } = useCompare();

  return (
    <Link
      href="/compare"
      className="
        group
        flex
        min-w-[84px]
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
          src="/icons/fi-br-stats.svg"
          alt=""
          width={22}
          height={22}
          className="transition-opacity duration-200 group-hover:opacity-90"
        />

        {count > 0 && (
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
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>

      <span className="whitespace-nowrap text-[13px] font-medium leading-4 text-[#475569]">
        Сравнение
      </span>
    </Link>
  );
}