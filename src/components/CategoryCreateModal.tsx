"use client";

import { useEffect, useState, useTransition } from "react";
import { createCategory } from "@/lib/actions/category";
import { slugify } from "@/lib/slugify";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

const inputCls =
  "h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15";

const selectCls =
  "h-11 w-full appearance-none rounded-xl border-0 bg-[#f4f5f7] px-3.5 pr-10 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-2 focus:ring-[#28394c]/15";

const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#687382]";

export default function CategoryCreateModal({
  allCategories,
  onClose,
}: {
  allCategories: Category[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  function handleNameChange(value: string) {
    setName(value);

    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createCategory(formData);
      onClose();
    });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, isPending]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18212b]/45 p-4 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(25,35,48,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-[#eef0f2] px-6 py-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>

            <div>
              <h2 className="text-[17px] font-semibold tracking-tight text-[#28313d]">
                Новая категория
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#929aa6]">
                Добавьте раздел или подкатегорию в каталог
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9aa2ad] transition hover:bg-[#f4f5f6] hover:text-[#28313d] disabled:pointer-events-none disabled:opacity-50"
            aria-label="Закрыть"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <form action={handleSubmit}>
          {/* FORM */}
          <div className="space-y-5 px-6 py-6">
            <div>
              <label htmlFor="category-name" className={labelCls}>
                Название
              </label>

              <input
                id="category-name"
                name="name"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Например, Вентиляторы"
                required
                autoFocus
                className={inputCls}
              />

              <p className="mt-1.5 text-[11px] text-[#9aa2ad]">
                Название будет отображаться в каталоге
              </p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="category-slug" className={`${labelCls} mb-0`}>
                  Slug
                </label>

                {!slugEdited && (
                  <span className="text-[10px] font-medium text-[#9aa2ad]">
                    генерируется автоматически
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[#a1a8b3]">
                  /
                </span>

                <input
                  id="category-slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlug(event.target.value);
                    setSlugEdited(true);
                  }}
                  placeholder="ventilyatory"
                  required
                  className={`${inputCls} pl-7 font-mono text-[13px]`}
                />
              </div>

              <p className="mt-1.5 text-[11px] text-[#9aa2ad]">
                Используется в URL страницы категории
              </p>
            </div>

            <div>
              <label htmlFor="category-parent" className={labelCls}>
                Родительская категория
              </label>

              <div className="relative">
                <select
                  id="category-parent"
                  name="parentId"
                  defaultValue=""
                  className={selectCls}
                >
                  <option value="">
                    — Категория верхнего уровня —
                  </option>

                  {allCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <svg
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8d96a2]"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              <p className="mt-1.5 text-[11px] text-[#9aa2ad]">
                Выберите родителя, если это будет подкатегория
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2.5 rounded-b-2xl bg-[#fafbfc] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-10 rounded-xl px-4 text-sm font-medium text-[#687382] transition hover:bg-[#f0f2f4] hover:text-[#28313d] disabled:opacity-50"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#28394c] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>

                  Создание...
                </>
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>

                  Создать категорию
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}