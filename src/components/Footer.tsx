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
    <footer className="mt-20 bg-[#0f172a] text-white">
      <div className="mx-auto max-w-[1440px] px-20 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            {/* ✏️ Замените текстовый логотип на картинку, как в шапке */}
            <Link href="/" className="text-2xl font-bold tracking-wide">
              AKVERA<span className="text-[#179146]">.</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Каталог промышленного оборудования: характеристики, актуальные цены и наличие. Оформите заявку
              онлайн.
            </p>
            <Link
              href="/#request"
              className="mt-6 inline-flex rounded-full bg-[#179146] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#127a3a]"
            >
              Оставить заявку
            </Link>
          </div>

          <nav aria-label="Разделы сайта">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Разделы</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/80 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Контакты</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li>
                <a href={telHref} className="text-base font-semibold text-white transition-colors hover:text-[#179146]">
                  {CONTACTS.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACTS.email}`} className="transition-colors hover:text-white">
                  {CONTACTS.email}
                </a>
              </li>
              <li>{CONTACTS.address}</li>
              <li className="text-white/50">{CONTACTS.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <LegalLinks />
          <p className="mt-6 text-xs text-white/40">
            © {new Date().getFullYear()} {OPERATOR.name}. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}