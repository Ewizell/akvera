import SiteHeader from "@/components/SiteHeader";
import { CartProvider } from "@/lib/cart-context";
import { CompareProvider } from "@/lib/compare-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import YandexMetrika from "@/components/YandexMetrika";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <CompareProvider>
        <FavoritesProvider>
          <header>
            <SiteHeader />
          </header>
          <div className="flex-1">{children}</div>
          <Footer />
          <CookieConsent />
          <YandexMetrika />
        </FavoritesProvider>
      </CompareProvider>
    </CartProvider>
  );
}
export const metadata: Metadata = {
  // ...ваши текущие поля
  verification: {
    yandex: "b3cf24ac24b387b5",
    // google: "код_для_Google_Search_Console", если понадобится
  },
};