
"use client";

import Link from "next/link";
import { setConsent, useConsent } from "@/lib/consent";

export default function CookieConsent() {
  const consent = useConsent();

  if (consent !== "none") return null;

  return (
    <div
      role="dialog"
      aria-label="Использование cookie"
      className="
        fixed
        inset-x-3
        bottom-3
        z-50
        mx-auto
        max-w-4xl
        overflow-hidden
        rounded-2xl
        border
        border-white/15
        bg-[#28313d]/80
        p-4
        text-white
        shadow-[0_16px_50px_rgba(15,23,42,0.28)]
        backdrop-blur-xl
        sm:inset-x-5
        sm:bottom-5
        sm:p-5
        lg:p-6
      "
    >
      {/* Мягкие декоративные пятна */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#3d5570]/20 blur-3xl" />

      {/* Верхняя тонкая линия */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center">
        {/* Текст */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8 1.75a6.25 6.25 0 106.25 6.25A2.75 2.75 0 0111.5 5.25 2.75 2.75 0 018.75 2.5c0-.26-.03-.51-.09-.75H8z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="5.5"
                  cy="7"
                  r=".8"
                  fill="currentColor"
                />
                <circle
                  cx="8"
                  cy="10"
                  r=".8"
                  fill="currentColor"
                />
                <circle
                  cx="10.5"
                  cy="7.5"
                  r=".8"
                  fill="currentColor"
                />
              </svg>
            </span>

            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
              Cookie и аналитика
            </p>
          </div>

          <p className="mt-3 text-[13px] leading-5 text-white/70 sm:text-sm sm:leading-6">
            Мы используем cookie и сервис Яндекс Метрика, чтобы анализировать
            посещаемость и улучшать сайт. Аналитика включается только с вашего
            согласия.
          </p>

          <p className="mt-2 text-[11px] leading-5 text-white/40 sm:text-xs">
            Подробнее в{" "}
            <Link
              href="/cookies"
              className="
                text-white/65
                underline
                decoration-white/20
                underline-offset-4
                transition-colors
                hover:text-white
                hover:decoration-accent
              "
            >
              политике cookie
            </Link>{" "}
            и{" "}
            <Link
              href="/privacy"
              className="
                text-white/65
                underline
                decoration-white/20
                underline-offset-4
                transition-colors
                hover:text-white
                hover:decoration-accent
              "
            >
              политике обработки персональных данных
            </Link>
            .
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-3 lg:w-auto">
          <button
            type="button"
            onClick={() => setConsent("accepted")}
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              rounded-xl
              bg-accent
              px-6
              text-sm
              font-semibold
              text-white
              shadow-[0_4px_16px_rgba(23,145,70,0.18)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#127a3a]
              hover:shadow-[0_6px_20px_rgba(23,145,70,0.25)]
              sm:w-auto
            "
          >
            Принять
          </button>

          <button
            type="button"
            onClick={() => setConsent("declined")}
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-white/15
              bg-white/[0.04]
              px-6
              text-sm
              font-medium
              text-white/70
              backdrop-blur-sm
              transition-all
              duration-300
              hover:border-white/25
              hover:bg-white/10
              hover:text-white
              sm:w-auto
            "
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>
  );
}