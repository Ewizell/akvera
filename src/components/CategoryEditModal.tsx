"use client";

import { useEffect, useState, useTransition } from "react";
import {
  updateCategory,
  deleteCategory,
} from "@/lib/actions/category";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  iconUrl: string | null;
};

const inputCls =
  "h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15";

const selectCls =
  "h-11 w-full appearance-none rounded-xl border-0 bg-[#f4f5f7] px-3.5 pr-10 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-2 focus:ring-[#28394c]/15";

const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#687382]";

export default function CategoryEditModal({
  category,
  allCategories,
  onClose,
}: {
  category: Category;
  allCategories: Category[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateCategory(category.id, formData);

      if (!result.success) {
        setDeleteError(result.error ?? "Не удалось сохранить категорию.");
        return;
      }

      onClose();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCategory(category.id);

      if (result.success) {
        onClose();
      } else {
        setDeleteError(
          result.error ?? "Не удалось удалить категорию."
        );
        setConfirmingDelete(false);
      }
    });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        if (confirmingDelete) {
          setConfirmingDelete(false);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, isPending, confirmingDelete]);

  const possibleParents = allCategories.filter(
    (item) => item.id !== category.id
  );

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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#28394c]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4z" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold tracking-tight text-[#28313d]">
                Редактировать категорию
              </h2>

              <div className="mt-1 flex items-center gap-2">
                <span className="truncate text-xs text-[#929aa6]">
                  {category.name}
                </span>

                <span className="h-1 w-1 shrink-0 rounded-full bg-[#c29e57]" />

                <span className="font-mono text-[10px] text-[#a1a8b3]">
                  {category.id.slice(0, 8)}
                </span>
              </div>
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

        {/* FORM */}
        <form action={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            {/* NAME */}
            <div>
              <label
                htmlFor="edit-category-name"
                className={labelCls}
              >
                Название
              </label>

              <input
                id="edit-category-name"
                name="name"
                defaultValue={category.name}
                required
                autoFocus
                className={inputCls}
              />
            </div>

            {/* SLUG */}
            <div>
              <label
                htmlFor="edit-category-slug"
                className={labelCls}
              >
                Slug
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[#a1a8b3]">
                  /
                </span>

                <input
                  id="edit-category-slug"
                  name="slug"
                  defaultValue={category.slug}
                  required
                  className={`${inputCls} pl-7 font-mono text-[13px]`}
                />
              </div>

              <p className="mt-1.5 text-[11px] text-[#9aa2ad]">
                Изменение slug может повлиять на URL категории
              </p>
            </div>

            {/* PARENT */}
            <div>
              <label
                htmlFor="edit-category-parent"
                className={labelCls}
              >
                Родительская категория
              </label>

              <div className="relative">
                <select
                  id="edit-category-parent"
                  name="parentId"
                  defaultValue={category.parentId ?? ""}
                  className={selectCls}
                >
                  <option value="">
                    — Категория верхнего уровня —
                  </option>

                  {possibleParents.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
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
            </div>

            {/* IMAGE */}
            <div>
              <label
                htmlFor="edit-category-image"
                className={labelCls}
              >
                Изображение
              </label>

              {category.imageUrl && (
                <img
                  src={category.imageUrl}
                  alt=""
                  className="mb-2 h-20 w-32 rounded-lg object-cover ring-1 ring-[#eef0f2]"
                />
              )}

              <input
                id="edit-category-image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="block w-full text-sm text-[#28313d] file:mr-3 file:rounded-lg file:border-0 file:bg-[#f4f5f7] file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-[#28313d] hover:file:bg-[#eceef0]"
              />

              <p className="mt-1.5 text-[11px] text-[#9aa2ad]">
                Оставьте пустым, чтобы не менять текущее изображение
              </p>
            </div>

            {/* ICON */}
            <div>
              <label
                htmlFor="edit-category-icon"
                className={labelCls}
              >
                Иконка
              </label>

              {category.iconUrl && (
                <img
                  src={category.iconUrl}
                  alt=""
                  className="mb-2 h-10 w-10 rounded-lg object-contain ring-1 ring-[#eef0f2]"
                />
              )}

              <input
                id="edit-category-icon"
                name="icon"
                type="file"
                accept="image/png,image/svg+xml,image/webp"
                className="block w-full text-sm text-[#28313d] file:mr-3 file:rounded-lg file:border-0 file:bg-[#f4f5f7] file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-[#28313d] hover:file:bg-[#eceef0]"
              />

              <p className="mt-1.5 text-[11px] text-[#9aa2ad]">
                Оставьте пустым, чтобы не менять текущую иконку
              </p>
            </div>

            {/* ERROR */}
            {deleteError && (
              <div className="flex items-start gap-2.5 rounded-xl bg-[#fff1f1] px-3.5 py-3 text-sm text-[#a33a3a] ring-1 ring-[#f1d2d2]">
                <svg
                  className="mt-0.5 shrink-0"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>

                <span>{deleteError}</span>
              </div>
            )}
          </div>

          {/* DELETE AREA */}
          <div className="rounded-b-2xl bg-[#fafbfc] px-6 py-4">
            {!confirmingDelete ? (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setConfirmingDelete(true);
                  }}
                  disabled={isPending}
                  className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-[#b04a4a] transition hover:bg-[#fff1f1] hover:text-[#963b3b] disabled:opacity-50"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                  </svg>

                  Удалить категорию
                </button>

                <div className="flex items-center gap-2.5">
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

                        Сохранение...
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
                          <path d="M5 12.5 9.5 17 19 7" />
                        </svg>

                        Сохранить
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#fff8f8] p-4 ring-1 ring-[#f0d4d4]">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fbe9e9] text-[#a33a3a]">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 3 22 20H2L12 3Z" />
                      <path d="M12 9v4M12 16h.01" />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#7f3535]">
                      Удалить категорию?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#a66b6b]">
                      Категория «{category.name}» будет удалена.
                      Убедитесь, что она больше не используется.
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#b64b4b] px-3.5 text-xs font-semibold text-white transition hover:bg-[#a13f3f] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPending ? (
                          <>
                            <svg
                              className="animate-spin"
                              width="13"
                              height="13"
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

                            Удаление...
                          </>
                        ) : (
                          "Да, удалить"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(false)}
                        disabled={isPending}
                        className="h-9 rounded-lg px-3.5 text-xs font-medium text-[#687382] transition hover:bg-white hover:text-[#28313d] disabled:opacity-50"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
