'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCompare } from '@/lib/compare-context';

export default function CompareCounterButton() {
  const { count } = useCompare();

  return (
    <Link href="/compare" className="flex flex-col items-center justify-center gap-0.5">
      <div className="relative">
        <Image src="/icons/fi-br-stats.svg" alt="" width={24} height={24} />
        {count > 0 && (
          <span className="absolute -top-1 -right-2 inline-flex items-center justify-center rounded-full bg-[#179146] text-white text-[10px] font-medium w-4 h-4">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>
      <span className="text-[#475569] text-sm font-medium">Сравнение</span>
    </Link>
  );
}