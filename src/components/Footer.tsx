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
    <footer className="mt-20 overflow-hidden bg-[#28313d] text-white">
      <div className="mx-auto max-w-[1440px] px-6 py-10 sm:px-10 sm:py-12 lg:px-20">
        {/* Верхняя часть */}
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.8fr_0.9fr]">
          {/* Бренд */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#344354] to-[#202a35] p-7 sm:p-8">
            {/* Декоративный градиент */}
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative">
              <Link
                href="/"
                className="inline-flex text-2xl font-semibold tracking-[0.04em] text-white"
              >
                AKVERA
                <span className="text-accent">.</span>
              </Link>

              <p className="mt-4 max-w-md text-sm leading-6 text-white/55">
                Промышленное оборудование для инженерных систем.
                Помогаем подобрать оборудование под задачу, проверить
                наличие и подготовить предложение.
              </p>

              <Link
                href="/#request"
                className="
                  group
                  mt-7
                  inline-flex
                  h-11
                  items-center
                  gap-3
                  rounded-xl
                  bg-white/10
                  pl-4
                  pr-1.5
                  text-sm
                  font-medium
                  text-white
                  backdrop-blur-sm
                  transition-all
                  duration-300
                  hover:bg-gradient-to-br
                  hover:from-accent
                  hover:to-accent-end
                "
              >
                <span>Оставить заявку</span>

                <span
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/10
                    text-white
                    transition-transform
                    duration-300
                    group-hover:translate-x-0.5
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
          <nav aria-label="Разделы сайта">
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">
              Разделы
            </h3>

            <ul className="mt-5 space-y-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="
                      inline-flex
                      text-sm
                      text-white/65
                      transition-colors
                      duration-200
                      hover:text-white
                    "
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Контакты */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">
              Контакты
            </h3>

            <div className="mt-5 space-y-4">
              <a
                href={telHref}
                className="
                  block
                  text-lg
                  font-medium
                  text-white
                  transition-colors
                  duration-200
                  hover:text-[#4fbd7a]
                "
              >
                {CONTACTS.phone}
              </a>

              <a
                href={`mailto:${CONTACTS.email}`}
                className="
                  block
                  text-sm
                  text-white/65
                  transition-colors
                  duration-200
                  hover:text-white
                "
              >
                {CONTACTS.email}
              </a>

              <div className="text-sm leading-6 text-white/55">
                {CONTACTS.address}
              </div>

              <div className="text-xs leading-5 text-white/35">
                {CONTACTS.hours}
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="mt-10 border-t border-white/[0.08] pt-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <LegalLinks />

            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} {OPERATOR.name}. Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}