"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useConsent } from "@/lib/consent";

const YM_ID = process.env.NEXT_PUBLIC_YM_ID;

type YmWindow = Window & { ym?: (...args: unknown[]) => void };

function Hit() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    // первый просмотр отправляет сама инициализация счётчика
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const ym = (window as YmWindow).ym;
    if (!YM_ID || typeof ym !== "function") return;
    const qs = searchParams.toString();
    ym(Number(YM_ID), "hit", qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);

  return null;
}

export default function YandexMetrika() {
  const consent = useConsent();
  if (!YM_ID || consent !== "accepted") return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

ym(${YM_ID}, "init", {
  clickmap: true,
  trackLinks: true,
  accurateTrackBounce: true,
  webvisor: true
});
        `}
      </Script>
      <Suspense fallback={null}>
        <Hit />
      </Suspense>
    </>
  );
}