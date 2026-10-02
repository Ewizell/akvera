"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Mail, MapPin, Phone, X } from "lucide-react";

export type MobileMenuCategory = {
  id: string;
  name: string;
  slug: string;
  children: MobileMenuCategory[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  categories: MobileMenuCategory[];
  links: { label: string; href: string }[];
  contacts: { address: string; email: string; phone: string };
  /** Слот под блок авторизации (HeaderAuthLink) */
  children?: ReactNode;
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export default function MobileMenu({
  open,
  onClose: close,
  categories,
  links,
  contacts,
  children,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Блокировка прокрутки страницы и закрытие по Escape
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // Если экран стал широким (поворот планшета) — закрываем меню
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");

    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) close();
    };

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [close]);

  const phoneHref = `tel:${contacts.phone.replace(/[^\d+]/g, "")}`;

  return (
    <>
      {/* Выезжающее меню */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${
          open ? "" : "pointer-events-none"
        }`}
      >
        {/* Подложка */}
        <div
          onClick={close}
          aria-hidden="true"
          className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Панель */}
        <aside
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Меню сайта"
          inert={!open}
          className={`absolute inset-y-0 left-0 flex h-dvh w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Шапка панели */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
            <Link
              href="/"
              onClick={close}
              className={`font-maven-pro text-[26px] font-bold leading-none text-accent ${focusRing}`}
            >
              AKVERA
            </Link>

            <button
              type="button"
              onClick={close}
              aria-label="Закрыть меню"
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-slate-100 ${focusRing}`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Прокручиваемая часть */}
          <div className="flex-1 overflow-y-auto overscroll-contain pb-4">
            {/* Главные кнопки */}
            <div className="grid grid-cols-2 gap-2 p-4">
              <Link
                href="/catalog"
                onClick={close}
                className={`flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-white ${focusRing}`}
              >
                Весь каталог
              </Link>

              <Link
                href="/brands"
                onClick={close}
                className={`flex h-12 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-[#334155] ${focusRing}`}
              >
                Бренды
              </Link>
            </div>

            {/* Категории */}
            {categories.length > 0 && (
              <div className="px-4">
                <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Категории
                </p>

                <ul className="divide-y divide-slate-100">
                  {categories.map((category) => {
                    const hasChildren = category.children.length > 0;
                    const expanded = expandedId === category.id;

                    return (
                      <li key={category.id}>
                        <div className="flex items-center">
                          <Link
                            href={`/category/${category.slug}`}
                            onClick={close}
                            className={`flex min-h-12 flex-1 items-center py-2 pl-1 pr-2 text-[15px] font-medium text-[#1e293b] ${focusRing}`}
                          >
                            {category.name}
                          </Link>

                          {hasChildren && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(expanded ? null : category.id)
                              }
                              aria-expanded={expanded}
                              aria-label={`Подкатегории: ${category.name}`}
                              className={`flex h-12 w-12 shrink-0 items-center justify-center text-slate-500 ${focusRing}`}
                            >
                              <ChevronDown
                                size={20}
                                className={`transition-transform duration-200 ${
                                  expanded ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {hasChildren && expanded && (
                          <ul className="mb-2 ml-2 border-l border-slate-200 pl-3">
                            {category.children.map((child) => (
                              <li key={child.id}>
                                <Link
                                  href={`/category/${category.slug}/${child.slug}`}
                                  onClick={close}
                                  className={`flex min-h-11 items-center py-1.5 text-sm text-[#475569] transition-colors hover:text-accent ${focusRing}`}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Информационные ссылки */}
            <nav aria-label="Информация о компании" className="mt-4 px-4">
              <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Информация
              </p>

              <ul className="divide-y divide-slate-100">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      className={`flex min-h-12 items-center py-2 pl-1 text-[15px] font-medium text-[#1e293b] ${focusRing}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Нижний блок: вход и контакты */}
          <div className="shrink-0 space-y-3 border-t border-slate-100 bg-slate-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            {children && <div onClick={close}>{children}</div>}

            <a
              href={phoneHref}
              className={`flex items-center gap-2 text-[15px] font-semibold text-[#334155] ${focusRing}`}
            >
              <Phone size={16} className="shrink-0 text-slate-400" />
              {contacts.phone}
            </a>

            <a
              href={`mailto:${contacts.email}`}
              className={`flex items-center gap-2 text-sm text-[#475569] ${focusRing}`}
            >
              <Mail size={16} className="shrink-0 text-slate-400" />
              <span className="truncate">{contacts.email}</span>
            </a>

            <p className="flex items-start gap-2 text-sm leading-5 text-[#475569]">
              <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
              {contacts.address}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}