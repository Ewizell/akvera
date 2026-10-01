import Image from "next/image";
import Link from "next/link";
import SearchBox from "./SearchBox";
import CartButton from "./CartButton";
import CompareCounterButton from "./CompareCounterButton";
import FavoritesCounterButton from "./FavoritesCounterButton";
import HeaderAuthLink from "./HeaderAuthLink";
import CatalogMenu from "./CatalogMenu";
import { getCategoryTree } from "@/lib/actions/category";
import { CONTACTS } from "@/lib/site-content";

const TOP_LINKS = [
  { label: "О компании", href: "/about" },
  { label: "Доставка и оплата", href: "/#delivery" },
  { label: "FAQ", href: "/#faq" },
  { label: "Контакты и реквизиты", href: "/#requisites" },
];

// Кольцо фокуса для навигации с клавиатуры
const focusRing =
  "rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export default async function SiteHeader() {
  const categories = await getCategoryTree();

  return (
    <div className="fixed top-0 z-50 w-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
      {/* =========================================================
          DESKTOP
          ========================================================= */}
      <div className="mx-auto hidden max-w-[1440px] flex-col items-start justify-center gap-3 px-20 py-3 md:flex">

        {/* Верхний ряд */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-[27px]">
            {/* Адрес */}
            <div className="flex items-center gap-1.5">
              <Image
                src="/icons/fi-br-marker.svg"
                alt=""
                width={16}
                height={16}
              />

              <span className="whitespace-nowrap text-base font-semibold leading-none text-[#475569]">
                {CONTACTS.address}
              </span>
            </div>

            {/* Информационные ссылки */}
            <nav
              aria-label="Информация о компании"
              className="flex items-center gap-3 whitespace-nowrap text-[14px] font-medium leading-none text-[#475569]"
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
          <div className="flex items-center gap-8">
            <a
              href={`mailto:${CONTACTS.email}`}
              className={`flex items-center gap-1.5 whitespace-nowrap text-lg font-bold leading-none text-[#475569] transition-colors duration-200 hover:text-accent ${focusRing}`}
            >
              <Image
                src="/icons/fi-br-envelope.svg"
                alt=""
                width={18}
                height={18}
              />

              {CONTACTS.email}
            </a>

            <a
              href={`tel:${CONTACTS.phone.replace(/[^\d+]/g, "")}`}
              className={`flex items-center gap-1.5 whitespace-nowrap text-base font-semibold leading-none text-[#475569] transition-colors duration-200 hover:text-accent ${focusRing}`}
            >
              <Image
                src="/icons/fi-br-interrogation.svg"
                alt=""
                width={16}
                height={16}
              />

              {CONTACTS.phone}
            </a>
          </div>
        </div>

        {/* Центральный ряд */}
        <div className="relative flex w-full items-center gap-8">
          {/* Логотип */}
          <Link
            href="/"
            className={`shrink-0 font-maven-pro text-[40px] font-bold text-accent transition-opacity duration-200 hover:opacity-80 ${focusRing}`}
          >
            AKVERA
          </Link>

          {/* Каталог */}
          <CatalogMenu categories={categories} />

          {/* Поиск */}
          <SearchBox />

          {/* Избранное / сравнение / корзина */}
          <div className="flex shrink-0 items-center gap-3">
            <FavoritesCounterButton />
            <CompareCounterButton />
            <CartButton />
          </div>

          {/* Авторизация */}
          <HeaderAuthLink />
        </div>
      </div>

      {/* =========================================================
          MOBILE
          ========================================================= */}
      <div className="md:hidden">
        <div className="px-4 py-3">

          {/* Верхняя мобильная строка */}
          <div className="flex w-full items-center justify-between gap-3">

            {/* Логотип */}
            <Link
              href="/"
              aria-label="AKVERA — главная"
              className={`shrink-0 font-maven-pro text-[28px] font-bold leading-none text-accent transition-opacity duration-200 hover:opacity-80 ${focusRing}`}
            >
              AKVERA
            </Link>

            {/* Избранное / сравнение / корзина */}
            <div className="flex shrink-0 items-center gap-1.5">
              <FavoritesCounterButton />
              <CompareCounterButton />
              <CartButton />
            </div>
          </div>

          {/* Поиск */}
          <div className="mt-3 w-full">
            <SearchBox />
          </div>

          {/* Каталог + дополнительная информация */}
          <div className="mt-3 flex w-full items-center gap-2">

            {/* Каталог */}
            <div className="min-w-0 flex-1">
              <CatalogMenu categories={categories} />
            </div>

            {/* Авторизация */}
            <div className="shrink-0">
              <HeaderAuthLink />
            </div>
          </div>
        </div>

        {/* Мобильная контактная строка */}
        <div className="border-t border-[#e5e7eb] px-4 py-2">
          <div className="flex items-center justify-between gap-3">

            {/* Телефон */}
            <a
              href={`tel:${CONTACTS.phone.replace(/[^\d+]/g, "")}`}
              className={`flex min-w-0 items-center gap-1.5 truncate text-[13px] font-semibold text-[#475569] transition-colors duration-200 hover:text-accent ${focusRing}`}
            >
              <Image
                src="/icons/fi-br-interrogation.svg"
                alt=""
                width={14}
                height={14}
                className="shrink-0"
              />

              <span className="truncate">
                {CONTACTS.phone}
              </span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${CONTACTS.email}`}
              className={`flex min-w-0 items-center gap-1.5 truncate text-[13px] font-medium text-[#475569] transition-colors duration-200 hover:text-accent ${focusRing}`}
            >
              <Image
                src="/icons/fi-br-envelope.svg"
                alt=""
                width={14}
                height={14}
                className="shrink-0"
              />

              <span className="truncate">
                {CONTACTS.email}
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
