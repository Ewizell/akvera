import { getOrderById } from "@/lib/actions/order";
import { notFound } from "next/navigation";

export default async function OrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return notFound();

  return (
    <html>
      <body className="p-8 font-sans text-black">
        <h1 className="text-xl font-bold mb-4">Заказ {order.id}</h1>
        <p>Клиент: {order.contactName} ({order.contactEmail ?? order.contactPhone})</p>
        <p>Дата: {new Date(order.createdAt).toLocaleString("ru-RU")}</p>
        <table className="w-full mt-4 border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-1">Товар</th>
              <th>Кол-во</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="py-1">{i.variant.product.name} — {i.variant.name}</td>
                <td>{i.quantity}</td>
                <td>{i.priceAtOrder !== null ? `${i.priceAtOrder * i.quantity} ₽` : "По запросу"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <script dangerouslySetInnerHTML={{ __html: `window.onload = () => window.print();` }} />
      </body>
    </html>
  );
}