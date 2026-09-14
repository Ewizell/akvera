import SiteHeader from "@/components/SiteHeader";
import { CartProvider } from "@/lib/cart-context";
import { CompareProvider } from "@/lib/compare-context";
import { FavoritesProvider } from "@/lib/favorites-context";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <CompareProvider>
        <FavoritesProvider>
          <header className="border-b">
            <SiteHeader />
          </header>
          <div className="flex-1">{children}</div>
        </FavoritesProvider>
      </CompareProvider>
    </CartProvider>
  );
}