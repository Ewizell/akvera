import SiteHeader from "@/components/SiteHeader";
import { CartProvider } from "@/lib/cart-context";
import { CompareProvider } from "@/lib/compare-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import YandexMetrika from "@/components/YandexMetrika";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import ScrollRail from "@/components/ScrollRail";
import { ToastProvider } from "@/lib/toast-context";
import { absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <CompareProvider>
        <FavoritesProvider>
          <ToastProvider>
            <ScrollRail />
            <SiteHeader />
            <div className="flex-1 lg:pt-[108px]">{children}</div>
            <Footer />
            {/* Место под нижнюю панель навигации, чтобы она не закрывала футер */}
            <div
              aria-hidden="true"
              className="h-[calc(4rem+env(safe-area-inset-bottom))] bg-slate-900 lg:hidden"
            />
            <FloatingActions />
            <CookieConsent />
            <YandexMetrika />
          </ToastProvider>
        </FavoritesProvider>
      </CompareProvider>
    </CartProvider>
  );
}
export const viewport = { viewportFit: "cover" as const };
export const metadata: Metadata = {
  // ...ваши текущие поля
  metadataBase: new URL(absoluteUrl("/")),
  icons: { icon: "/icons/favicon-akvera.svg" },
  verification: {
    yandex: "b3cf24ac24b387b5",
    // google: "код_для_Google_Search_Console", если понадобится
  },
  openGraph: {
    siteName: "Akvera",
    locale: "ru_RU",
    type: "website",
  },
};