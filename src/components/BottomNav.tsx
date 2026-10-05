
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Heart,
  Home,
  LayoutGrid,
  ShoppingCart,
  User,
} from "lucide-react";

import MobileMenu, {
  type MobileMenuCategory,
} from "./MobileMenu";

import { useCart } from "@/lib/cart-context";
import { useFavorites } from "@/lib/favorites-context";

type Props = {
  categories: MobileMenuCategory[];
  links: { label: string; href: string }[];
  contacts: {
    address: string;
    email: string;
    phone: string;
  };
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/35";

const tabClass = (active: boolean) =>
  `
    group
    flex
    h-16
    w-full
    flex-col
    items-center
    justify-center
    gap-1.5
    rounded-xl
    px-1
    text-[13px]
    font-medium
    transition-all
    duration-200
    ${active
      ? "bg-[#e2f0ef] text-[#179146]"
      : "text-[#475569] hover:bg-[#f3f4f6] hover:text-[#28313d]"
    }
    ${focusRing}
  `;

function TabIcon({
  children,
  count,
}: {
  children: ReactNode;
  count?: number;
}) {
  return (
    <span className="relative flex h-6 w-6 items-center justify-center">
      {children}

      {count != null && count > 0 && (
        <span
          className="
            absolute
            -right-2.5
            -top-2
            flex
            min-w-[18px]
            items-center
            justify-center
            rounded-full
            bg-[#179146]
            px-1
            text-center
            text-[10px]
            font-semibold
            leading-[18px]
            text-white
            shadow-sm
          "
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}

export default function BottomNav({
  categories,
  links,
  contacts,
}: Props) {
  const pathname = usePathname();
  const { status } = useSession();

  const [open, setOpen] = useState(false);

  const { totalCount: cartCount } = useCart();
  const { count: favoritesCount } = useFavorites();

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  // Закрываем меню при любой навигации
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";

  const isCatalog =
    pathname.startsWith("/catalog") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/brands") ||
    pathname.startsWith("/product");

  const isCart = pathname.startsWith("/cart");

  const isFavorites =
    pathname.startsWith("/favorites");

  const isProfile =
    pathname.startsWith("/account") ||
    pathname.startsWith("/login");

  const profileHref =
    status === "authenticated"
      ? "/account"
      : "/login";

  return (
    <>
      {/* =====================================================
          Нижняя навигация
      ===================================================== */}

      <nav
        aria-label="Основная навигация"
        className="
          fixed
          inset-x-0
          bottom-0
          z-50
          border-t
          border-[#dfe3e7]/70
          bg-white/85
          pb-[env(safe-area-inset-bottom)]
          shadow-[0_-4px_20px_rgba(40,49,61,0.07)]
          backdrop-blur-xl
          lg:hidden
        "
      >
        <ul
          className="
            mx-auto
            grid
            max-w-xl
            grid-cols-5
            gap-1
            px-2
            py-1.5
          "
        >
          {/* =================================================
              Главная
          ================================================= */}

          <li>
            <Link
              href="/"
              aria-current={
                isHome ? "page" : undefined
              }
              className={tabClass(isHome)}
            >
              <TabIcon>
                <Home
                  size={23}
                  strokeWidth={isHome ? 2 : 1.8}
                  className="transition-transform duration-200 group-hover:scale-[1.04]"
                />
              </TabIcon>

              <span>Главная</span>
            </Link>
          </li>

          {/* =================================================
              Каталог
          ================================================= */}

          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="mobile-menu"
              className={`${tabClass(
                open || isCatalog
              )} cursor-pointer`}
            >
              <TabIcon>
                <LayoutGrid
                  size={23}
                  strokeWidth={
                    open || isCatalog
                      ? 2
                      : 1.8
                  }
                  className="transition-transform duration-200 group-hover:scale-[1.04]"
                />
              </TabIcon>

              <span>Каталог</span>
            </button>
          </li>

          {/* =================================================
              Корзина
          ================================================= */}

          <li>
            <Link
              href="/cart"
              aria-current={
                isCart ? "page" : undefined
              }
              className={tabClass(isCart)}
            >
              <TabIcon count={cartCount}>
                <ShoppingCart
                  size={23}
                  strokeWidth={isCart ? 2 : 1.8}
                  className="transition-transform duration-200 group-hover:scale-[1.04]"
                />
              </TabIcon>

              <span>Корзина</span>
            </Link>
          </li>

          {/* =================================================
              Избранное
          ================================================= */}

          <li>
            <Link
              href="/favorites"
              aria-current={
                isFavorites ? "page" : undefined
              }
              className={tabClass(isFavorites)}
            >
              <TabIcon count={favoritesCount}>
                <Heart
                  size={23}
                  strokeWidth={
                    isFavorites ? 2 : 1.8
                  }
                  className="transition-transform duration-200 group-hover:scale-[1.04]"
                />
              </TabIcon>

              <span>Избранное</span>
            </Link>
          </li>

          {/* =================================================
              Профиль
          ================================================= */}

          <li>
            <Link
              href={profileHref}
              aria-current={
                isProfile ? "page" : undefined
              }
              className={tabClass(isProfile)}
            >
              <TabIcon>
                <User
                  size={23}
                  strokeWidth={
                    isProfile ? 2 : 1.8
                  }
                  className="transition-transform duration-200 group-hover:scale-[1.04]"
                />
              </TabIcon>

              <span>
                {status === "authenticated"
                  ? "Кабинет"
                  : "Войти"}
              </span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* =====================================================
          Мобильное меню каталога
      ===================================================== */}

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