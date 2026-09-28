"use client";

import { resetConsent } from "@/lib/consent";

export default function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={resetConsent} className={className}>
      Настройки cookie
    </button>
  );
}