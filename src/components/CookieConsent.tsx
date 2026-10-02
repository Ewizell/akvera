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
        max-w-[1200px]
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.14]
        bg-[#28313d]/95
        p-4
        text-white
        shadow-[0_18px_50px_rgba(15,23,42,0.42)]
        backdrop-blur-xl
        sm:inset-x-5
        sm:bottom-5
        sm:p-5
        lg:p-6
      "
    >
      {/* Внутренний свет */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          from-white/[0.045]
          via-transparent
          to-accent/[0.035]
        "
      />

      {/* Акцентное свечение */}
      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-64
          w-64
          rounded-full
          bg-accent/[0.08]
          blur-3xl
        "
      />

      {/* Нижнее затемнение */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          left-1/3
          h-64
          w-64
          rounded-full
          bg-[#18212b]/30
          blur-3xl
        "
      />

      {/* Верхняя линия */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-white/20
          to-transparent
        "
      />

      <div className="relative flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center">
        {/* Текст */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-accent/15
                text-accent
                ring-1
                ring-accent/10
              "
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
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

            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/50">
              Cookie и аналитика
            </p>
          </div>

          <p className="mt-3 text-[13px] leading-5 text-white/75 sm:text-sm sm:leading-6">
            Мы используем cookie и сервис Яндекс Метрика, чтобы анализировать
            посещаемость и улучшать сайт. <br/>Аналитика включается только с вашего
            согласия.
          </p>

          <p className="mt-2 text-[11px] leading-5 text-white/45 sm:text-xs">
            Подробнее в{" "}
            <Link
              href="/cookies"
              className="
                text-white/70
                underline
                decoration-white/25
                underline-offset-4
                transition-colors
                duration-200
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
                text-white/70
                underline
                decoration-white/25
                underline-offset-4
                transition-colors
                duration-200
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
        <div className="flex shrink-0 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setConsent("accepted")}
            className="
              flex
              h-10
              flex-1
              items-center
              justify-center
              rounded-xl
              bg-accent
              px-4
              text-xs
              font-semibold
              text-white
              shadow-[0_4px_16px_rgba(23,145,70,0.2)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#127a3a]
              hover:shadow-[0_7px_22px_rgba(23,145,70,0.28)]
              sm:h-11
              sm:flex-none
              sm:px-6
              sm:text-sm
            "
          >
            Принять
          </button>

          <button
            type="button"
            onClick={() => setConsent("declined")}
            className="
              flex
              h-10
              flex-1
              items-center
              justify-center
              rounded-xl
              border
              border-white/15
              bg-white/[0.05]
              px-4
              text-xs
              font-medium
              text-white/75
              transition-all
              duration-300
              hover:border-white/25
              hover:bg-white/10
              hover:text-white
              sm:h-11
              sm:flex-none
              sm:px-6
              sm:text-sm
            "
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>
  );
}