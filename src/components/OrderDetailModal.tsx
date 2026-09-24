"use client";

import { useEffect, useState, useTransition } from "react";
import { OrderStatus } from "@/generated/prisma/enums";
import {
  getOrderById,
  updateOrderStatus,
  updateOrderContact,
  updateOrderAdminComment,
  deleteOrder,
  deleteOrderItem,
  updateOrderItem,
  addOrderItem,
  searchVariantsForOrder,
} from "@/lib/actions/order";
import { STATUS_LABELS } from "@/lib/orderTypes";
import { OrderStatusBadge } from "./OrderStatusBadge";

type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;

type VariantSearchResult = {
  id: string;
  sku: string;
  name: string;
  productName: string;
  price: number | null;
};

const inputCls =
  "w-full h-10 rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15";

const textareaCls =
  "w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 py-3 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15 resize-none";

const labelCls =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#8d96a3]";

const cardCls =
  "rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]";

const cardTitleCls =
  "text-sm font-semibold text-[#28313d]";

const secondaryBtnCls =
  "inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#f4f5f7] px-3.5 text-xs font-medium text-[#4c5663] transition hover:bg-[#e9ebee]";

const primaryBtnCls =
  "inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#28394c] px-4 text-xs font-medium text-white shadow-sm transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-50";

