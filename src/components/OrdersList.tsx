"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@/generated/prisma";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderDetailModal } from "./OrderDetailModal";
import { getOrders } from "@/lib/actions/order";
import { STATUS_LABELS, type OrderListItem } from "@/lib/orderTypes";

export function OrdersList({
  initial,
}: {
  initial: {
    items: OrderListItem[];
    total: number;
    pageCount: number;
  };
}) {
  const [items, setItems] = useState(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [pageCount, setPageCount] = useState(initial.pageCount);
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  function reload(
    nextPage = page,
    nextStatus = status,
    nextSearch = search
  ) {
    startTransition(async () => {
      const res = await getOrders({
        status: nextStatus || undefined,
        search: nextSearch || undefined,
        page: nextPage,
      });

      setItems(res.items);
      setTotal(res.total);
      setPageCount(res.pageCount);
      setPage(nextPage);
    });
  }

  function exportCsv() {
    const header = [
      "ID заказа",
      "Дата",
      "Клиент",
      "Email",
      "Телефон",
      "Статус",
      "Сумма",
      "Комментарий админа",
    ];

    const rows = items.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleString("ru-RU"),
      o.contactName,
      o.contactEmail ?? "—",
      o.contactPhone,
      STATUS_LABELS[o.status],
      o.total !== null ? o.total.toString() : "По запросу",
      o.adminComment ?? "",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.join(";"))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `orders_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    a.click();
    URL.revokeObjectURL(url);
  }

  const firstItem = items.length > 0 ? (page - 1) * 10 + 1 : 0;
  const lastItem = Math.min(page * 10, total);

  const statCards = [
    {
      label: "Всего заказов",
      value: total,
      accent: "from-[#28394c] to-[#3d5570]",
      icon: (
        <>
          <path d="M6 2h9l3 3v17H6z" />
          <path d="M14 2v4h4" />
          <path d="M9 11h6M9 15h6M9 19h3" />
        </>
      ),
    },
    {
      label: "На текущей странице",
      value: items.length,
      accent: "from-[#1f8a5e] to-[#35a877]",
      icon: <rect x="4" y="4" width="16" height="16" rx="3" />,
    },
    {
      label: "Страница",
      value: `${page} / ${pageCount || 1}`,
      accent: "from-[#b6812f] to-[#c29e57]",
      icon: (
        <>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <path d="M3 6h.01M3 12h.01M3 18h.01" />
        </>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] transition hover:shadow-md"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.accent}`}
            />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#929aa6]">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-[#1e2a38]">
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
                  strokeWidth="1.8"
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

      {/* Toolbar */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
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
              placeholder="Поиск по имени, email или телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && reload(1, status, search)
              }
              className="h-11 w-full rounded-xl border-0 bg-[#f4f5f7] pl-10 pr-3.5 text-sm text-[#1e2a38] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              const value = e.target.value as OrderStatus | "";

              setStatus(value);
              reload(1, value, search);
            }}
            className="h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#1e2a38] outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-2 focus:ring-[#28394c]/15 xl:w-[210px]"
          >
            <option value="">Все статусы</option>

            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            onClick={() => reload(1, status, search)}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#f4f5f7] px-4 text-sm font-medium text-[#3d4652] transition hover:bg-[#e9ebee] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
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

            Найти
          </button>

          <button
            onClick={exportCsv}
            disabled={items.length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#28394c] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>

            Экспорт CSV
          </button>
        </div>

        {(search || status) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#eef0f2] pt-3">
            <span className="text-xs text-[#929aa6]">
              Активные фильтры:
            </span>

            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  reload(1, status, "");
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#eef1f4] px-3 py-1 text-xs font-medium text-[#4c5663] transition hover:bg-[#e2e6eb]"
              >
                Поиск: {search}
                <span className="text-[#929aa6]">×</span>
              </button>
            )}

            {status && (
              <button
                onClick={() => {
                  setStatus("");
                  reload(1, "", search);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#eef1f4] px-3 py-1 text-xs font-medium text-[#4c5663] transition hover:bg-[#e2e6eb]"
              >
                {STATUS_LABELS[status]}
                <span className="text-[#929aa6]">×</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex items-center justify-between border-b border-[#eef0f2] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#1e2a38]">
              Список заказов
            </h2>

            <p className="mt-0.5 text-xs text-[#929aa6]">
              {total > 0
                ? `Показаны ${firstItem}–${lastItem} из ${total}`
                : "Заказы не найдены"}
            </p>
          </div>

          {isPending && (
            <div className="flex items-center gap-2 text-xs text-[#929aa6]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c29e57]" />
              Обновление
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b border-[#eef0f2] bg-[#fafbfc] text-left">
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#8d96a3]">
                  Заказ
                </th>

                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#8d96a3]">
                  Дата
                </th>

                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#8d96a3]">
                  Клиент
                </th>

                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#8d96a3]">
                  Позиций
                </th>

                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#8d96a3]">
                  Сумма
                </th>

                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#8d96a3]">
                  Комментарий
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#8d96a3]">
                  Статус
                </th>
              </tr>
            </thead>

            <tbody>
              {items.length > 0 ? (
                items.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    className="group cursor-pointer border-b border-[#f2f3f5] transition last:border-0 hover:bg-[#fafbfc]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#596575] transition group-hover:bg-[#28394c] group-hover:text-white">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <path d="M6 2h9l3 3v17H6z" />
                            <path d="M14 2v4h4" />
                          </svg>
                        </div>

                        <div>
                          <div className="font-mono text-xs font-semibold text-[#28394c]">
                            #{order.id.slice(0, 8)}
                          </div>

                          <div className="mt-0.5 text-[11px] text-[#a0a7b1] opacity-0 transition group-hover:opacity-100">
                            Открыть заказ →
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium text-[#3d4652]">
                        {new Date(order.createdAt).toLocaleDateString(
                          "ru-RU"
                        )}
                      </div>

                      <div className="mt-0.5 text-xs text-[#9aa2ad]">
                        {new Date(order.createdAt).toLocaleTimeString(
                          "ru-RU",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef1f4] text-[11px] font-semibold text-[#596575]">
                          {order.contactName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="font-medium text-[#28313d]">
                            {order.contactName}
                          </div>

                          <div className="text-xs text-[#8e97a4]">
                            {order.contactEmail ?? order.contactPhone}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-[#f4f5f6] px-2.5 py-1 text-xs font-medium text-[#596575]">
                        {order.itemsCount}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {order.total !== null ? (
                        <span className="font-semibold text-[#28394c]">
                          {order.total.toLocaleString("ru-RU")} ₽
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#fdf3e3] px-2.5 py-1 text-xs font-medium text-[#a67c2e]">
                          По запросу
                        </span>
                      )}
                    </td>

                    <td className="max-w-[220px] px-4 py-4">
                      {order.adminComment ? (
                        <span
                          title={order.adminComment}
                          className="block truncate text-xs text-[#687382]"
                        >
                          {order.adminComment}
                        </span>
                      ) : (
                        <span className="text-xs text-[#c0c5cc]">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3f4f6] text-[#9ba3ae]">
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
                      Заказы не найдены
                    </p>

                    <p className="mt-1 text-xs text-[#9aa2ad]">
                      Попробуйте изменить параметры поиска
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Loading overlay */}
        {isPending && (
          <div className="border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-2">
            <div className="h-0.5 w-full overflow-hidden rounded-full bg-[#edf0f2]">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-[#c29e57]" />
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/[0.04] sm:flex-row sm:items-center sm:justify-between">
          <p className="px-2 text-xs text-[#929aa6]">
            Страница {page} из {pageCount}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => reload(page - 1)}
              disabled={page === 1 || isPending}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#687382] transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Предыдущая страница"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {Array.from(
              { length: pageCount },
              (_, index) => index + 1
            ).map((p) => (
              <button
                key={p}
                onClick={() => reload(p)}
                disabled={isPending}
                className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-medium transition ${
                  p === page
                    ? "bg-[#28394c] text-white shadow-sm"
                    : "text-[#687382] hover:bg-[#f4f5f7]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => reload(page + 1)}
              disabled={page === pageCount || isPending}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#687382] transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Следующая страница"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {selectedId && (
        <OrderDetailModal
          orderId={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChanged={() => reload(page, status, search)}
        />
      )}
    </div>
  );
}