import Link from "next/link";
import CookieSettingsButton from "@/components/CookieSettingsButton";
import { PRICE_DISCLAIMER } from "@/lib/legal-content";

export default function LegalLinks() {
  const linkCls =
    "text-white/55 underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-white hover:decoration-accent";

  return (
    <div className="text-xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
        <Link href="/privacy" className={linkCls}>
          Политика обработки персональных данных
        </Link>

        <Link href="/consent" className={linkCls}>
          Согласие на обработку персональных данных
        </Link>

        <Link href="/cookies" className={linkCls}>
          Политика cookie
        </Link>

        <CookieSettingsButton className={linkCls} />
      </div>

      <p className="mt-4 max-w-3xl text-[10px] leading-4 text-white/30 sm:text-xs sm:leading-5">
        {PRICE_DISCLAIMER}
      </p>
    </div>
  );
}