"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  children: CategoryNode[];
};

export default function CatalogMenu({ categories }: { categories: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
<button
  onClick={() => setOpen((v) => !v)}
  className="bg-[#179146] flex gap-2 h-11 items-center justify-center px-2.5 py-3 rounded-xl text-white text-base font-semibold shrink-0"
>
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <rect y="3" width="20" height="2" rx="1" />
    <rect y="9" width="20" height="2" rx="1" />
    <rect y="15" width="20" height="2" rx="1" />
  </svg>
  Каталог
</button>

      {open && (
        <div className="absolute top-[52px] left-0 bg-white rounded-xl shadow-lg border border-gray-100 w-[280px] z-50 py-2">
          {categories.map((cat) => (
            <div key={cat.id} className="group relative">
              <Link
                href={`/category/${cat.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 text-[#475569] text-sm"
              >
                {cat.name}
                {cat.children.length > 0 && <span>›</span>}
              </Link>

              {cat.children.length > 0 && (
                <div className="hidden group-hover:block absolute left-full top-0 bg-white rounded-xl shadow-lg border border-gray-100 w-[240px] py-2">
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/category/${cat.slug}/${child.slug}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 text-[#475569] text-sm"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}