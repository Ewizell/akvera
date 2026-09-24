import { getOrderById } from "@/lib/actions/order";
import { notFound } from "next/navigation";
import { PrintTrigger } from "./PrintTrigger";
import { STATUS_LABELS } from "@/lib/orderTypes";

export default async function OrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return notFound();

  const hasRequestPrice = order.items.some((i) => i.priceAtOrder === null);
  const total = order.items.reduce(
    (sum, i) => sum + (i.priceAtOrder ?? 0) * i.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-[800px] p-8 font-sans text-[#1a1f26] print:p-0">
      <PrintTrigger />

      <div className="mb-6 flex items-start justify-between border-b border-[#1a1f26] pb-4">
        <div>
          <h1 className="text-2xl font-bold">Заказ №{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-[#5b6470]">
            от {new Date(order.createdAt).toLocaleDateString("ru-RU")}
          </p>
        </div>

        <div className="text-right text-sm">
          <p className="font-semibold">Akvera</p>
          <p className="text-[#5b6470]">Статус: {STATUS_LABELS[order.status]}</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#8d96a3]">
            Клиент
          </p>
          <p className="font-medium">{order.contactName}</p>
          <p>{order.contactPhone}</p>
          {order.contactEmail && <p>{order.contactEmail}</p>}
          {order.organization && <p>{order.organization}</p>}
        </div>

        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#8d96a3]">
            Доставка и оплата
          </p>
          {order.deliveryMethod && (
            <p>
              {order.deliveryMethod === "delivery" ? "Доставка по России" : "Самовывоз со склада"}
            </p>
          )}
          {order.deliveryAddress && <p>{order.deliveryAddress}</p>}
          {order.paymentMethod && (
            <p>
              {{ invoice: "Оплата по счету", card: "Банковской картой", sbp: "СБП" }[order.paymentMethod] ??
                order.paymentMethod}
            </p>
          )}
        </div>
      </div>

      {order.comment && (
        <div className="mb-6 rounded-md bg-[#f4f5f7] p-3 text-sm print:bg-white print:border print:border-[#d8dde3]">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#8d96a3]">
            Комментарий клиента
          </p>
          <p>{order.comment}</p>
        </div>
      )}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-[#1a1f26] text-left">
            <th className="py-2 pr-2 font-semibold">#</th>
            <th className="py-2 pr-2 font-semibold">Товар</th>
            <th className="py-2 pr-2 font-semibold">Артикул</th>
            <th className="py-2 pr-2 text-right font-semibold">Кол-во</th>
            <th className="py-2 pr-2 text-right font-semibold">Цена</th>
            <th className="py-2 text-right font-semibold">Сумма</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={item.id} className="border-b border-[#e3e6ea]">
              <td className="py-2 pr-2 text-[#8d96a3]">{index + 1}</td>
              <td className="py-2 pr-2">
                {item.variant.product.name}
                <span className="block text-xs text-[#8d96a3]">{item.variant.name}</span>
              </td>
              <td className="py-2 pr-2 font-mono text-xs text-[#5b6470]">{item.variant.sku}</td>
              <td className="py-2 pr-2 text-right">{item.quantity}</td>
              <td className="py-2 pr-2 text-right">
                {item.priceAtOrder !== null ? `${item.priceAtOrder.toLocaleString("ru-RU")} ₽` : "—"}
              </td>
              <td className="py-2 text-right font-medium">
                {item.priceAtOrder !== null
                  ? `${(item.priceAtOrder * item.quantity).toLocaleString("ru-RU")} ₽`
                  : "По запросу"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end border-t-2 border-[#1a1f26] pt-3">
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-[#8d96a3]">Итого</p>
          <p className="text-xl font-bold">
            {hasRequestPrice ? "По запросу" : `${total.toLocaleString("ru-RU")} ₽`}
          </p>
        </div>
      </div>

      {order.attachments.length > 0 && (
        <div className="mt-6 text-xs text-[#8d96a3]">
          <p className="mb-1 font-semibold uppercase tracking-wide">Вложения</p>
          <ul className="list-disc pl-4">
            {order.attachments.map((a) => (
              <li key={a.id}>{a.filename}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}