"use client";

import { useEffect, useState, useTransition } from "react";
import {
  bulkDeleteProducts,
  bulkUpdateCategory,
  bulkUpdateBrand,
  bulkAddTags,
  bulkRemoveTags,
} from "@/lib/actions/product";

type Option = {
  id: string;
  name: string;
};

interface BulkActionsToolbarProps {
  selectedIds: string[];
  categories: Option[];
  brands: Option[];
  tags: Option[];
  onClear: () => void;
}

type ModalType =
  | null
  | "category"
  | "brand"
  | "tagsAdd"
  | "tagsRemove";

const inputClassName =
  "h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-2 focus:ring-[#28394c]/15";

const secondaryButtonClassName =
  "inline-flex h-10 items-center justify-center rounded-xl bg-[#f4f5f7] px-3.5 text-sm font-semibold text-[#4f5a67] transition hover:bg-[#e9ecef] disabled:cursor-not-allowed disabled:opacity-40";

const primaryButtonClassName =
  "inline-flex h-10 items-center justify-center rounded-xl bg-[#28394c] px-4 text-sm font-semibold text-white transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-40";

function ModalIcon({ type }: { type: Exclude<ModalType, null> }) {
  if (type === "category") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5h12M4 10h8M4 15h5"
        />
        <circle cx="15" cy="10" r="1.5" />
        <circle cx="12" cy="15" r="1.5" />
      </svg>
    );
  }

  if (type === "brand") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-5 w-5"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path
          strokeLinecap="round"
          d="M6.5 13.5l2.2-2.4 1.8 1.7 2.9-3.3 1.6 2"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6.5h12M5.5 4h9M6 9.5h8M7 13h6M8 16h4"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 animate-spin"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        className="opacity-25"
      />
      <path
        strokeLinecap="round"
        d="M21 12a9 9 0 00-9-9"
      />
    </svg>
  );
}