const summaryCards = [
  {
    key: "client" as const,
    accent: "from-[#28394c] to-[#3d5570]",
    icon: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </>
    ),
  },
  {
    key: "items" as const,
    accent: "from-[#1f8a5e] to-[#35a877]",
    icon: <rect x="4" y="4" width="16" height="16" rx="3" />,
  },
  {
    key: "total" as const,
    accent: "from-[#b6812f] to-[#c29e57]",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1-3 2.3c0 3 6 1.5 6 4.5 0 1.4-1.3 2.5-3 2.5s-3-1.1-3-2.5" />
      </>
    ),
  },
];

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

  const [form, setForm] = useState({
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    comment: "",
  });

  const [adminComment, setAdminComment] = useState("");
  const [copied, setCopied] = useState(false);

  const [deleteOrderConfirmOpen, setDeleteOrderConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    quantity: 1,
    priceAtOrder: "",
    onRequest: false,
    variantId: "",
    variantLabel: "",
  });
  const [variantQuery, setVariantQuery] = useState("");
  const [variantResults, setVariantResults] = useState<VariantSearchResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      await updateOrderAdminComment(
        orderId,
        adminComment || null
      );

      const fresh = await getOrderById(orderId);

      setOrder(fresh);
      onStatusChanged();
    });
  }
    function confirmDeleteOrder() {
    startTransition(async () => {
      const result = await deleteOrder(orderId);

      if (!result.success) {
        setErrorMessage(result.error);
        setDeleteOrderConfirmOpen(false);
        return;
      }

      setDeleteOrderConfirmOpen(false);
      onStatusChanged();
      onClose();
    });
  }

  function confirmDeleteItem() {
    if (!deleteItemId) return;

    startTransition(async () => {
      const result = await deleteOrderItem(orderId, deleteItemId);

      setDeleteItemId(null);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      const fresh = await getOrderById(orderId);
      setOrder(fresh);
      onStatusChanged();
    });
  }
  

  function startEditItem(item: OrderDetail["items"][number]) {
    setEditingItemId(item.id);
    setItemForm({
      quantity: item.quantity,
      priceAtOrder: item.priceAtOrder !== null ? String(item.priceAtOrder) : "",
      onRequest: item.priceAtOrder === null,
      variantId: item.variantId,
      variantLabel: `${item.variant.product.name} — ${item.variant.name} (${item.variant.sku})`,
    });
    setVariantQuery("");
    setVariantResults([]);
  }

  function cancelEditItem() {
    setEditingItemId(null);
  }

  function startAddItem() {
    setAddingItem(true);
    setItemForm({
      quantity: 1,
      priceAtOrder: "",
      onRequest: false,
      variantId: "",
      variantLabel: "",
    });
    setVariantQuery("");
    setVariantResults([]);
  }

  function cancelAddItem() {
    setAddingItem(false);
  }

  function saveNewItem() {
    if (!itemForm.variantId) {
      setErrorMessage("Выберите товар из списка.");
      return;
    }

    startTransition(async () => {
      const result = await addOrderItem(orderId, {
        variantId: itemForm.variantId,
        quantity: itemForm.quantity,
        priceAtOrder: itemForm.onRequest ? null : parseFloat(itemForm.priceAtOrder) || 0,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      const fresh = await getOrderById(orderId);
      setOrder(fresh);
      setAddingItem(false);
      onStatusChanged();
    });
  }

  function saveEditItem() {
    if (!editingItemId) return;

    startTransition(async () => {
      const result = await updateOrderItem(editingItemId, {
        quantity: itemForm.quantity,
        priceAtOrder: itemForm.onRequest ? null : parseFloat(itemForm.priceAtOrder) || 0,
        variantId: itemForm.variantId,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      const fresh = await getOrderById(orderId);
      setOrder(fresh);
      setEditingItemId(null);
      onStatusChanged();
    });
  }

  function searchVariants(query: string) {
    setVariantQuery(query);

    if (!query.trim()) {
      setVariantResults([]);
      return;
    }

    startTransition(async () => {
      const results = await searchVariantsForOrder(query);
      setVariantResults(results);
    });
  }

  function pickVariant(v: VariantSearchResult) {
    setItemForm((prev) => ({
      ...prev,
      variantId: v.id,
      variantLabel: `${v.productName} — ${v.name} (${v.sku})`,
    }));
    setVariantQuery("");
    setVariantResults([]);
  }

  function copyOrder() {
    if (!order) return;

    const lines = [
      `Заказ №${order.orderNumber}`,
      `Статус: ${STATUS_LABELS[order.status]}`,
      `Клиент: ${order.contactName}`,
      `Телефон: ${order.contactPhone}`,
      order.contactEmail
        ? `Email: ${order.contactEmail}`
        : null,
      order.comment
        ? `Комментарий: ${order.comment}`
        : null,
      "",
      "Товары:",
      ...order.items.map(
        (i) =>
          `- ${i.variant.product.name} — ${i.variant.name}, ${
            i.quantity
          } шт., ${
            i.priceAtOrder !== null
              ? `${i.priceAtOrder * i.quantity} ₽`
              : "по запросу"
          }`
      ),
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    });
  }

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#f7f8fa] to-[#eef0f3]">
        <div className="flex items-center gap-3 text-sm text-[#8d96a3]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#c29e57]" />
          Загрузка заказа...
        </div>
      </div>
    );
  }

  const orderTotal = order.items.reduce((sum, item) => {
    if (item.priceAtOrder === null) return sum;

    return sum + item.priceAtOrder * item.quantity;
  }, 0);

  const hasRequestPrice = order.items.some(
    (item) => item.priceAtOrder === null
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-[#f7f8fa] to-[#eef0f3] text-[#28313d]">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f5f7] text-[#687382] transition hover:bg-[#e9ebee] hover:text-[#28394c]"
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
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-[#28394c]">
                  №{order.orderNumber}
                </span>

                <OrderStatusBadge status={order.status} />
              </div>

              <p className="mt-0.5 truncate text-xs text-[#929aa6]">
                Заказ от{" "}
                {new Date(order.createdAt).toLocaleString("ru-RU")}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={copyOrder}
              className={secondaryBtnCls}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="9"
                  y="9"
                  width="11"
                  height="11"
                  rx="1"
                />
                <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
              </svg>

              <span className="hidden sm:inline">
                {copied ? "Скопировано" : "Копировать"}
              </span>
            </button>

            <a
              href={`/admin/orders/${order.id}/print`}
              target="_blank"
              rel="noreferrer"
              className={secondaryBtnCls}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6 9V3h12v6" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 14h12v7H6z" />
              </svg>

              <span className="hidden sm:inline">
                Печать
              </span>
            </a>

            <button
              onClick={() => setDeleteOrderConfirmOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#fff7f7] px-3.5 text-xs font-medium text-[#b33a3a] ring-1 ring-[#f0d5d5] transition hover:bg-[#ffefef]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
              </svg>
              <span className="hidden sm:inline">Удалить заказ</span>
            </button>

            <button
              onClick={onClose}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-[#9aa2ad] transition hover:bg-[#f4f5f7] hover:text-[#28394c]"
              aria-label="Закрыть"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* TOP SUMMARY */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => {
            const content =
              card.key === "client" ? (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#929aa6]">
                    Клиент
                  </p>

                  <p className="mt-2 truncate text-sm font-semibold text-[#28313d]">
                    {order.contactName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-[#8d96a3]">
                    {order.contactPhone}
                  </p>
                </>
              ) : card.key === "items" ? (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#929aa6]">
                    Позиций
                  </p>

                  <p className="mt-2 text-xl font-semibold tracking-tight text-[#28394c]">
                    {order.items.length}
                  </p>

                  <p className="mt-0.5 text-xs text-[#8d96a3]">
                    {order.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}{" "}
                    шт. всего
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#929aa6]">
                    Сумма заказа
                  </p>

                  <p className="mt-2 text-xl font-semibold tracking-tight text-[#28394c]">
                    {hasRequestPrice
                      ? "По запросу"
                      : `${orderTotal.toLocaleString("ru-RU")} ₽`}
                  </p>

                  <p className="mt-0.5 text-xs text-[#8d96a3]">
                    {hasRequestPrice
                      ? "Требует уточнения"
                      : "Итоговая стоимость"}
                  </p>
                </>
              );

            return (
              <div
                key={card.key}
                className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`}
                />

                <div className="flex items-start justify-between">
                  <div>{content}</div>

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-sm`}
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
                      {card.icon}
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* LEFT */}
          <div className="space-y-5">
            {/* CLIENT */}
            <section className={cardCls}>
              <div className="flex items-center justify-between border-b border-[#eef0f2] px-5 py-4">
                <div>
                  <h2 className={cardTitleCls}>
                    Данные клиента
                  </h2>

                  <p className="mt-0.5 text-xs text-[#929aa6]">
                    Контактная информация и комментарий
                  </p>
                </div>

                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#28394c] transition hover:bg-[#f4f5f7] hover:text-[#c29e57]"
                  >
                    Изменить
                  </button>
                )}
              </div>

              <div className="p-5">
                {editing ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>
                          Имя
                        </label>

                        <input
                          value={form.contactName}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              contactName: e.target.value,
                            })
                          }
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>
                          Телефон
                        </label>

                        <input
                          value={form.contactPhone}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              contactPhone: e.target.value,
                            })
                          }
                          className={inputCls}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className={labelCls}>
                          Email
                        </label>

                        <input
                          type="email"
                          value={form.contactEmail}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              contactEmail: e.target.value,
                            })
                          }
                          className={inputCls}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className={labelCls}>
                          Комментарий клиента
                        </label>

                        <textarea
                          value={form.comment}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              comment: e.target.value,
                            })
                          }
                          rows={3}
                          className={textareaCls}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-[#eef0f2] pt-4">
                      <button
                        onClick={saveContact}
                        disabled={isPending}
                        className={primaryBtnCls}
                      >
                        {isPending
                          ? "Сохранение..."
                          : "Сохранить изменения"}
                      </button>

                      <button
                        onClick={() => setEditing(false)}
                        disabled={isPending}
                        className="h-9 rounded-xl px-3 text-xs font-medium text-[#687382] transition hover:bg-[#f4f5f7] hover:text-[#28313d]"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <p className={labelCls}>
                        Контактное лицо
                      </p>

                      <p className="text-sm font-medium text-[#28313d]">
                        {order.contactName}
                      </p>
                    </div>

                    <div>
                      <p className={labelCls}>
                        Телефон
                      </p>

                      <p className="text-sm font-medium text-[#28313d]">
                        {order.contactPhone}
                      </p>
                    </div>

                    {order.contactEmail && (
                      <div>
                        <p className={labelCls}>
                          Email
                        </p>

                        <p className="break-all text-sm text-[#4c5663]">
                          {order.contactEmail}
                        </p>
                      </div>
                    )}

                    {order.organization && (
                      <div>
                        <p className={labelCls}>Организация</p>
                        <p className="text-sm text-[#4c5663]">{order.organization}</p>
                      </div>
                    )}

                    {order.deliveryMethod && (
                      <div>
                        <p className={labelCls}>Способ получения</p>
                        <p className="text-sm text-[#4c5663]">
                          {order.deliveryMethod === "delivery" ? "Доставка по России" : "Самовывоз со склада"}
                        </p>
                      </div>
                    )}

                    {order.deliveryAddress && (
                      <div>
                        <p className={labelCls}>Адрес доставки</p>
                        <p className="text-sm text-[#4c5663]">{order.deliveryAddress}</p>
                      </div>
                    )}

                    {order.paymentMethod && (
                      <div>
                        <p className={labelCls}>Способ оплаты</p>
                        <p className="text-sm text-[#4c5663]">
                          {{ invoice: "Оплата по счету", card: "Банковской картой", sbp: "СБП" }[order.paymentMethod] ??
                            order.paymentMethod}
                        </p>
                      </div>
                    )}

                    {order.prepaymentType && (
                      <div>
                        <p className={labelCls}>Условия оплаты</p>
                        <p className="text-sm text-[#4c5663]">
                          {{ prepay: "Предоплата", half: "50/50", postpay: "Постоплата" }[order.prepaymentType] ??
                            order.prepaymentType}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className={labelCls}>
                        Статус заказа
                      </p>

                      <select
                        value={order.status}
                        disabled={isPending}
                        onChange={(e) =>
                          changeStatus(
                            e.target.value as OrderStatus
                          )
                        }
                        className={inputCls}
                      >
                        {Object.entries(STATUS_LABELS).map(
                          ([value, label]) => (
                            <option
                              key={value}
                              value={value}
                            >
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {order.comment && (
                      <div className="border-t border-[#eef0f2] pt-5 sm:col-span-2">
                        <p className={labelCls}>
                          Комментарий клиента
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-6 text-[#4c5663]">
                          {order.comment}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* PRODUCTS */}
            <section className={cardCls}>
              <div className="flex items-center justify-between border-b border-[#eef0f2] px-5 py-4">
                <div>
                  <h2 className={cardTitleCls}>
                    Товары
                  </h2>

                  <p className="mt-0.5 text-xs text-[#929aa6]">
                    Состав заказа
                  </p>
                </div>

                <span className="rounded-full bg-[#f1f3f5] px-2.5 py-1 text-xs font-medium text-[#596575]">
                  {order.items.length} поз.
                </span>
              </div>

              <div className="divide-y divide-[#f2f3f5]">
                {order.items.map((item, index) => {
                  const itemTotal =
                    item.priceAtOrder !== null
                      ? item.priceAtOrder * item.quantity
                      : null;

                  if (editingItemId === item.id) {
                    return (
                      <div key={item.id} className="space-y-3 bg-[#fafbfc] px-5 py-4">
                        <div>
                          <label className={labelCls}>Товар</label>

                          <div className="relative">
                            <input
                              value={variantQuery || itemForm.variantLabel}
                              onChange={(e) => searchVariants(e.target.value)}
                              placeholder="Поиск по названию или SKU..."
                              className={inputCls}
                            />

                            {variantResults.length > 0 && (
                              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/[0.08]">
                                {variantResults.map((v) => (
                                  <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => pickVariant(v)}
                                    className="flex w-full flex-col items-start px-3.5 py-2.5 text-left text-sm transition hover:bg-[#f4f5f7]"
                                  >
                                    <span className="font-medium text-[#28313d]">
                                      {v.productName} — {v.name}
                                    </span>
                                    <span className="text-xs text-[#8d96a3]">
                                      {v.sku}
                                      {v.price !== null && ` · ${v.price.toLocaleString("ru-RU")} ₽`}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Количество</label>
                            <input
                              type="number"
                              min={1}
                              value={itemForm.quantity}
                              onChange={(e) =>
                                setItemForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                              }
                              className={inputCls}
                            />
                          </div>

                          <div>
                            <label className={labelCls}>Цена за шт.</label>
                            <input
                              type="number"
                              step="0.01"
                              value={itemForm.priceAtOrder}
                              disabled={itemForm.onRequest}
                              onChange={(e) =>
                                setItemForm((prev) => ({ ...prev, priceAtOrder: e.target.value }))
                              }
                              className={`${inputCls} disabled:bg-[#eef0f2] disabled:text-[#a1a8b3]`}
                            />

                            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-[#7b8592]">
                              <input
                                type="checkbox"
                                checked={itemForm.onRequest}
                                onChange={(e) =>
                                  setItemForm((prev) => ({ ...prev, onRequest: e.target.checked }))
                                }
                              />
                              Цена по запросу
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button onClick={saveEditItem} disabled={isPending} className={primaryBtnCls}>
                            {isPending ? "Сохранение..." : "Сохранить"}
                          </button>
                          <button onClick={cancelEditItem} disabled={isPending} className={secondaryBtnCls}>
                            Отмена
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f5f6] text-xs font-semibold text-[#7d8794]">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#28313d]">
                          {item.variant.product.name}
                        </p>

                        <p className="mt-1 text-xs text-[#8d96a3]">
                          {item.variant.name}
                        </p>

                        <p className="mt-2 text-xs text-[#687382]">
                          {item.quantity} шт.
                          {item.priceAtOrder !== null &&
                            ` × ${item.priceAtOrder.toLocaleString("ru-RU")} ₽`}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-[#28394c]">
                          {itemTotal !== null
                            ? `${itemTotal.toLocaleString("ru-RU")} ₽`
                            : "По запросу"}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => startEditItem(item)}
                          aria-label="Изменить позицию"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#687382] transition hover:bg-[#f4f5f7] hover:text-[#28394c]"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4z" />
                          </svg>
                        </button>

                        {order.items.length > 1 && (
                          <button
                            onClick={() => setDeleteItemId(item.id)}
                            aria-label="Удалить позицию"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b33a3a] transition hover:bg-[#fff0f0]"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M4 6h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {addingItem ? (
                <div className="space-y-3 border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-4">
                  <div>
                    <label className={labelCls}>Товар</label>

                    <div className="relative">
                      <input
                        value={variantQuery || itemForm.variantLabel}
                        onChange={(e) => searchVariants(e.target.value)}
                        placeholder="Поиск по названию или SKU..."
                        className={inputCls}
                        autoFocus
                      />

                      {variantResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/[0.08]">
                          {variantResults.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => pickVariant(v)}
                              className="flex w-full flex-col items-start px-3.5 py-2.5 text-left text-sm transition hover:bg-[#f4f5f7]"
                            >
                              <span className="font-medium text-[#28313d]">
                                {v.productName} — {v.name}
                              </span>
                              <span className="text-xs text-[#8d96a3]">
                                {v.sku}
                                {v.price !== null && ` · ${v.price.toLocaleString("ru-RU")} ₽`}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Количество</label>
                      <input
                        type="number"
                        min={1}
                        value={itemForm.quantity}
                        onChange={(e) =>
                          setItemForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                        }
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Цена за шт.</label>
                      <input
                        type="number"
                        step="0.01"
                        value={itemForm.priceAtOrder}
                        disabled={itemForm.onRequest}
                        onChange={(e) =>
                          setItemForm((prev) => ({ ...prev, priceAtOrder: e.target.value }))
                        }
                        className={`${inputCls} disabled:bg-[#eef0f2] disabled:text-[#a1a8b3]`}
                      />

                      <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-[#7b8592]">
                        <input
                          type="checkbox"
                          checked={itemForm.onRequest}
                          onChange={(e) =>
                            setItemForm((prev) => ({ ...prev, onRequest: e.target.checked }))
                          }
                        />
                        Цена по запросу
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={saveNewItem} disabled={isPending} className={primaryBtnCls}>
                      {isPending ? "Добавление..." : "Добавить в заказ"}
                    </button>
                    <button onClick={cancelAddItem} disabled={isPending} className={secondaryBtnCls}>
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-[#eef0f2] px-5 py-3">
                  <button
                    onClick={startAddItem}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#28394c] hover:underline"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#eef1f4]">+</span>
                    Добавить товар
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between rounded-b-2xl border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-4">
                <span className="text-xs font-medium uppercase tracking-wide text-[#8d96a3]">
                  Итого
                </span>

                <span className="text-lg font-semibold tracking-tight text-[#28394c]">
                  {hasRequestPrice
                    ? "По запросу"
                    : `${orderTotal.toLocaleString(
                        "ru-RU"
                      )} ₽`}
                </span>
              </div>
            </section>

            {/* ATTACHMENTS */}
            {order.attachments.length > 0 && (
              <section className={cardCls}>
                <div className="border-b border-[#eef0f2] px-5 py-4">
                  <h2 className={cardTitleCls}>
                    Вложения
                  </h2>

                  <p className="mt-0.5 text-xs text-[#929aa6]">
                    Файлы, прикреплённые к заказу
                  </p>
                </div>

                <div className="space-y-2 p-5">
                  {order.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 rounded-xl bg-[#f8f9fa] px-3.5 py-3 transition hover:bg-[#f0f2f4]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#687382] shadow-sm">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        >
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                          <path d="M13 2v7h7" />
                        </svg>
                      </div>

                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#4c5663] group-hover:text-[#28394c]">
                        {attachment.filename}
                      </span>

                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="shrink-0 text-[#9aa2ad]"
                      >
                        <path d="M7 17 17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-5">
            {/* STATUS */}
            <section className={cardCls}>
              <div className="border-b border-[#eef0f2] px-5 py-4">
                <h2 className={cardTitleCls}>
                  Статус заказа
                </h2>

                <p className="mt-0.5 text-xs text-[#929aa6]">
                  Текущий этап обработки
                </p>
              </div>

              <div className="p-5">
                <OrderStatusBadge status={order.status} />

                <div className="mt-4">
                  <label className={labelCls}>
                    Изменить статус
                  </label>

                  <select
                    value={order.status}
                    disabled={isPending}
                    onChange={(e) =>
                      changeStatus(
                        e.target.value as OrderStatus
                      )
                    }
                    className={inputCls}
                  >
                    {Object.entries(STATUS_LABELS).map(
                      ([value, label]) => (
                        <option
                          key={value}
                          value={value}
                        >
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </section>

            {/* ADMIN COMMENT */}
            <section className={cardCls}>
              <div className="border-b border-[#eef0f2] px-5 py-4">
                <div className="flex items-center gap-2">
                  <h2 className={cardTitleCls}>
                    Внутренняя заметка
                  </h2>

                  <span className="rounded-full bg-[#f4efe4] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#9a7b3e]">
                    Только для сотрудников
                  </span>
                </div>

                <p className="mt-1 text-xs leading-5 text-[#929aa6]">
                  Не отображается клиенту
                </p>
              </div>

              <div className="p-5">
                <textarea
                  value={adminComment}
                  onChange={(e) =>
                    setAdminComment(e.target.value)
                  }
                  placeholder="Добавьте внутреннюю заметку..."
                  rows={5}
                  className={textareaCls}
                />

                <button
                  onClick={saveAdminComment}
                  disabled={isPending}
                  className={`${primaryBtnCls} mt-3 w-full`}
                >
                  {isPending
                    ? "Сохранение..."
                    : "Сохранить заметку"}
                </button>
              </div>
            </section>

            {/* ORDER INFO */}
            <section className={cardCls}>
              <div className="border-b border-[#eef0f2] px-5 py-4">
                <h2 className={cardTitleCls}>
                  Информация
                </h2>
              </div>

              <div className="divide-y divide-[#f2f3f5]">
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-[#929aa6]">
                    Номер заказа
                  </span>

                  <span className="font-mono text-xs font-medium text-[#4c5663]">
                    №{order.orderNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-[#929aa6]">
                    Дата создания
                  </span>

                  <span className="text-xs font-medium text-[#4c5663]">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString("ru-RU")}
                  </span>
                </div>

                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-[#929aa6]">
                    Время
                  </span>

                  <span className="text-xs font-medium text-[#4c5663]">
                    {new Date(
                      order.createdAt
                    ).toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-[#929aa6]">
                    Количество товаров
                  </span>

                  <span className="text-xs font-medium text-[#4c5663]">
                    {order.items.reduce(
                      (sum, item) =>
                        sum + item.quantity,
                      0
                    )}{" "}
                    шт.
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {deleteOrderConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#18212b]/45 p-4 backdrop-blur-[3px]">
          <div className="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/[0.08]">
            <div className="p-5">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0f0] text-[#b33a3a]">
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 3.5l7 12.5H3L10 3.5z" />
                    <path strokeLinecap="round" d="M10 8v3.5M10 14.2v.1" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-[#28313d]">
                    Удалить заказ №{order.orderNumber}?
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-[#7b8592]">
                    Это действие необратимо. Все позиции и вложения заказа будут удалены.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-4">
              <button onClick={() => setDeleteOrderConfirmOpen(false)} disabled={isPending} className={secondaryBtnCls}>
                Отмена
              </button>
              <button
                onClick={confirmDeleteOrder}
                disabled={isPending}
                className="inline-flex h-9 items-center justify-center rounded-xl bg-[#b33a3a] px-4 text-xs font-medium text-white transition hover:bg-[#963030] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Удаление..." : "Удалить заказ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteItemId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#18212b]/45 p-4 backdrop-blur-[3px]">
          <div className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/[0.08]">
            <div className="p-5">
              <h3 className="text-base font-semibold text-[#28313d]">Удалить позицию?</h3>
              <p className="mt-1 text-sm leading-5 text-[#7b8592]">
                Позиция будет удалена из заказа, сумма пересчитается автоматически.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-4">
              <button onClick={() => setDeleteItemId(null)} disabled={isPending} className={secondaryBtnCls}>
                Отмена
              </button>
              <button
                onClick={confirmDeleteItem}
                disabled={isPending}
                className="inline-flex h-9 items-center justify-center rounded-xl bg-[#b33a3a] px-4 text-xs font-medium text-white transition hover:bg-[#963030] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Удаление..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#18212b]/45 p-4 backdrop-blur-[3px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setErrorMessage(null);
          }}
        >
          <div className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/[0.08]">
            <div className="p-5">
              <h3 className="text-base font-semibold text-[#28313d]">Ошибка</h3>
              <p className="mt-1 text-sm leading-5 text-[#7b8592]">{errorMessage}</p>
            </div>
            <div className="flex items-center justify-end border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-4">
              <button onClick={() => setErrorMessage(null)} className={primaryBtnCls}>
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}