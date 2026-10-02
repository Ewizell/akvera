import Link from "next/link";
import LegalLinks from "@/components/LegalLinks";
import { CONTACTS } from "@/lib/site-content";
import { OPERATOR } from "@/lib/legal-content";

const NAV = [
  { label: "Каталог", href: "/catalog" },
  { label: "Бренды", href: "/brands" },
  { label: "О компании", href: "/about" },
  { label: "Доставка и оплата", href: "/#delivery" },
  { label: "Вопросы и ответы", href: "/#faq" },
  { label: "Реквизиты", href: "/#requisites" },
];

export default function Footer() {
  const telHref = `tel:${CONTACTS.phone.replace(/[^\d+]/g, "")}`;

  return (
    <footer className="mt-12 overflow-hidden bg-gradient-to-br from-[#1f2935] to-[#2d3b4b] text-white sm:mt-16 lg:mt-20">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-20 lg:py-12">
        {/* Верхняя часть */}
        <div className="grid gap-4 sm:gap-8 lg:grid-cols-[1.5fr_0.75fr_0.95fr] lg:gap-10">

          {/* Бренд */}
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] p-5 sm:p-7 lg:p-8">
            {/* Декоративный градиент */}
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative">
              <Link
                href="/"
                className="inline-flex text-xl font-semibold tracking-[0.04em] text-white transition-opacity hover:opacity-80 sm:text-2xl"
              >
                AKVERA
                <span className="text-accent">.</span>
              </Link>

              <p className="mt-3 max-w-md text-[13px] leading-5 text-white/55 sm:mt-4 sm:text-sm sm:leading-6">
                Промышленное оборудование для инженерных систем.
                Помогаем подобрать оборудование под задачу, проверить
                наличие и подготовить предложение.
              </p>

              <Link
                href="/#request"
                className="
                  group
                  mt-5
                  flex
                  h-11
                  w-full
                  items-center
                  rounded-xl
                  bg-white/10
                  px-1.5
                  text-sm
                  font-medium
                  text-white
                  backdrop-blur-sm
                  transition-all
                  duration-300
                  hover:bg-gradient-to-br
                  hover:from-accent
                  hover:to-accent-end
                  sm:mt-7
                  sm:inline-flex
                  sm:w-auto
                  sm:pl-4
                "
              >
                <span className="flex flex-1 items-center justify-center pl-3 sm:flex-none sm:pl-0">
                  Оставить заявку
                </span>

                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/10
                    text-white
                    transition-transform
                    duration-300
                    group-hover:translate-x-0.5
                    sm:ml-3
                  "
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                  >
                    <path
                      d="M2 7.5h11M8 2.5l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Навигация */}
          <nav
            aria-label="Разделы сайта"
            className="rounded-2xl bg-white/[0.03] p-5 sm:bg-transparent sm:p-0"
          >
            <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/35 sm:text-xs">
              Разделы
            </h3>

            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:mt-5 sm:block sm:space-y-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="
                      inline-flex
                      text-[13px]
                      text-white/65
                      transition-colors
                      duration-200
                      hover:text-white
                      sm:text-sm
                    "
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Контакты */}
          <div className="rounded-2xl bg-white/[0.03] p-5 sm:bg-transparent sm:p-0">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/35 sm:text-xs">
              Контакты
            </h3>

            <div className="mt-4 space-y-3.5 sm:mt-5 sm:space-y-4">
              <a
                href={telHref}
                className="
                  block
                  text-base
                  font-medium
                  text-white
                  transition-colors
                  duration-200
                  hover:text-[#4fbd7a]
                  sm:text-lg
                "
              >
                {CONTACTS.phone}
              </a>

              <a
                href={`mailto:${CONTACTS.email}`}
                className="
                  block
                  break-all
                  text-[13px]
                  text-white/65
                  transition-colors
                  duration-200
                  hover:text-white
                  sm:text-sm
                "
              >
                {CONTACTS.email}
              </a>

              <div className="text-[13px] leading-5 text-white/55 sm:text-sm sm:leading-6">
                {CONTACTS.address}
              </div>

              <div className="text-[11px] leading-5 text-white/35 sm:text-xs">
                {CONTACTS.hours}
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="mt-7 border-t border-white/[0.12] pt-5 sm:mt-10 sm:pt-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            {/* Юридические ссылки */}
<div className="min-w-0 text-[11px] leading-5 sm:text-xs">
  <LegalLinks />
</div>

            {/* Копирайт */}
            <p className="text-[10px] leading-4 text-white/30 sm:text-xs sm:text-right">
              © {new Date().getFullYear()} {OPERATOR.name}. Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
