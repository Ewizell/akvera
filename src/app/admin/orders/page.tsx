import { getOrders } from "@/lib/actions/order";
import { OrdersList } from "@/components/OrdersList";

export default async function AdminOrdersPage() {
  const initial = await getOrders({ page: 1 });
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Заказы</h1>
      <OrdersList initial={initial} />
    </div>
  );
}