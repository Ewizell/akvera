import Link from "next/link";
import CookieSettingsButton from "@/components/CookieSettingsButton";
import { PRICE_DISCLAIMER } from "@/lib/legal-content";

export default function LegalLinks() {
  const linkCls = "transition-colors hover:text-white";

  return (
    <div className="text-xs text-white/50">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Link href="/privacy" className={linkCls}>Политика обработки персональных данных</Link>
        <Link href="/consent" className={linkCls}>Согласие на обработку персональных данных</Link>
        <Link href="/cookies" className={linkCls}>Политика cookie</Link>
        <CookieSettingsButton className={linkCls} />
      </div>
      <p className="mt-3 max-w-3xl">{PRICE_DISCLAIMER}</p>
    </div>
  );
}