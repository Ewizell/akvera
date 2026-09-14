import Image from "next/image";
import Link from "next/link";
import SearchBox from "./SearchBox";
import CartButton from "./CartButton";
import CompareCounterButton from "./CompareCounterButton";
import FavoritesCounterButton from "./FavoritesCounterButton";
import HeaderAuthLink from "./HeaderAuthLink";
import CatalogMenu from "./CatalogMenu";
import { getCategoryTree } from "@/lib/actions/category";

const topCategories = ["Насосы", "Автоматика", "Двигатели"];

export default async function SiteHeader() {
  const categories = await getCategoryTree();

  return (
    <div className="bg-white w-full">
      <div className="max-w-[1440px] mx-auto px-20 py-3 flex flex-col gap-3 items-start justify-center">

        {/* Верхний ряд */}
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-[27px] items-center">
            <div className="flex gap-1.5 items-center">
              <Image src="/icons/fi-br-marker.svg" alt="" width={16} height={16} />
              <span className="font-semibold text-[#475569] text-base leading-none whitespace-nowrap">
                г. Одинцово, ул. Внуковская, 11с19
              </span>
            </div>
            <div className="flex gap-3 items-center text-[#475569] text-sm font-medium leading-none whitespace-nowrap">
              <Link href="/about">О компании</Link>
              <Link href="/contacts">Контакты</Link>
              <Link href="/delivery">Доставка и оплата</Link>
              <Link href="/requisites">Реквизиты</Link>
            </div>
          </div>
          <div className="flex gap-8 items-center">
            <a href="mailto:sales@akvera.ru" className="flex gap-1.5 items-center font-bold text-[#475569] text-lg leading-none whitespace-nowrap">
              <Image src="/icons/fi-br-envelope.svg" alt="" width={18} height={18} />
              sales@akvera.ru
            </a>
            <a href="tel:88008888888" className="flex gap-1.5 items-center font-semibold text-[#475569] text-base leading-none whitespace-nowrap">
              <Image src="/icons/fi-br-interrogation.svg" alt="" width={16} height={16} />
              8 800 888-88-88
            </a>
          </div>
        </div>

        {/* Центральный ряд */}
        <div className="flex gap-8 items-center w-full">
          <Link href="/" className="font-maven-pro font-bold text-[#179146] text-[40px] shrink-0">
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

        {/* Нижний ряд */}
        <nav className="flex items-center justify-between w-full text-[#475569] text-sm font-medium leading-none pt-1 whitespace-nowrap">
          {topCategories.map((cat) => (
            <Link key={cat} href={`/category/${cat.toLowerCase()}`}>
              {cat}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}