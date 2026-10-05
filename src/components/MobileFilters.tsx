"use client";

import { useEffect, useState } from "react";

export default function MobileFilters({
  totalCount,
  children,
}: {
  totalCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Кнопка (только мобильный) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          flex h-11 w-full items-center justify-center gap-2
          rounded-xl bg-white text-sm font-medium text-[#28313d]
          lg:hidden
        "
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="10" y1="18" x2="14" y2="18" />
        </svg>
        Фильтры
        <span className="rounded-full bg-[#f0f2f4] px-2 py-0.5 text-xs text-[#66717d]">
          {totalCount}
        </span>
      </button>

      {/* Затемнение */}
      {open && (
        <div
          className="fixed inset-0 z-[70] bg-[#28313d]/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Панель: на мобильном выезжает, на lg обычный блок в потоке */}
      <div
        className={[
          open
            ? "fixed inset-y-0 left-0 z-[80] flex w-[90%] max-w-[380px] flex-col bg-[#f4f5f7]"
            : "hidden",
          "lg:static lg:z-auto lg:block lg:w-auto lg:max-w-none lg:bg-transparent",
        ].join(" ")}
      >
        {/* Шапка панели */}
        <div className="flex h-14 shrink-0 items-center justify-between bg-white px-5 lg:hidden">
          <span className="text-base font-semibold text-[#28313d]">
            Фильтры
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#66717d] hover:bg-[#f4f5f7]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Содержимое с прокруткой */}
        <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-visible">
          {children}
        </div>

        {/* Кнопка применения */}
        <div className="shrink-0 border-t border-[#e5e8eb] bg-white p-4 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="
              h-12 w-full rounded-xl bg-gradient-to-br
              from-accent to-accent-end text-sm font-medium text-white
            "
          >
            Показать товары · {totalCount}
          </button>
        </div>
      </div>
    </>
  );
}