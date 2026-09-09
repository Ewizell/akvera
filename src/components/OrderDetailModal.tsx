"use client";

import { useEffect, useState, useTransition } from "react";
import { OrderStatus } from "@/generated/prisma";
import { getOrderById, updateOrderStatus, updateOrderContact, updateOrderAdminComment } from "@/lib/actions/order";
import { STATUS_LABELS } from "@/lib/orderTypes";
import { OrderStatusBadge } from "./OrderStatusBadge";

type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;

const inputCls =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
const smallLabelCls = 'block text-xs font-medium text-gray-500 mb-1'
const cardCls = 'bg-white border border-gray-200 rounded-lg p-5'
const cardTitleCls = 'text-base font-semibold text-gray-900 mb-4'
const secondaryBtnCls =
  'px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50'

export function OrderDetailModal({
  orderId,
  onClose,
  onStatusChanged,
}: {
  orderId: string;
  onClose: () => void;
  onStatusChanged: () => void;
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ contactName: "", contactPhone: "", contactEmail: "", comment: "" });
  const [adminComment, setAdminComment] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getOrderById(orderId).then((o) => {
      setOrder(o);
      if (o) {
        setForm({
          contactName: o.contactName,
          contactPhone: o.contactPhone,
          contactEmail: o.contactEmail ?? "",
          comment: o.comment ?? "",
        });
        setAdminComment(o.adminComment ?? "");
      }
    });
  }, [orderId]);

  function changeStatus(status: OrderStatus) {
    startTransition(async () => {
      await updateOrderStatus(orderId, status);
      const fresh = await getOrderById(orderId);
      setOrder(fresh);
      onStatusChanged();
    });
  }

  function saveContact() {
    startTransition(async () => {
      await updateOrderContact(orderId, {
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail || null,
        comment: form.comment || null,
      });
      const fresh = await getOrderById(orderId);
      setOrder(fresh);
      setEditing(false);
      onStatusChanged();
    });
  }

  function saveAdminComment() {
    startTransition(async () => {
      await updateOrderAdminComment(orderId, adminComment || null);
      const fresh = await getOrderById(orderId);
      setOrder(fresh);
      onStatusChanged();
    });
  }

  function copyOrder() {
    if (!order) return;
    const lines = [
      `Заказ ${order.id}`,
      `Статус: ${STATUS_LABELS[order.status]}`,
      `Клиент: ${order.contactName}`,
      `Телефон: ${order.contactPhone}`,
      order.contactEmail ? `Email: ${order.contactEmail}` : null,
      order.comment ? `Комментарий: ${order.comment}` : null,
      "",
      "Товары:",
      ...order.items.map(
        (i) =>
          `- ${i.variant.product.name} — ${i.variant.name}, ${i.quantity} шт., ${
            i.priceAtOrder !== null ? `${i.priceAtOrder * i.quantity} ₽` : "по запросу"
          }`
      ),
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto text-gray-900">
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-3xl mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Заказ {order.id.slice(0, 8)}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(order.createdAt).toLocaleString("ru-RU")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyOrder} className={secondaryBtnCls}>
              {copied ? "Скопировано ✓" : "Копировать"}
            </button>
            <a href={`/admin/orders/${order.id}/print`} target="_blank" className={secondaryBtnCls}>
              Печать
            </a>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none px-1">
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8 space-y-5">
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={cardTitleCls + " mb-0"}>Клиент</h2>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />
              {!editing && (
                <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:underline">
                  Изменить
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={smallLabelCls}>Имя</label>
                  <input
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={smallLabelCls}>Телефон</label>
                  <input
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="col-span-2">
                  <label className={smallLabelCls}>Email</label>
                  <input
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="col-span-2">
                  <label className={smallLabelCls}>Комментарий клиента</label>
                  <textarea
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    rows={2}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-1 border-t border-gray-100 mt-4">
                <button
                  onClick={saveContact}
                  disabled={isPending}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mt-4"
                >
                  {isPending ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 mt-4"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">Контакты</div>
                <div>{order.contactName}</div>
                <div>{order.contactPhone}</div>
                {order.contactEmail && <div>{order.contactEmail}</div>}
              </div>
              <div>
                <label className={smallLabelCls}>Статус заказа</label>
                <select
                  value={order.status}
                  disabled={isPending}
                  onChange={(e) => changeStatus(e.target.value as OrderStatus)}
                  className={inputCls}
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {!editing && order.comment && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-gray-500 text-xs mb-1">Комментарий клиента</div>
              <div className="text-sm">{order.comment}</div>
            </div>
          )}
        </div>

        <div className={cardCls}>
          <h2 className={cardTitleCls}>Комментарий администратора</h2>
          <textarea
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder="Внутренняя заметка, клиенту не видна"
            rows={2}
            className={inputCls}
          />
          <button
            onClick={saveAdminComment}
            disabled={isPending}
            className="mt-3 bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Сохранение..." : "Сохранить"}
          </button>
        </div>

        <div className={cardCls}>
          <h2 className={cardTitleCls}>Товары</h2>
          <table className="w-full text-sm">
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2">
                    {item.variant.product.name} — {item.variant.name}
                  </td>
                  <td className="py-2 text-gray-500">{item.quantity} шт.</td>
                  <td className="py-2 text-right font-medium">
                    {item.priceAtOrder !== null
                      ? `${(item.priceAtOrder * item.quantity).toLocaleString("ru-RU")} ₽`
                      : "По запросу"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.attachments.length > 0 && (
          <div className={cardCls}>
            <h2 className={cardTitleCls}>Вложения</h2>
            <ul className="text-sm space-y-1">
              {order.attachments.map((a) => (
                <li key={a.id}>
                  <a href={a.url} target="_blank" className="text-blue-600 hover:underline">
                    {a.filename}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}