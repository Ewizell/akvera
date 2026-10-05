"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useCompare } from "@/lib/compare-context";
import {
  getCompareVariants,
  type CompareVariant,
} from "@/lib/actions/compare";
import CompareProductCard from "@/components/CompareProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import ScrollRow from "@/components/ScrollRow";

function formatAttrValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Да" : "Нет";
  return String(value);
}

const ALL_TAB = "__all__";

export default function ComparePage() {
  const { variantIds, removeVariant, replaceVariant, clear } = useCompare();

  const [items, setItems] = useState<CompareVariant[]>([]);
  const [isPending, startTransition] = useTransition();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [diffOnly, setDiffOnly] = useState(false);
  const [pinnedKeys, setPinnedKeys] = useState<Set<string>>(new Set());
  const [pinnedVariantId, setPinnedVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (variantIds.length === 0) {
      setItems([]);
      return;
    }

    startTransition(async () => {
      const data = await getCompareVariants(variantIds);
      setItems(data);
    });
  }, [variantIds]);

  const categories = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();

    for (const item of items) {
      const entry = map.get(item.categoryId);

      map.set(item.categoryId, {
        name: item.categoryName,
        count: (entry?.count ?? 0) + 1,
      });
    }

    return Array.from(map.entries());
  }, [items]);

  useEffect(() => {
    if (categories.length === 0) return;

    if (
      activeCategory !== ALL_TAB &&
      !categories.some(([id]) => id === activeCategory)
    ) {
      setActiveCategory(categories[0][0]);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    setPinnedKeys(new Set());
    setPinnedVariantId(null);
  }, [activeCategory]);

  function togglePinned(key: string) {
    setPinnedKeys((prev) => {
      const next = new Set(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  function clearCategory() {
    if (activeCategory === ALL_TAB) return;

    for (const item of activeItems) {
      removeVariant(item.variantId);
    }
  }

  const activeItems =
    activeCategory === ALL_TAB
      ? items
      : items.filter((item) => item.categoryId === activeCategory);

  const attrSchema =
    activeCategory === ALL_TAB
      ? Array.from(
          new Map(
            activeItems
              .flatMap((item) => item.categoryAttributes)
              .map((attribute) => [attribute.key, attribute]),
          ).values(),
        )
      : activeItems[0]?.categoryAttributes ?? [];

  useEffect(() => {
    if (
      pinnedVariantId &&
      !activeItems.some((item) => item.variantId === pinnedVariantId)
    ) {
      setPinnedVariantId(null);
    }
  }, [activeItems, pinnedVariantId]);

  const DEFAULT_GROUP = "Характеристики";

  const baseAttrs = diffOnly
    ? attrSchema.filter((attr) => {
        const values = activeItems.map((item) =>
          formatAttrValue(item.attributes[attr.key]),
        );

        return new Set(values).size > 1;
      })
    : attrSchema;

  const pinnedAttrs = baseAttrs.filter((attr) =>
    pinnedKeys.has(attr.key),
  );

  const restAttrs = baseAttrs.filter(
    (attr) => !pinnedKeys.has(attr.key),
  );

  const groupOrder: string[] = [];
  const groupedRestAttrs = new Map<string, typeof restAttrs>();

  for (const attr of restAttrs) {
    const groupName = attr.group || DEFAULT_GROUP;

    if (!groupedRestAttrs.has(groupName)) {
      groupOrder.push(groupName);
      groupedRestAttrs.set(groupName, []);
    }

    groupedRestAttrs.get(groupName)!.push(attr);
  }

  const customAttrLabels = diffOnly
    ? Array.from(
        new Set(
          activeItems.flatMap((item) =>
            item.customAttributes.map((attribute) => attribute.label),
          ),
        ),
      ).filter((label) => {
        const values = activeItems.map(
          (item) =>
            item.customAttributes.find(
              (attribute) => attribute.label === label,
            )?.value ?? "—",
        );

        return new Set(values).size > 1;
      })
    : Array.from(
        new Set(
          activeItems.flatMap((item) =>
            item.customAttributes.map((attribute) => attribute.label),
          ),
        ),
      );

  if (variantIds.length === 0) {
    return (
      <main className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-20 lg:px-[80px]">
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl bg-[#f4f5f7] px-6 text-center">
          <h1 className="mb-3 text-xl font-semibold text-[#28313d] sm:text-2xl">
            Список сравнения пуст
          </h1>

          <p className="mb-6 max-w-md text-sm leading-6 text-[#929aa6]">
            Добавьте товары из каталога, нажав «Сравнить» на карточке.
          </p>

          <Link
            href="/catalog"
            className="
              inline-flex
              h-11
              items-center
              rounded-xl
              bg-[#e5e8eb]
              px-4
              text-sm
              font-medium
              text-[#28313d]
              transition-all
              duration-300
              hover:bg-gradient-to-br
              hover:from-accent
              hover:to-accent-end
              hover:text-white
            "
          >
            Перейти в каталог
          </Link>
        </div>
      </main>
    );
  }

  function renderAttrRow(
    attr: (typeof attrSchema)[number],
    pinned: boolean,
  ) {
    return (
      <tr
        key={attr.key}
        className="border-t border-[#e5e8eb]"
      >
        <td
          className="
            sticky
            left-0
            z-10
            bg-white
            py-3
            pr-3
            text-xs
            text-[#66717d]
            sm:py-3.5
            sm:pr-4
            sm:text-sm
          "
        >
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={pinned}
              onChange={() => togglePinned(attr.key)}
              className="h-[15px] w-[15px] accent-accent"
            />

            <span>
              {attr.label}
              {attr.unit ? `, ${attr.unit}` : ""}
            </span>
          </label>
        </td>

        {activeItems.map((item) => (
          <td
            key={item.variantId}
            className={[
              "px-3 py-3 text-xs text-[#28313d] break-words",
              "sm:px-4 sm:py-3.5 sm:text-sm",
              pinnedVariantId === item.variantId
                ? "sticky z-[5] bg-white shadow-[4px_0_8px_-4px_rgba(40,49,61,0.12)]"
                : "",
            ].join(" ")}
            style={
              pinnedVariantId === item.variantId
                ? { left: "var(--label-w)" }
                : undefined
            }
          >
            {formatAttrValue(item.attributes[attr.key])}
          </td>
        ))}
      </tr>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-5 sm:px-8 sm:py-10 lg:px-[80px]">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Сравнение" },
        ]}
      />

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1
          className="
            text-[28px]
            font-semibold
            leading-tight
            text-[#28313d]
            sm:text-[34px]
          "
        >
          Сравнение товаров
        </h1>

        <button
          type="button"
          onClick={clear}
          className="
            inline-flex
            h-10
            shrink-0
            items-center
            gap-2
            rounded-xl
            bg-[#e5e8eb]
            px-3.5
            text-[13px]
            font-medium
            text-[#66717d]
            transition-all
            duration-300
            hover:bg-white
            hover:text-[#28313d]
            hover:shadow-[0_3px_12px_rgba(40,49,61,0.06)]
          "
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>

          Очистить сравнение
        </button>
      </div>

      {isPending && items.length === 0 ? (
        <div className="rounded-2xl bg-[#f4f5f7] px-5 py-10 text-center text-sm text-[#929aa6]">
          Загрузка…
        </div>
      ) : (
        <>
          {categories.length > 0 && (
            <div
              className="
                mb-5
                inline-flex
                max-w-full
                rounded-xl
                bg-[#e5e8eb]
                p-1.5
              "
            >
              <ScrollRow
                className="
                  gap-1
                  sm:flex-wrap
                  sm:overflow-visible
                "
              >
                {categories.map(([id, { name, count }]) => {
                  const active = activeCategory === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveCategory(id)}
                      className={[
                        "inline-flex",
                        "h-8",
                        "shrink-0",
                        "items-center",
                        "rounded-lg",
                        "px-3",
                        "text-[13px]",
                        "font-medium",
                        "whitespace-nowrap",
                        "transition-all",
                        "duration-300",
                        "focus-visible:outline-none",
                        "focus-visible:ring-2",
                        "focus-visible:ring-accent/30",
                        active
                          ? [
                              "bg-white",
                              "text-[#28313d]",
                              "shadow-[0_2px_8px_rgba(40,49,61,0.06)]",
                            ].join(" ")
                          : [
                              "text-[#66717d]",
                              "hover:bg-white/60",
                              "hover:text-[#28313d]",
                            ].join(" "),
                      ].join(" ")}
                    >
                      {name} {count}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setActiveCategory(ALL_TAB)}
                  className={[
                    "inline-flex",
                    "h-8",
                    "shrink-0",
                    "items-center",
                    "rounded-lg",
                    "px-3",
                    "text-[13px]",
                    "font-medium",
                    "whitespace-nowrap",
                    "transition-all",
                    "duration-300",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-accent/30",
                    activeCategory === ALL_TAB
                      ? [
                          "bg-white",
                          "text-[#28313d]",
                          "shadow-[0_2px_8px_rgba(40,49,61,0.06)]",
                        ].join(" ")
                      : [
                          "text-[#66717d]",
                          "hover:bg-white/60",
                          "hover:text-[#28313d]",
                        ].join(" "),
                  ].join(" ")}
                >
                  Все товары {items.length}
                </button>
              </ScrollRow>
            </div>
          )}

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div
              className="
                inline-flex
                min-h-11
                items-center
                rounded-xl
                bg-[#e5e8eb]
                p-1.5
              "
            >
              <div
                className="
                  flex
                  h-8
                  items-center
                  rounded-lg
                  bg-white
                  px-3
                  text-[13px]
                  font-semibold
                  text-[#28313d]
                  shadow-[0_2px_8px_rgba(40,49,61,0.04)]
                "
              >
                Показать
              </div>

              <div
                aria-hidden="true"
                className="mx-1.5 h-5 w-px bg-[#cfd4d9]"
              />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDiffOnly(false)}
                  className={[
                    "inline-flex",
                    "h-8",
                    "items-center",
                    "rounded-lg",
                    "px-3",
                    "text-[13px]",
                    "font-medium",
                    "whitespace-nowrap",
                    "transition-all",
                    "duration-300",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-accent/30",
                    !diffOnly
                      ? [
                          "bg-white",
                          "text-[#28313d]",
                          "shadow-[0_2px_8px_rgba(40,49,61,0.06)]",
                        ].join(" ")
                      : [
                          "text-[#66717d]",
                          "hover:bg-white/60",
                          "hover:text-[#28313d]",
                        ].join(" "),
                  ].join(" ")}
                >
                  Все
                </button>

                <button
                  type="button"
                  onClick={() => setDiffOnly(true)}
                  className={[
                    "inline-flex",
                    "h-8",
                    "items-center",
                    "rounded-lg",
                    "px-3",
                    "text-[13px]",
                    "font-medium",
                    "whitespace-nowrap",
                    "transition-all",
                    "duration-300",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-accent/30",
                    diffOnly
                      ? [
                          "bg-white",
                          "text-[#28313d]",
                          "shadow-[0_2px_8px_rgba(40,49,61,0.06)]",
                        ].join(" ")
                      : [
                          "text-[#66717d]",
                          "hover:bg-white/60",
                          "hover:text-[#28313d]",
                        ].join(" "),
                  ].join(" ")}
                >
                  Различия
                </button>
              </div>
            </div>

            {activeCategory !== ALL_TAB && (
              <button
                type="button"
                onClick={clearCategory}
                className="
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#e5e8eb]
                  px-3.5
                  text-[13px]
                  font-medium
                  text-[#66717d]
                  transition-all
                  duration-300
                  hover:bg-white
                  hover:text-[#28313d]
                  hover:shadow-[0_3px_12px_rgba(40,49,61,0.06)]
                "
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                </svg>

                Очистить категорию
              </button>
            )}
          </div>

          <div
            className="
              overflow-x-auto
              rounded-2xl
              border
              border-[#e5e8eb]
              bg-white
              [--label-w:104px]
              [--col-w:168px]
              sm:[--label-w:160px]
              sm:[--col-w:240px]
            "
          >
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr>
                  <th
                    className="
                      sticky
                      left-0
                      z-20
                      bg-white
                      px-3
                      pb-4
                      pt-4
                      text-left
                      align-top
                      text-sm
                      font-normal
                      text-[#929aa6]
                      sm:px-4
                    "
                    style={{
                      width: "var(--label-w)",
                      height: 1,
                    }}
                  >
                    <div className="hidden h-full flex-col items-start justify-between gap-4 sm:flex">
                      <div className="flex flex-col items-start gap-2.5">
                        <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#28313d]">
                          <input
                            type="radio"
                            name="compare-mode"
                            checked={!diffOnly}
                            onChange={() => setDiffOnly(false)}
                            className="accent-accent"
                          />
                          Все характеристики
                        </label>

                        <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#28313d]">
                          <input
                            type="radio"
                            name="compare-mode"
                            checked={diffOnly}
                            onChange={() => setDiffOnly(true)}
                            className="accent-accent"
                          />
                          Показать различия
                        </label>
                      </div>

                      {activeCategory !== ALL_TAB && (
                        <button
                          type="button"
                          onClick={clearCategory}
                          className="
                            flex
                            items-center
                            gap-2
                            text-[13px]
                            font-medium
                            text-[#929aa6]
                            transition-colors
                            hover:text-[#28313d]
                          "
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                          </svg>

                          Очистить категорию
                        </button>
                      )}
                    </div>
                  </th>

                  {activeItems.map((item) => {
                    const isPinned =
                      pinnedVariantId === item.variantId;

                    return (
                      <th
                        key={item.variantId}
                        className={[
                          "px-2 pb-4 pt-4 align-top",
                          isPinned
                            ? "sticky z-10 bg-white shadow-[4px_0_8px_-4px_rgba(40,49,61,0.12)]"
                            : "",
                        ].join(" ")}
                        style={{
                          width: "var(--col-w)",
                          height: 1,
                          ...(isPinned
                            ? { left: "var(--label-w)" }
                            : {}),
                        }}
                      >
                        <CompareProductCard
                          item={item}
                          isPinned={isPinned}
                          onTogglePin={() =>
                            setPinnedVariantId((prev) =>
                              prev === item.variantId
                                ? null
                                : item.variantId,
                            )
                          }
                          onRemove={() =>
                            removeVariant(item.variantId)
                          }
                        />
                      </th>
                    );
                  })}
                </tr>

                {activeItems.some(
                  (item) => item.siblingVariants.length > 1,
                ) && (
                  <tr>
                    <th
                      className="
                        sticky
                        left-0
                        z-20
                        bg-white
                        px-3
                        pb-4
                        text-left
                        align-top
                        text-[13px]
                        font-medium
                        text-[#929aa6]
                        sm:px-4
                      "
                    >
                      Исполнение
                    </th>

                    {activeItems.map((item) => {
                      const isPinned =
                        pinnedVariantId === item.variantId;

                      return (
                        <th
                          key={item.variantId}
                          className={[
                            "px-2 pb-4 align-top",
                            isPinned
                              ? "sticky z-10 bg-white shadow-[4px_0_8px_-4px_rgba(40,49,61,0.12)]"
                              : "",
                          ].join(" ")}
                          style={
                            isPinned
                              ? { left: "var(--label-w)" }
                              : undefined
                          }
                        >
                          {item.siblingVariants.length > 1 ? (
                            <select
                              value={item.variantId}
                              onChange={(event) =>
                                replaceVariant(
                                  item.variantId,
                                  event.target.value,
                                )
                              }
                              className="
                                h-9
                                w-full
                                rounded-xl
                                border
                                border-[#e5e8eb]
                                bg-[#f4f5f7]
                                px-2.5
                                text-xs
                                text-[#28313d]
                                outline-none
                                transition-colors
                                focus:border-accent
                              "
                            >
                              {item.siblingVariants.map((variant) => (
                                <option
                                  key={variant.id}
                                  value={variant.id}
                                >
                                  {variant.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-xs text-[#929aa6]">
                              {item.variantName}
                            </p>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                )}
              </thead>

              <tbody>
                {baseAttrs.length === 0 &&
                customAttrLabels.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeItems.length + 1}
                      className="
                        px-5
                        py-12
                        text-center
                        text-sm
                        text-[#929aa6]
                      "
                    >
                      {diffOnly
                        ? "Различий не найдено"
                        : "Для этой категории не заданы характеристики"}
                    </td>
                  </tr>
                ) : (
                  <>
                    {pinnedAttrs.length > 0 && (
                      <>
                        <tr>
                          <td
                            colSpan={activeItems.length + 1}
                            className="px-3 pb-2 pt-7 sm:px-4"
                          >
                            <p
                              className="
                                sticky
                                left-0
                                w-max
                                text-[15px]
                                font-semibold
                                text-[#28313d]
                              "
                            >
                              Важные характеристики
                            </p>
                          </td>
                        </tr>

                        {pinnedAttrs.map((attr) =>
                          renderAttrRow(attr, true),
                        )}
                      </>
                    )}

                    {groupOrder.map((groupName) => (
                      <Fragment key={groupName}>
                        <tr>
                          <td
                            colSpan={activeItems.length + 1}
                            className="px-3 pb-2 pt-7 sm:px-4"
                          >
                            <p
                              className="
                                sticky
                                left-0
                                w-max
                                text-[15px]
                                font-semibold
                                text-[#28313d]
                              "
                            >
                              {groupName}
                            </p>
                          </td>
                        </tr>

                        {groupedRestAttrs
                          .get(groupName)!
                          .map((attr) =>
                            renderAttrRow(attr, false),
                          )}
                      </Fragment>
                    ))}

                    {customAttrLabels.length > 0 && (
                      <>
                        <tr>
                          <td
                            colSpan={activeItems.length + 1}
                            className="px-3 pb-2 pt-7 sm:px-4"
                          >
                            <p
                              className="
                                sticky
                                left-0
                                w-max
                                text-[15px]
                                font-semibold
                                text-[#28313d]
                              "
                            >
                              Дополнительно
                            </p>
                          </td>
                        </tr>

                        {customAttrLabels.map((label) => (
                          <tr
                            key={`custom-${label}`}
                            className="border-t border-[#e5e8eb]"
                          >
                            <td
                              className="
                                sticky
                                left-0
                                z-10
                                bg-white
                                px-3
                                py-3
                                text-xs
                                text-[#66717d]
                                sm:px-4
                                sm:py-3.5
                                sm:text-sm
                              "
                            >
                              {label}
                            </td>

                            {activeItems.map((item) => (
                              <td
                                key={item.variantId}
                                className={[
                                  "px-3 py-3 text-xs text-[#28313d]",
                                  "sm:px-4 sm:py-3.5 sm:text-sm",
                                  pinnedVariantId === item.variantId
                                    ? "sticky z-[5] bg-white shadow-[4px_0_8px_-4px_rgba(40,49,61,0.12)]"
                                    : "",
                                ].join(" ")}
                                style={
                                  pinnedVariantId === item.variantId
                                    ? {
                                        left: "var(--label-w)",
                                      }
                                    : undefined
                                }
                              >
                                {item.customAttributes.find(
                                  (attribute) =>
                                    attribute.label === label,
                                )?.value ?? "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}