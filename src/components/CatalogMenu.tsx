"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const transitionCurve = "cubic-bezier(0.16, 1, 0.3, 1)";

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  children: CategoryNode[];
};

// Рекурсивный пункт правой панели: сам пункт + кнопка +/- для раскрытия
// вложенного списка внутри той же колонки (любая глубина).
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
    <div className="break-inside-avoid-column mb-1">
      <div className="flex items-center gap-1.5 py-1">
        <Link
          href={path}
          onClick={onNavigate}
          className={`min-w-0 flex-1 truncate text-sm hover:text-[#179146] transition-colors ${
            depth === 0 ? "font-semibold text-[#28313d]" : "text-[#64748b]"
          }`}
        >
          {category.name}
        </Link>

        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(category.id)}
            aria-label={isOpen ? "Свернуть" : "Развернуть"}
            className="shrink-0 flex h-4 w-4 items-center justify-center rounded border border-gray-300 text-[10px] leading-none text-gray-400 hover:border-[#179146] hover:text-[#179146] transition-colors"
          >
            {isOpen ? "−" : "+"}
          </button>
        )}
      </div>

      {hasChildren && (
        <div
          className="grid transition-[grid-template-rows] duration-250 ml-1 border-l border-gray-100 pl-2.5"
          style={{
            gridTemplateRows: isOpen ? "1fr" : "0fr",
            transitionTimingFunction: transitionCurve,
          }}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 pt-1 pb-1.5">
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

export default function CatalogMenu({ categories }: { categories: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const [activeRootId, setActiveRootId] = useState<string | null>(categories[0]?.id ?? null);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const activeRoot = categories.find((c) => c.id === activeRootId) ?? null;

  return (
    <div className="shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex gap-2 h-11 items-center justify-center px-2.5 py-3 rounded-xl text-white text-base font-semibold shrink-0 transition-colors duration-200 ${
          open ? "bg-[#147a3b]" : "bg-[#179146] hover:bg-[#147a3b]"
        }`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="transition-transform duration-300"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transitionTimingFunction: transitionCurve }}
        >
          <rect y="3" width="20" height="2" rx="1" />
          <rect y="9" width="20" height="2" rx="1" />
          <rect y="15" width="20" height="2" rx="1" />
        </svg>
        <span className="hidden sm:inline">Каталог</span>
      </button>

      <div
        className="absolute left-0 top-[60px] w-full flex flex-col md:flex-row bg-white rounded-xl shadow-lg border border-gray-100 z-50 origin-top overflow-hidden max-h-[80vh] md:max-h-[560px]"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "scaleY(1) translateY(0)" : "scaleY(0.98) translateY(-6px)",
          pointerEvents: open ? "auto" : "none",
          transition: `opacity 220ms ${transitionCurve}, transform 220ms ${transitionCurve}`,
        }}
      >
        {/* ЛЕВАЯ ПАНЕЛЬ — корневые категории */}
        <div className="w-full md:w-[240px] lg:w-[280px] shrink-0 border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto py-2 max-h-[240px] md:max-h-none">
          {categories.map((cat) => {
            const isActive = cat.id === activeRootId;
            return (
              <div
                key={cat.id}
                onMouseEnter={() => setActiveRootId(cat.id)}
                onClick={() => setActiveRootId(cat.id)}
                className={`flex items-center justify-between gap-2 pl-3.5 pr-3 py-2.5 cursor-pointer border-l-[3px] transition-colors duration-150 ${
                  isActive
                    ? "bg-[#eef8f1] border-l-[#179146] text-[#179146]"
                    : "border-l-transparent text-[#475569] hover:bg-gray-50"
                }`}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  onClick={close}
                  className="min-w-0 flex-1 flex items-center gap-2 text-sm"
                >
                  {cat.iconUrl && (
                    <img src={cat.iconUrl} alt="" className="h-4 w-4 shrink-0 object-contain" />
                  )}
                  <span className="truncate">{cat.name}</span>
                </Link>

                {cat.children.length > 0 && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`shrink-0 transition-colors duration-150 ${
                      isActive ? "text-[#179146]" : "text-gray-400"
                    }`}
                  >
                    <path d="m7 4 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ — подкатегории активной категории, многоколоночно */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeRoot && activeRoot.children.length > 0 ? (
            <>
              <h3 className="font-bold text-lg text-[#28313d] mb-4">{activeRoot.name}</h3>
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-6 lg:gap-8 [column-fill:balance]">
                {activeRoot.children.map((child) => (
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
            </>
          ) : activeRoot ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              У этой категории пока нет подкатегорий
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}