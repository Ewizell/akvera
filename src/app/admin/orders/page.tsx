import { getOrders } from "@/lib/actions/order";
import { OrdersList } from "@/components/OrdersList";

export default async function AdminOrdersPage() {
  const initial = await getOrders({ page: 1 });

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f8fa] to-[#eef0f3] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8a93a1] shadow-sm ring-1 ring-black/[0.04]">
              Администрирование
              <span className="h-1 w-1 rounded-full bg-[#c29e57]" />
              Продажи
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-[#1e2a38]">
              Заказы
            </h1>

            <p className="mt-1.5 text-sm text-[#737d8c]">
              Управление заказами, клиентами и обработкой заявок
            </p>
          </div>
        </div>

        <OrdersList initial={initial} />
      </div>
    </main>
  );
}