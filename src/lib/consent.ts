import { useSyncExternalStore } from "react";

const KEY = "akvera_analytics_consent";
const EVENT = "analytics-consent-change";

// "unknown" — рендер на сервере (баннер не показываем, чтобы не мигал), "none" — решения ещё нет
export type ConsentState = "accepted" | "declined" | "none" | "unknown";

function read(): ConsentState {
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "declined" ? v : "none";
  } catch {
    return "none";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribe, read, () => "unknown" as ConsentState);
}

export function setConsent(value: "accepted" | "declined") {
  try {
    localStorage.setItem(KEY, value);
  } catch {}
  if (value === "declined") clearMetrikaCookies();
  window.dispatchEvent(new Event(EVENT));
}

// Отзыв согласия: стираем решение и куки Метрики, перезагружаем страницу,
// чтобы уже запущенный скрипт остановился
export function resetConsent() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  clearMetrikaCookies();
  window.location.reload();
}

function clearMetrikaCookies() {
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = [host, `.${host}`];
  if (parts.length > 2) domains.push(`.${parts.slice(-2).join(".")}`);

  for (const entry of document.cookie.split(";")) {
    const name = entry.split("=")[0].trim();
    if (!name.startsWith("_ym")) continue;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
  }
}