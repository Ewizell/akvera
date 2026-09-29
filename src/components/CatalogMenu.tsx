"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const transitionCurve = "cubic-bezier(0.16, 1, 0.3, 1)";

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  productCount?: number;
  children: CategoryNode[];
};

// Рекурсивный пункт правой панели
function CategoryColumnEntry({
  category,
  basePath,
  depth,
  openIds,
  onToggle,
  onNavigate,
}: {
  category: CategoryNode;
  basePath: string;
  depth: number;
  openIds: Set<string>;
  onToggle: (id: string) => void;
  onNavigate: () => void;
}) {
  const hasChildren = category.children.length > 0;
  const isOpen = openIds.has(category.id);
  const path = `${basePath}/${category.slug}`;

  return (
    <div className="mb-1">
      <div className="flex items-start gap-1.5 py-1">
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(category.id)}
            aria-label={isOpen ? "Свернуть" : "Развернуть"}
            className="
              mt-0.5
              flex
              h-4
              w-4
              shrink-0
              items-center
              justify-center
              rounded
              border
              border-gray-300
              text-[10px]
              leading-none
              text-gray-400
              transition-colors
              hover:border-[#179146]
              hover:text-[#179146]
            "
          >
            {isOpen ? "−" : "+"}
          </button>
        )}

        <Link
          href={path}
          onClick={onNavigate}
          className={`min-w-0 flex-1 break-words text-sm transition-colors hover:text-[#179146] ${
            depth === 0
              ? "text-[#28313d]"
              : "text-[#64748b]"
          }`}
        >
          {category.name}
        </Link>

        {typeof category.productCount === "number" && (
          <span className="mt-0.5 shrink-0 text-xs text-gray-400">
            {category.productCount}
          </span>
        )}
      </div>

      {hasChildren && (
        <div
          className="
            ml-1
            grid
            border-l
            border-gray-100
            pl-2.5
            transition-[grid-template-rows]
            duration-250
          "
          style={{
            gridTemplateRows: isOpen ? "1fr" : "0fr",
            transitionTimingFunction: transitionCurve,
          }}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 pb-1.5 pt-1">
              {category.children.map((child) => (
                <CategoryColumnEntry
                  key={child.id}
                  category={child}
                  basePath={path}
                  depth={depth + 1}
                  openIds={openIds}
                  onToggle={onToggle}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogMenu({
  categories,
}: {
  categories: CategoryNode[];
}) {
  const [open, setOpen] = useState(false);

  const [activeRootId, setActiveRootId] = useState<string | null>(
    categories[0]?.id ?? null
  );

  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set()
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const isMobile = window.matchMedia(
      "(max-width: 767px)"
    ).matches;

    if (!isMobile) return;

    const original = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function close() {
    setOpen(false);
  }

  const activeRoot =
    categories.find(
      (category) => category.id === activeRootId
    ) ?? null;

  return (
    <div className="shrink-0" ref={ref}>
      {/* =====================================================
          КНОПКА КАТАЛОГА
      ===================================================== */}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-2.5 py-3 text-base font-semibold text-white transition-colors duration-200 ${
          open
            ? "bg-[#147a3b]"
            : "bg-[#179146] hover:bg-[#147a3b]"
        }`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="transition-transform duration-300"
          style={{
            transform: open
              ? "rotate(90deg)"
              : "rotate(0deg)",
            transitionTimingFunction: transitionCurve,
          }}
        >
          <rect
            y="3"
            width="20"
            height="2"
            rx="1"
          />

          <rect
            y="9"
            width="20"
            height="2"
            rx="1"
          />

          <rect
            y="15"
            width="20"
            height="2"
            rx="1"
          />
        </svg>

        <span className="hidden sm:inline">
          Каталог
        </span>
      </button>

      {/* =====================================================
          DESKTOP MEGA MENU
      ===================================================== */}

      <div
        className="
          absolute
          left-1/2
          top-[calc(100%+8px)]
          z-50
          hidden
          h-[80vh]
          w-[940px]
          max-w-[calc(100vw-32px)]
          origin-top
          overflow-hidden
          rounded-xl
          border
          border-gray-100
          bg-white
          shadow-[0_20px_60px_rgba(15,23,42,0.12)]
          md:flex
          lg:w-[1100px]
        "
        style={{
          opacity: open ? 1 : 0,

          transform: open
            ? "translate(-50%, 0) scale(1)"
            : "translate(-50%, -6px) scale(0.98)",

          pointerEvents: open ? "auto" : "none",

          transition: `
            opacity 220ms ${transitionCurve},
            transform 220ms ${transitionCurve}
          `,
        }}
      >
        {/* =================================================
            ЛЕВАЯ ПАНЕЛЬ
        ================================================= */}

        <div
          className="
            w-[240px]
            shrink-0
            overflow-y-auto
            border-r
            border-gray-100
            py-2
            lg:w-[280px]
          "
        >
          {categories.map((category) => {
            const isActive =
              category.id === activeRootId;

            return (
              <div
  key={category.id}
  onMouseEnter={() => setActiveRootId(category.id)}
  onClick={() => setActiveRootId(category.id)}
  className={`flex items-center justify-between gap-2 pl-3.5 pr-3 py-2.5 cursor-pointer border-l-[3px] rounded-r-lg transition-colors duration-150 ${
    isActive
      ? "bg-[#f3f4f6] border-l-[#179146] text-[#28313d]"
      : "border-l-transparent text-[#475569] hover:bg-gray-50"
  }`}
>
                <Link
                  href={`/category/${category.slug}`}
                  onClick={close}
                  className="
                    flex
                    min-w-0
                    flex-1
                    items-center
                    gap-2
                    text-sm
                  "
                >
                  {/* Иконка категории */}

                  {category.iconUrl && (
                    <img
                      src={category.iconUrl}
                      alt=""
                      className="h-4 w-4 shrink-0 object-contain"
                    />
                  )}

                  {/* Название */}

                  <span
                    className={`
                      min-w-0
                      flex-1
                      truncate
                      transition-colors
                      ${
                        isActive
                          ? "text-[#179146]"
                          : "text-[#475569]"
                      }
                    `}
                  >
                    {category.name}
                  </span>

                  {/* Количество */}

                  {typeof category.productCount ===
                    "number" && (
                    <span
                      className={`
                        shrink-0
                        text-xs
                        ${
                          isActive
                            ? "text-[#179146]/60"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {category.productCount}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {/* =================================================
            ПРАВАЯ ПАНЕЛЬ
        ================================================= */}

        <div className="flex-1 overflow-y-auto p-6">
          {activeRoot &&
          activeRoot.children.length > 0 ? (
            <>
              {/* Заголовок категории */}

              <Link
                href={`/category/${activeRoot.slug}`}
                onClick={close}
                className="
                  group
                  mb-5
                  inline-flex
                  items-center
                  gap-2
                  text-lg
                  font-bold
                  leading-tight
                  text-[#28313d]
                  transition-colors
                  hover:text-[#179146]
                "
              >
                <span>{activeRoot.name}</span>

                {/* Диагональная стрелка */}

                <span
                  className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-md
                    text-[#969da5]
                    transition-all
                    duration-300
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                    group-hover:text-[#179146]
                  "
                  aria-hidden="true"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </span>
              </Link>

              {/* Подкатегории */}

              <div className="grid grid-cols-3 items-start gap-x-8">
                {[0, 1, 2].map((columnIndex) => (
                  <div
                    key={columnIndex}
                    className="flex flex-col gap-1"
                  >
                    {activeRoot.children
                      .filter(
                        (_, index) =>
                          index % 3 === columnIndex
                      )
                      .map((child) => (
                        <CategoryColumnEntry
                          key={child.id}
                          category={child}
                          basePath={`/category/${activeRoot.slug}`}
                          depth={0}
                          openIds={openIds}
                          onToggle={toggle}
                          onNavigate={close}
                        />
                      ))}
                  </div>
                ))}
              </div>
            </>
          ) : activeRoot ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              У этой категории пока нет подкатегорий
            </div>
          ) : null}
        </div>
      </div>

      {/* =====================================================
          MOBILE / TABLET
          Логику не меняем
      ===================================================== */}

      <div
        className={`
          fixed
          inset-x-0
          bottom-0
          top-[60px]
          z-50
          overflow-y-auto
          bg-white
          transition-transform
          duration-300
          md:hidden

          ${
            open
              ? "translate-x-0"
              : "pointer-events-none translate-x-full"
          }
        `}
        style={{
          transitionTimingFunction: transitionCurve,
        }}
      >
        <div className="flex flex-col gap-1 p-4">
          {categories.map((category) => (
            <CategoryColumnEntry
              key={category.id}
              category={category}
              basePath="/category"
              depth={0}
              openIds={openIds}
              onToggle={toggle}
              onNavigate={close}
            />
          ))}
        </div>
      </div>
    </div>
  );
}