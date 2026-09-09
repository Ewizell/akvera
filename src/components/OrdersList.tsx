"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@/generated/prisma";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderDetailModal } from "./OrderDetailModal";
import { getOrders } from "@/lib/actions/order";
import { STATUS_LABELS, type OrderListItem } from "@/lib/orderTypes";

const inputCls =
  'border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const cardCls = 'bg-white border border-gray-200 rounded-lg'
const secondaryBtnCls =
  'px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50'
const primaryBtnCls =
  'bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50'

export function OrdersList({
  initial,
}: {
  initial: { items: OrderListItem[]; total: number; pageCount: number };
}) {
  const [items, setItems] = useState(initial.items);
  const [pageCount, setPageCount] = useState(initial.pageCount);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reload(nextPage = page, nextStatus = status, nextSearch = search) {
    startTransition(async () => {
      const res = await getOrders({
        status: nextStatus || undefined,
        search: nextSearch || undefined,
        page: nextPage,
      });
      setItems(res.items);
      setPageCount(res.pageCount);
      setPage(nextPage);
    });
  }

  function exportCsv() {
    const header = ["ID заказа", "Дата", "Клиент", "Email", "Телефон", "Статус", "Сумма", "Комментарий админа"];
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
    const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className={`${cardCls} p-4 flex gap-3 items-center flex-wrap`}>
        <input
          type="text"
          placeholder="Поиск по имени, email, телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && reload(1, status, search)}
          className={`${inputCls} w-64`}
        />
        <select
          value={status}
          onChange={(e) => {
            const v = e.target.value as OrderStatus | "";
            setStatus(v);
            reload(1, v, search);
          }}
          className={inputCls}
        >
          <option value="">Все статусы</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button onClick={() => reload(1, status, search)} className={secondaryBtnCls}>
          Найти
        </button>
        <button onClick={exportCsv} className={`${primaryBtnCls} ml-auto`}>
          Экспорт CSV
        </button>
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 text-xs text-gray-500 bg-gray-50">
              <th className="py-3 px-4 font-medium">ID</th>
              <th className="font-medium">Дата</th>
              <th className="font-medium">Клиент</th>
              <th className="font-medium">Позиций</th>
              <th className="font-medium">Сумма</th>
              <th className="font-medium">Комментарий</th>
              <th className="font-medium pr-4">Статус</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer text-gray-900"
              >
                <td className="py-3 px-4 text-gray-500">{o.id.slice(0, 8)}</td>
                <td>{new Date(o.createdAt).toLocaleDateString("ru-RU")}</td>
                <td>
                  <div className="font-medium">{o.contactName}</div>
                  <div className="text-xs text-gray-500">{o.contactEmail ?? o.contactPhone}</div>
                </td>
                <td>{o.itemsCount}</td>
                <td className="font-medium">
                  {o.total !== null ? `${o.total.toLocaleString("ru-RU")} ₽` : "По запросу"}
                </td>
                <td className="max-w-[160px]">
                  {o.adminComment ? (
                    <span
                      title={o.adminComment}
                      className="text-s text-gray-600 truncate block"
                    >
                    {o.adminComment}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="pr-4"><OrderStatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isPending && <p className="text-sm text-gray-400">Загрузка...</p>}

      <div className="flex gap-2">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => reload(p)}
            className={`px-3 py-1.5 rounded-md text-sm ${
              p === page
                ? "bg-blue-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

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