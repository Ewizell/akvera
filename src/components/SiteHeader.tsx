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

// кольцо фокуса для навигации с клавиатуры
const focusRing =
  "rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#179146]/40";

export default async function SiteHeader() {
  const categories = await getCategoryTree();

  return (
    <div className="fixed top-0 z-50 w-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
      <div className="max-w-[1440px] mx-auto px-20 py-3 flex flex-col gap-3 items-start justify-center">

        {/* Верхний ряд */}
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-[27px] items-center">
            <div className="flex gap-1.5 items-center">
              <Image src="/icons/fi-br-marker.svg" alt="" width={16} height={16} />
              <span className="font-semibold text-[#475569] text-base leading-none whitespace-nowrap">
                {CONTACTS.address}
              </span>
            </div>
            <nav
              aria-label="Информация о компании"
              className="flex gap-3 items-center text-[#475569] text-[14px] font-medium leading-none whitespace-nowrap"
            >
              {TOP_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors duration-200 hover:text-[#179146] ${focusRing}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex gap-8 items-center">
            <a
              href={`mailto:${CONTACTS.email}`}
              className={`flex gap-1.5 items-center font-bold text-[#475569] text-lg leading-none whitespace-nowrap transition-colors duration-200 hover:text-[#179146] ${focusRing}`}
            >
              <Image src="/icons/fi-br-envelope.svg" alt="" width={18} height={18} />
              {CONTACTS.email}
            </a>
            <a
              href={`tel:${CONTACTS.phone.replace(/[^\d+]/g, "")}`}
              className={`flex gap-1.5 items-center font-semibold text-[#475569] text-base leading-none whitespace-nowrap transition-colors duration-200 hover:text-[#179146] ${focusRing}`}
            >
              <Image src="/icons/fi-br-interrogation.svg" alt="" width={16} height={16} />
              {CONTACTS.phone}
            </a>
          </div>
        </div>

        {/* Центральный ряд */}
        <div className="relative flex gap-8 items-center w-full">
          <Link
            href="/"
            className={`font-maven-pro font-bold text-[#179146] text-[40px] shrink-0 transition-opacity duration-200 hover:opacity-80 ${focusRing}`}
          >
            AKVERA
          </Link>

          <CatalogMenu categories={categories} />

          <SearchBox />

          <div className="flex gap-3 items-center shrink-0">
            <FavoritesCounterButton />
            <CompareCounterButton />
            <CartButton />
          </div>

          <HeaderAuthLink />
        </div>
      </div>
    </div>
  );
}