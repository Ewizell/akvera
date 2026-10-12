"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[1440px] flex-col items-center justify-center px-5 py-16 text-center sm:px-8 lg:px-20">
      <p className="text-[96px] font-semibold leading-none tracking-[-0.04em] text-accent sm:text-[140px]">
        500
      </p>

      <h1 className="mt-4 text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#28313d] sm:text-[30px]">
        Что-то пошло не так
      </h1>

      <p className="mt-3 max-w-md text-sm leading-6 text-[#767d83] sm:text-base">
        Страница временно недоступна. Попробуйте обновить её через минуту, а
        если ошибка повторяется, свяжитесь с нами.
      </p>

      {error.digest && (
        <p className="mt-2 text-xs text-[#969da5]">Код ошибки: {error.digest}</p>
      )}

      <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#116b36] px-6 text-sm font-semibold text-white shadow-[0_3px_8px_rgba(15,23,42,0.12)] transition-all duration-300 hover:bg-[#0d572c]"
        >
          Попробовать снова
        </button>

        <Link
          href="/"
          className="flex h-11 items-center justify-center rounded-xl bg-[#f4f5f7] px-6 text-sm font-medium text-[#28313d] transition-all duration-300 hover:bg-gradient-to-br hover:from-accent hover:to-accent-end hover:text-white"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}