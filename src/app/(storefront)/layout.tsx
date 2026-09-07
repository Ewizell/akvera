import Link from 'next/link'
import SearchBox from '@/components/SearchBox'
import { CartProvider } from '@/lib/cart-context'
import { CompareProvider } from '@/lib/compare-context'
import CartButton from '@/components/CartButton'
import CompareCounterButton from '@/components/CompareCounterButton'
import { FavoritesProvider } from '@/lib/favorites-context'
import FavoritesCounterButton from '@/components/FavoritesCounterButton'
import HeaderAuthLink from '@/components/HeaderAuthLink'

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <CompareProvider>
        <FavoritesProvider>
        <header className="border-b">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
            <Link href="/" className="font-bold text-lg shrink-0">
              Akvera
            </Link>
            <SearchBox />
            <nav className="flex items-center gap-6 text-sm shrink-0 ml-auto">
              <Link href="/catalog" className="hover:underline">
                Каталог
              </Link>
              <Link href="/brands" className="hover:underline">
                Бренды
              </Link>
              <CompareCounterButton />
              <FavoritesCounterButton />
              <CartButton />
              <HeaderAuthLink />
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        </FavoritesProvider>
      </CompareProvider>
    </CartProvider>
  )
}