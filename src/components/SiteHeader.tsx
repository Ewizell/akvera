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
  { label: "Доставка и оплата", href: "/#delivery" },
  { label: "FAQ", href: "/#faq" },
  { label: "Контакты и реквизиты", href: "/#requisites" },
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

// Оставляем только то, что нужно мобильному меню (и что можно передать в клиентский компонент)
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
      {/* На телефоне шапка прилипает к верху при скролле (sticky, остаётся в потоке),
    на десктопе (lg+) закреплена сверху (fixed, отступ даёт layout) */}
<header className="sticky top-0 z-50 w-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] lg:fixed">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-2 pb-3 sm:px-6 lg:px-8 lg:py-3 xl:px-20">
          {/* =====================================================
              Верхняя информационная строка — только от lg
              ===================================================== */}
          <div className="hidden w-full items-center justify-between gap-6 lg:flex">
            <div className="flex min-w-0 items-center gap-[27px]">
              {/* Адрес — только на широких экранах, чтобы не переполнять строку */}
              <div className="hidden items-center gap-1.5 min-[1360px]:flex">
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
            <div className="flex shrink-0 items-center gap-6 xl:gap-8">
              <a
                href={`mailto:${CONTACTS.email}`}
                className={`flex items-center gap-1.5 whitespace-nowrap text-base font-bold leading-none text-[#475569] transition-colors duration-200 hover:text-accent xl:text-lg ${focusRing}`}
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
                href={phoneHref}
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

          {/* =====================================================
              Основная строка (один набор компонентов для всех экранов)

              Телефон:  [логотип] [поиск ........] [звонок]
                        Каталог, корзина, избранное и профиль — в нижней
                        панели (BottomNav), сравнение — только на десктопе.
              Десктоп:  [логотип] [каталог] [поиск ........]
                        [избранное][сравнение][корзина] [вход]
              ===================================================== */}
          <div className="relative flex w-full items-center gap-2 lg:gap-x-6 xl:gap-x-8">
{/* Логотип: на телефоне знак-иконка, на десктопе (lg+) текстовый вариант */}
<Link
  href="/"
  aria-label="AKVERA — главная"
  className={`shrink-0 transition-opacity duration-200 hover:opacity-80 ${focusRing}`}
>
  {/* Телефон. alt пустой: название уже есть в aria-label ссылки */}
  <Image
    src="/icons/favicon-akvera.svg"
    alt=""
    width={36}
    height={36}
    priority
    className="h-9 w-9 lg:hidden"
  />

  {/* Десктоп */}
  <span className="hidden font-maven-pro text-[40px] font-bold leading-none text-accent lg:block">
    AKVERA
  </span>
</Link>

            {/* Каталог — на телефоне это вкладка «Каталог» в нижней панели */}
            <div className="hidden lg:block">
              <CatalogMenu categories={categories} />
            </div>

            {/* Поиск: занимает всё свободное место между логотипом и кнопками.
                min-w-0 обязателен, иначе поле не сжимается на узких экранах */}
            <div className="min-w-0 flex-1">
              <SearchBox />
            </div>

            {/* Правая часть: на десктопе — избранное / сравнение / корзина,
                на телефоне — только кнопка звонка */}
            <div className="flex shrink-0 items-center gap-1.5 lg:gap-3">
              {/* Избранное — на телефоне во вкладке нижней панели */}
              <div className="hidden lg:block">
                <FavoritesCounterButton />
              </div>

              {/* Сравнение — только на десктопе */}
              <div className="hidden lg:block">
                <CompareCounterButton />
              </div>

              {/* Корзина — на телефоне во вкладке нижней панели */}
              <div className="hidden lg:block">
                <CartButton />
              </div>

              {/* Звонок — только на телефоне (высота h-11 как у поля поиска) */}
              <a
                href={phoneHref}
                aria-label={`Позвонить: ${CONTACTS.phone}`}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#475569] transition-colors hover:text-accent lg:hidden"
              >
                <Phone size={20} />
              </a>
            </div>

            {/* Авторизация — на телефоне это вкладка «Профиль» в нижней панели */}
            <div className="hidden shrink-0 lg:block">
              <HeaderAuthLink />
            </div>
          </div>
        </div>
      </header>

      {/* Нижняя панель навигации — только телефон/планшет (до lg) */}
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