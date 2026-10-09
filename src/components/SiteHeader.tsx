import Image from "next/image";
import Link from "next/link";
import SearchBox from "./SearchBox";
import CartButton from "./CartButton";
import CompareCounterButton from "./CompareCounterButton";
import FavoritesCounterButton from "./FavoritesCounterButton";
import HeaderAuthLink from "./HeaderAuthLink";
import CatalogMenu from "./CatalogMenu";
import { Phone } from "lucide-react";
import BottomNav from "./BottomNav";
import type { MobileMenuCategory } from "./MobileMenu";
import { getCategoryTree } from "@/lib/actions/category";
import { CONTACTS } from "@/lib/site-content";

const TOP_LINKS = [
  { label: "О компании", href: "/about" },
  { label: "Решения", href: "/solutions" },
  { label: "Доставка и оплата", href: "/delivery" },
  { label: "FAQ", href: "/#faq" },
  { label: "Контакты", href: "/#requisites" },
];

// Кольцо фокуса для навигации с клавиатуры
const focusRing =
  "rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

type TreeNode = {
  id: string;
  name: string;
  slug: string;
  children?: TreeNode[];
};

// Оставляем только то, что нужно мобильному меню
function toMenuCategories(nodes: TreeNode[]): MobileMenuCategory[] {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
    slug: node.slug,
    children: toMenuCategories(node.children ?? []),
  }));
}

export default async function SiteHeader() {
  const categories = await getCategoryTree();
  const menuCategories = toMenuCategories(categories);

  const phoneHref = `tel:${CONTACTS.phone.replace(/[^\d+]/g, "")}`;

  return (
    <>
      {/* =========================================================
          Шапка
          ========================================================= */}
      <header className="sticky top-0 z-50 w-full bg-white/85 shadow-[0_2px_12px_rgba(40,49,61,0.05)] backdrop-blur-md lg:fixed">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-2.5 pb-3 sm:px-6 lg:px-8 lg:py-3 xl:px-20">

          {/* =====================================================
              Верхняя информационная строка — только lg+
              ===================================================== */}
          <div className="hidden w-full items-center justify-between gap-6 lg:flex">
            <div className="flex min-w-0 items-center gap-6">

              {/* Адрес — только на очень широких экранах */}
              <div className="hidden items-center gap-1.5 min-[1400px]:flex">
                <Image
                  src="/icons/fi-br-marker.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="opacity-70"
                />

                <span className="whitespace-nowrap text-[14px] font-medium leading-none text-[#475569]">
                  {CONTACTS.address}
                </span>
              </div>

              {/* Информационные ссылки */}
              <nav
                aria-label="Информация о компании"
                className="flex items-center gap-4 whitespace-nowrap text-[14px] font-medium leading-none text-[#475569]"
              >
                {TOP_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors duration-200 hover:text-accent ${focusRing}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Контакты */}
            <div className="flex shrink-0 items-center gap-5 xl:gap-7">
              <a
                href={`mailto:${CONTACTS.email}`}
                className={`flex items-center gap-1.5 whitespace-nowrap text-[15px] font-semibold leading-none text-[#28313d] transition-colors duration-200 hover:text-accent ${focusRing}`}
              >
                <Image
                  src="/icons/fi-br-envelope.svg"
                  alt=""
                  width={17}
                  height={17}
                  className="opacity-70"
                />

                {CONTACTS.email}
              </a>

              <a
                href={phoneHref}
                className={`flex items-center gap-1.5 whitespace-nowrap text-[15px] font-semibold leading-none text-[#28313d] transition-colors duration-200 hover:text-accent ${focusRing}`}
              >
                <Image
                  src="/icons/fi-br-interrogation.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="opacity-70"
                />

                {CONTACTS.phone}
              </a>
            </div>
          </div>

          {/* =====================================================
              Основная строка
              ===================================================== */}
          <div className="relative flex w-full items-center gap-2 lg:gap-x-5 xl:gap-x-6">

            {/* ===================================================
                Логотип
                =================================================== */}
            <Link
              href="/"
              aria-label="AKVERA — главная"
              className={`shrink-0 transition-opacity duration-200 hover:opacity-80 ${focusRing}`}
            >
              {/* Мобильный логотип */}
              <Image
                src="/icons/favicon-akvera.svg"
                alt=""
                width={36}
                height={36}
                priority
                className="h-9 w-9 lg:hidden"
              />

              {/* Десктопный логотип */}
              <span className="hidden font-maven-pro text-[36px] font-bold leading-none tracking-[-0.04em] text-accent lg:block">
                AKVERA
              </span>
            </Link>

            {/* ===================================================
                Каталог — только desktop
                =================================================== */}
            <div className="hidden lg:block">
              <CatalogMenu categories={categories} />
            </div>

            {/* ===================================================
                Поиск
                =================================================== */}
            <div className="min-w-0 flex-1">
              <SearchBox />
            </div>

            {/* ===================================================
                Правая часть
                =================================================== */}
            <div className="flex shrink-0 items-center gap-1 lg:gap-1.5">

              {/* Избранное / сравнение / корзина
                  Без общей фоновой подложки */}
              <div className="hidden items-center gap-0.5 lg:flex">
                <FavoritesCounterButton />
                <CompareCounterButton />
                <CartButton />
              </div>

              {/* Телефон — только мобильные */}
              <a
                href={phoneHref}
                aria-label={`Позвонить: ${CONTACTS.phone}`}
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#e2f0ef]
                  text-[#28313d]
                  transition-colors
                  duration-200
                  hover:bg-[#179146]
                  hover:text-white
                  lg:hidden
                "
              >
                <Phone size={20} />
              </a>
            </div>

            {/* ===================================================
                Авторизация — только desktop
                =================================================== */}
            <div className="hidden shrink-0 lg:block">
              <HeaderAuthLink />
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          Нижняя панель — телефон / планшет
          ========================================================= */}
      <BottomNav
        categories={menuCategories}
        links={TOP_LINKS}
        contacts={{
          address: CONTACTS.address,
          email: CONTACTS.email,
          phone: CONTACTS.phone,
        }}
      />
    </>
  );
}