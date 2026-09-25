"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CategoryEditModal from "./CategoryEditModal";
import CategoryCreateModal from "./CategoryCreateModal";
import CategoryAttributesModal from "./CategoryAttributesModal";
import { toggleCategoryHidden } from "@/lib/actions/category";

type Attribute = {
  id: string;
  key: string;
  label: string;
  fieldType: string;
  unit: string | null;
  group: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  iconUrl: string | null;
  isHidden: boolean;
  attributes: Attribute[];
};

type CategoryWithChildren = Category & {
  children: CategoryWithChildren[];
};

function buildTree(
  categories: Category[],
  parentId: string | null = null
): CategoryWithChildren[] {
  return categories
    .filter((category) => category.parentId === parentId)
    .map((category) => ({
      ...category,
      children: buildTree(categories, category.id),
    }));
}

function CategoryRow({
  category,
  depth,
  onEdit,
  onAttributes,
  onToggleHidden,
}: {
  category: CategoryWithChildren;
  depth: number;
  onEdit: (category: Category) => void;
  onAttributes: (category: Category) => void;
  onToggleHidden: (category: Category) => void;
}) {
  const hasChildren = category.children.length > 0;

  return (
    <>
      <li className="relative">
        {depth > 0 && (
          <>
            <div
              className="absolute bottom-0 top-0 w-px bg-[#e3e6ea]"
              style={{
                left: `${(depth - 1) * 28 + 14}px`,
              }}
            />

            <div
              className="absolute top-1/2 h-px w-5 bg-[#e3e6ea]"
              style={{
                left: `${(depth - 1) * 28 + 14}px`,
              }}
            />
          </>
        )}

        <div
          className="group relative flex min-h-[68px] items-center justify-between gap-4 rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-black/[0.04] transition hover:shadow-md sm:px-5"
          style={{
            marginLeft: `${depth * 28}px`,
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl ${
                category.imageUrl
                  ? "bg-[#f1f3f5]"
                  : depth === 0
                  ? "bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm"
                  : "bg-[#f1f3f5] text-[#687382]"
              }`}
            >
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : hasChildren ? (
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M4 5a2 2 0 0 1 2-2h7l7 7v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                  <path d="M13 3v7h7" />
                </svg>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-[#28313d]">
                  {category.name}
                </p>

                {depth === 0 && (
                  <span className="hidden rounded-full bg-[#f1f3f5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#7b8592] sm:inline">
                    Раздел
                  </span>
                )}

                {category.isHidden && (
                  <span className="rounded-full bg-[#fff0f0] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#b33a3a]">
                    Скрыта
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center gap-2">
                <span className="truncate font-mono text-[11px] text-[#9aa2ad]">
                  /{category.slug}
                </span>

                {hasChildren && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-[#c9ced5]" />

                    <span className="text-[11px] text-[#929aa6]">
                      {category.children.length}{" "}
                      {category.children.length === 1
                        ? "подкатегория"
                        : "подкатегории"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => onToggleHidden(category)}
              className={`hidden h-9 items-center gap-2 rounded-xl px-3 text-xs font-medium transition sm:flex ${
                category.isHidden
                  ? "bg-[#fff7f7] text-[#b33a3a] ring-1 ring-[#f0d5d5] hover:bg-[#ffefef]"
                  : "bg-[#f1f7f3] text-[#397653] ring-1 ring-[#d5e8dc] hover:bg-[#e8f3ec]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                {category.isHidden ? (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 10s2.8-5.5 7.5-5.5S17.5 10 17.5 10s-2.8 5.5-7.5 5.5S2.5 10 2.5 10z" />
                    <path strokeLinecap="round" d="M3 3l14 14" />
                  </>
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 10s2.8-5.5 7.5-5.5S17.5 10 17.5 10s-2.8 5.5-7.5 5.5S2.5 10 2.5 10z" />
                    <circle cx="10" cy="10" r="2.2" />
                  </>
                )}
              </svg>
              {category.isHidden ? "Скрыта" : "Видна"}
            </button>

            <button
              onClick={() => onAttributes(category)}
              className="hidden h-9 items-center gap-2 rounded-xl bg-[#f4f5f7] px-3 text-xs font-medium text-[#687382] transition hover:bg-[#e9ebee] sm:flex"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M12 3v18M3 12h18" />
              </svg>

              Атрибуты

              <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-[#596575] shadow-sm">
                {category.attributes.length}
              </span>
            </button>

            <button
              onClick={() => onToggleHidden(category)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition sm:hidden ${
                category.isHidden
                  ? "bg-[#fff7f7] text-[#b33a3a]"
                  : "bg-[#f1f7f3] text-[#397653]"
              }`}
              aria-label={category.isHidden ? "Показать категорию" : "Скрыть категорию"}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 10s2.8-5.5 7.5-5.5S17.5 10 17.5 10s-2.8 5.5-7.5 5.5S2.5 10 2.5 10z" />
                {category.isHidden ? <path strokeLinecap="round" d="M3 3l14 14" /> : <circle cx="10" cy="10" r="2.2" />}
              </svg>
            </button>

            <button
              onClick={() => onEdit(category)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f5f7] text-[#687382] transition hover:bg-[#e9ebee] hover:text-[#28394c] sm:hidden"
              aria-label={`Редактировать ${category.name}`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4z" />
              </svg>
            </button>

            <button
              onClick={() => onEdit(category)}
              className="hidden h-9 items-center gap-2 rounded-xl bg-[#f4f5f7] px-3 text-xs font-medium text-[#687382] transition hover:bg-[#e9ebee] hover:text-[#28394c] sm:flex"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4z" />
              </svg>

              Редактировать
            </button>
          </div>
        </div>

        <div className="px-4 sm:hidden">
          <button
            onClick={() => onAttributes(category)}
            className="flex w-full items-center justify-between rounded-b-xl bg-[#fafbfc] px-3 py-2 text-xs text-[#687382] shadow-sm ring-1 ring-black/[0.04]"
          >
            <span>Атрибуты категории</span>

            <span className="font-medium text-[#28394c]">
              {category.attributes.length}
            </span>
          </button>
        </div>
      </li>

      {category.children.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          depth={depth + 1}
          onEdit={onEdit}
          onAttributes={onAttributes}
          onToggleHidden={onToggleHidden}
        />
      ))}
    </>
  );
}

export default function CategoryList({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [attributesFor, setAttributesFor] =
    useState<Category | null>(null);
  const [search, setSearch] = useState("");

  function handleToggleHidden(category: Category) {
    startTransition(async () => {
      await toggleCategoryHidden(category.id, !category.isHidden);
      router.refresh();
    });
  }

  const tree = buildTree(categories);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tree;
    }

    function filterTree(
      nodes: CategoryWithChildren[]
    ): CategoryWithChildren[] {
      return nodes.reduce<CategoryWithChildren[]>(
        (result, category) => {
          const matches =
            category.name.toLowerCase().includes(query) ||
            category.slug.toLowerCase().includes(query);

          const children = filterTree(category.children);

          if (matches || children.length > 0) {
            result.push({
              ...category,
              children,
            });
          }

          return result;
        },
        []
      );
    }

    return filterTree(tree);
  }, [tree, search]);

  const totalAttributes = categories.reduce(
    (sum, category) => sum + category.attributes.length,
    0
  );

  const statCards = [
    {
      key: "total",
      label: "Всего категорий",
      value: categories.length,
      accent: "from-[#28394c] to-[#3d5570]",
      icon: (
        <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      ),
    },
    {
      key: "top",
      label: "Разделов верхнего уровня",
      value: tree.length,
      accent: "from-[#1f8a5e] to-[#35a877]",
      icon: <path d="M4 5h16M4 12h10M4 19h7" />,
    },
    {
      key: "attrs",
      label: "Атрибутов",
      value: totalAttributes,
      accent: "from-[#b6812f] to-[#c29e57]",
      icon: (
        <>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="8" cy="6" r="1" fill="currentColor" />
          <circle cx="14" cy="12" r="1" fill="currentColor" />
          <circle cx="10" cy="18" r="1" fill="currentColor" />
        </>
      ),
    },
  ];

  return (
    <>
      {/* TOP STATS */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.key}
            className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.accent}`}
            />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#929aa6]">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-[#28394c]">
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.accent} text-white shadow-sm`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {stat.icon}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa2ad]"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию или slug..."
              className="h-11 w-full rounded-xl border-0 bg-[#f4f5f7] pl-10 pr-10 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa2ad] transition hover:text-[#28394c]"
                aria-label="Очистить поиск"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {search && (
              <span className="text-xs text-[#929aa6]">
                Найдено:{" "}
                <span className="font-medium text-[#4c5663]">
                  {filteredCategories.length}
                </span>
              </span>
            )}

            <button
              onClick={() => setCreating(true)}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#28394c] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#1e2a38]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>

              Добавить категорию
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY TREE */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex items-center justify-between border-b border-[#eef0f2] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#28313d]">
              Структура каталога
            </h2>

            <p className="mt-0.5 text-xs text-[#929aa6]">
              Иерархия категорий и подкатегорий
            </p>
          </div>

          <div className="hidden items-center gap-2 text-[11px] text-[#929aa6] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#28394c]" />
            Раздел
            <span className="ml-2 h-2 w-2 rounded-full bg-[#f1f3f5] ring-1 ring-[#dfe3e8]" />
            Подкатегория
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="px-5 py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f3f5] text-[#9ba3ae]">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </div>

            <p className="mt-4 text-sm font-medium text-[#4c5663]">
              {search
                ? "Категории не найдены"
                : "Категорий пока нет"}
            </p>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#9aa2ad]">
              {search
                ? "Попробуйте изменить поисковый запрос"
                : "Создайте первую категорию, чтобы начать формировать каталог"}
            </p>

            {!search && (
              <button
                onClick={() => setCreating(true)}
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-[#28394c] px-4 text-xs font-medium text-white shadow-sm transition hover:bg-[#1e2a38]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>

                Добавить категорию
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 sm:p-4">
            <ul className="space-y-2">
              {filteredCategories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  depth={0}
                  onEdit={setEditing}
                  onAttributes={setAttributesFor}
                  onToggleHidden={handleToggleHidden}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* MODALS */}

      {editing && (
        <CategoryEditModal
          category={editing}
          allCategories={categories}
          onClose={() => setEditing(null)}
        />
      )}

      {creating && (
        <CategoryCreateModal
          allCategories={categories}
          onClose={() => setCreating(false)}
        />
      )}

      {attributesFor && (
        <CategoryAttributesModal
          categoryId={attributesFor.id}
          categoryName={attributesFor.name}
          attributes={
            categories.find(
              (category) => category.id === attributesFor.id
            )?.attributes ?? []
          }
          onClose={() => setAttributesFor(null)}
        />
      )}
    </>
  );
}