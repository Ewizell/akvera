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
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl bg-[#0f172a] p-5 text-white shadow-2xl sm:flex sm:items-center sm:gap-6"
    >
      <p className="text-sm leading-relaxed text-white/85 sm:flex-1">
        Мы используем cookie и сервис Яндекс Метрика, чтобы анализировать посещаемость и улучшать сайт. Аналитика
        включается только с вашего согласия. Подробнее в{" "}
        <Link href="/cookies" className="underline hover:text-white">
          политике cookie
        </Link>{" "}
        и{" "}
        <Link href="/privacy" className="underline hover:text-white">
          политике обработки персональных данных
        </Link>
        .
      </p>
      <div className="mt-4 flex shrink-0 gap-3 sm:mt-0">
                <button
          type="button"
          onClick={() => setConsent("accepted")}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#127a3a]"
        >
          Принять
        </button>
        <button
          type="button"
          onClick={() => setConsent("declined")}
          className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Отклонить
        </button>

      </div>
    </div>
  );
}