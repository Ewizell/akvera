"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Heart, Home, LayoutGrid, ShoppingCart, User } from "lucide-react";

import MobileMenu, { type MobileMenuCategory } from "./MobileMenu";
import { useCart } from "@/lib/cart-context";
import { useFavorites } from "@/lib/favorites-context"; // TODO: проверьте путь

type Props = {
  categories: MobileMenuCategory[];
  links: { label: string; href: string }[];
  contacts: { address: string; email: string; phone: string };
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40";

const tabClass = (active: boolean) =>
  `flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
    active ? "text-accent" : "text-slate-500"
  } ${focusRing}`;

function TabIcon({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <span className="relative">
      {children}
      {count != null && count > 0 && (
        <span className="absolute -right-2.5 -top-1.5 min-w-[18px] rounded-full bg-accent px-1 text-center text-[10px] font-semibold leading-[18px] text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}

export default function BottomNav({ categories, links, contacts }: Props) {
  const pathname = usePathname();
  const { status } = useSession();

  const [open, setOpen] = useState(false);

  const { totalCount: cartCount } = useCart();
  const { count: favoritesCount } = useFavorites();

  const close = useCallback(() => setOpen(false), []);

  // Закрываем меню при любой навигации
  useEffect(() => setOpen(false), [pathname]);

  const isHome = pathname === "/";
  const isCatalog =
    pathname.startsWith("/catalog") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/brands") ||
    pathname.startsWith("/product");
  const isCart = pathname.startsWith("/cart");
  const isFavorites = pathname.startsWith("/favorites");
  const isProfile =
    pathname.startsWith("/account") || pathname.startsWith("/login");

  const profileHref = status === "authenticated" ? "/account" : "/login";

  return (
    <>
      <nav
        aria-label="Основная навигация"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(15,23,42,0.06)] lg:hidden"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          <li>
            <Link
              href="/"
              aria-current={isHome ? "page" : undefined}
              className={tabClass(isHome)}
            >
              <TabIcon>
                <Home size={24} />
              </TabIcon>
              Главная
            </Link>
          </li>

          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="mobile-menu"
              className={tabClass(open || isCatalog)}
            >
              <TabIcon>
                <LayoutGrid size={24} />
              </TabIcon>
              Каталог
            </button>
          </li>

          <li>
            <Link
              href="/cart"
              aria-current={isCart ? "page" : undefined}
              className={tabClass(isCart)}
            >
              <TabIcon count={cartCount}>
                <ShoppingCart size={24} />
              </TabIcon>
              Корзина
            </Link>
          </li>

          <li>
            <Link
              href="/favorites"
              aria-current={isFavorites ? "page" : undefined}
              className={tabClass(isFavorites)}
            >
              <TabIcon count={favoritesCount}>
                <Heart size={24} />
              </TabIcon>
              Избранное
            </Link>
          </li>

          <li>
            <Link
              href={profileHref}
              aria-current={isProfile ? "page" : undefined}
              className={tabClass(isProfile)}
            >
              <TabIcon>
                <User size={24} />
              </TabIcon>
              {status === "authenticated" ? "Кабинет" : "Войти"}
            </Link>
          </li>
        </ul>
      </nav>

      <MobileMenu
        open={open}
        onClose={close}
        categories={categories}
        links={links}
        contacts={contacts}
      />
    </>
  );
}