export default function BulkActionsToolbar({
  selectedIds,
  categories,
  brands,
  tags,
  onClear,
}: BulkActionsToolbarProps) {
  const [isPending, startTransition] = useTransition();

  const [modal, setModal] = useState<ModalType>(null);

  const [selectedOptionId, setSelectedOptionId] = useState("");

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    []
  );

  const hasSelection = selectedIds.length > 0;
  const disabled = isPending || !hasSelection;

  function closeModal() {
    if (isPending) return;

    setModal(null);
    setSelectedOptionId("");
    setSelectedTagIds([]);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (modal !== null && !isPending) {
        closeModal();
      }
    }

    globalThis.document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      globalThis.document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [modal, isPending]);

  function handleDelete() {
    if (
      !confirm(
        `Удалить ${selectedIds.length} товар(ов)? Это действие необратимо.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      await bulkDeleteProducts(selectedIds);
      onClear();
    });
  }

  function handleApplyCategory() {
    if (!selectedOptionId) return;

    startTransition(async () => {
      await bulkUpdateCategory(
        selectedIds,
        selectedOptionId
      );

      setModal(null);
      setSelectedOptionId("");
      onClear();
    });
  }

  function handleApplyBrand() {
    startTransition(async () => {
      await bulkUpdateBrand(
        selectedIds,
        selectedOptionId || null
      );

      setModal(null);
      setSelectedOptionId("");
      onClear();
    });
  }

  function handleApplyTags(mode: "add" | "remove") {
    if (selectedTagIds.length === 0) return;

    startTransition(async () => {
      if (mode === "add") {
        await bulkAddTags(
          selectedIds,
          selectedTagIds
        );
      } else {
        await bulkRemoveTags(
          selectedIds,
          selectedTagIds
        );
      }

      setModal(null);
      setSelectedTagIds([]);
      onClear();
    });
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id)
        ? prev.filter((tagId) => tagId !== id)
        : [...prev, id]
    );
  }

  return (
    <>
      <div className="sticky top-0 z-20 mb-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect
                  x="3.5"
                  y="3.5"
                  width="13"
                  height="13"
                  rx="2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.5 10l2.2 2.2L13.8 7"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#28313d]">
                Массовые действия
              </div>

              <div className="text-xs text-[#8b949f]">
                Выбрано:{" "}
                <span className="font-semibold text-[#5f6976]">
                  {selectedIds.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedOptionId("");
                setModal("category");
              }}
              disabled={disabled}
              className={secondaryButtonClassName}
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="mr-2 h-4 w-4"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  strokeLinecap="round"
                  d="M4 5h12M4 10h8M4 15h5"
                />
              </svg>
              Категория
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedOptionId("");
                setModal("brand");
              }}
              disabled={disabled}
              className={secondaryButtonClassName}
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="mr-2 h-4 w-4"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <rect
                  x="3"
                  y="3"
                  width="14"
                  height="14"
                  rx="2"
                />
                <path
                  strokeLinecap="round"
                  d="M6.5 13.5l2.2-2.4 1.8 1.7 2.9-3.3"
                />
              </svg>
              Бренд
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTagIds([]);
                setModal("tagsAdd");
              }}
              disabled={disabled}
              className={secondaryButtonClassName}
            >
              <span className="mr-1 text-base leading-none">
                +
              </span>
              Теги
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTagIds([]);
                setModal("tagsRemove");
              }}
              disabled={disabled}
              className={secondaryButtonClassName}
            >
              <span className="mr-1 text-base leading-none">
                −
              </span>
              Теги
            </button>

            <div className="hidden h-7 w-px bg-[#e8ebee] lg:block" />

            <button
              type="button"
              onClick={handleDelete}
              disabled={disabled}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#fff7f7] px-3.5 text-sm font-semibold text-[#b33a3a] ring-1 ring-[#f0d5d5] transition hover:bg-[#ffefef] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="mr-2 h-4 w-4"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  strokeLinecap="round"
                  d="M4 6h12"
                />
                <path
                  strokeLinecap="round"
                  d="M8 3.5h4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l.7 10.5h6.6L14 6"
                />
                <path
                  strokeLinecap="round"
                  d="M8.5 9v5M11.5 9v5"
                />
              </svg>
              Удалить
            </button>

            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className={secondaryButtonClassName}
            >
              Отменить выбор
            </button>
          </div>
        </div>

        {isPending && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f4f5f7] px-3 py-2 text-xs font-medium text-[#687382]">
            <Spinner />
            Выполняется операция...
          </div>
        )}
      </div>

      {modal === "category" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18212b]/45 p-4 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-[#f7f8fa] shadow-2xl ring-1 ring-black/[0.08]">
            <div className="flex items-start justify-between border-b border-[#e7eaed] bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                  <ModalIcon type="category" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#28313d]">
                    Сменить категорию
                  </h3>

                  <p className="mt-0.5 text-xs text-[#8b949f]">
                    Изменить категорию выбранных товаров
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8b949f] transition hover:bg-[#f4f5f7] hover:text-[#28313d] disabled:opacity-40"
                aria-label="Закрыть"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    strokeLinecap="round"
                    d="M5 5l10 10M15 5L5 15"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
                  Категория
                </label>

                <select
                  value={selectedOptionId}
                  onChange={(event) =>
                    setSelectedOptionId(event.target.value)
                  }
                  className={inputClassName}
                  autoFocus
                >
                  <option value="">
                    Выберите категорию
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#e7eaed] bg-white px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className={secondaryButtonClassName}
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={handleApplyCategory}
                disabled={
                  !selectedOptionId || isPending
                }
                className={primaryButtonClassName}
              >
                {isPending && (
                  <span className="mr-2">
                    <Spinner />
                  </span>
                )}
                Применить
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "brand" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18212b]/45 p-4 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-[#f7f8fa] shadow-2xl ring-1 ring-black/[0.08]">
            <div className="flex items-start justify-between border-b border-[#e7eaed] bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                  <ModalIcon type="brand" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#28313d]">
                    Сменить бренд
                  </h3>

                  <p className="mt-0.5 text-xs text-[#8b949f]">
                    Изменить бренд выбранных товаров
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8b949f] transition hover:bg-[#f4f5f7] hover:text-[#28313d] disabled:opacity-40"
                aria-label="Закрыть"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    strokeLinecap="round"
                    d="M5 5l10 10M15 5L5 15"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
                  Бренд
                </label>

                <select
                  value={selectedOptionId}
                  onChange={(event) =>
                    setSelectedOptionId(event.target.value)
                  }
                  className={inputClassName}
                  autoFocus
                >
                  <option value="">
                    Без бренда
                  </option>

                  {brands.map((brand) => (
                    <option
                      key={brand.id}
                      value={brand.id}
                    >
                      {brand.name}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs leading-5 text-[#969faa]">
                  Выберите бренд или оставьте «Без бренда»,
                  чтобы убрать текущий бренд.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#e7eaed] bg-white px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className={secondaryButtonClassName}
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={handleApplyBrand}
                disabled={isPending}
                className={primaryButtonClassName}
              >
                {isPending && (
                  <span className="mr-2">
                    <Spinner />
                  </span>
                )}
                Применить
              </button>
            </div>
          </div>
        </div>
      )}

      {(modal === "tagsAdd" ||
        modal === "tagsRemove") && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18212b]/45 p-4 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-[#f7f8fa] shadow-2xl ring-1 ring-black/[0.08]">
            <div className="flex items-start justify-between border-b border-[#e7eaed] bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                  <ModalIcon type={modal} />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#28313d]">
                    {modal === "tagsAdd"
                      ? "Добавить теги"
                      : "Убрать теги"}
                  </h3>

                  <p className="mt-0.5 text-xs text-[#8b949f]">
                    {modal === "tagsAdd"
                      ? "Добавить выбранные теги товарам"
                      : "Удалить выбранные теги у товаров"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8b949f] transition hover:bg-[#f4f5f7] hover:text-[#28313d] disabled:opacity-40"
                aria-label="Закрыть"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    strokeLinecap="round"
                    d="M5 5l10 10M15 5L5 15"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
                      Теги
                    </div>

                    <div className="mt-1 text-xs text-[#969faa]">
                      Выбрано:{" "}
                      <span className="font-semibold text-[#5f6976]">
                        {selectedTagIds.length}
                      </span>
                    </div>
                  </div>

                  {selectedTagIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTagIds([])
                      }
                      className="text-xs font-semibold text-[#687382] hover:text-[#28394c]"
                    >
                      Сбросить
                    </button>
                  )}
                </div>

                {tags.length === 0 ? (
                  <div className="rounded-xl bg-[#f4f5f7] px-4 py-5 text-center text-sm text-[#8b949f]">
                    Теги отсутствуют
                  </div>
                ) : (
                  <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                    {tags.map((tag) => {
                      const checked =
                        selectedTagIds.includes(tag.id);

                      return (
                        <label
                          key={tag.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                            checked
                              ? "bg-[#eef1f4] ring-1 ring-[#dfe4e8]"
                              : "hover:bg-[#f4f5f7]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleTag(tag.id)
                            }
                            className="h-4 w-4 rounded border-[#cbd1d8] text-[#28394c] focus:ring-[#28394c]/20"
                          />

                          <span
                            className={`text-sm ${
                              checked
                                ? "font-semibold text-[#28313d]"
                                : "text-[#5f6976]"
                            }`}
                          >
                            {tag.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#e7eaed] bg-white px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className={secondaryButtonClassName}
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyTags(
                    modal === "tagsAdd"
                      ? "add"
                      : "remove"
                  )
                }
                disabled={
                  selectedTagIds.length === 0 ||
                  isPending
                }
                className={primaryButtonClassName}
              >
                {isPending && (
                  <span className="mr-2">
                    <Spinner />
                  </span>
                )}
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
