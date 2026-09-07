import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Личный кабинет",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Новый",
  PROCESSING: "В обработке",
  COMPLETED: "Выполнен",
  CANCELLED: "Отменён",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          variant: { include: { product: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Личный кабинет</h1>
      <p className="text-gray-500 mb-8">{session.user.email}</p>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">История заказов</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">У вас пока нет заказов.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  Заказ от {order.createdAt.toLocaleDateString("ru-RU")}
                </span>
                <span className="text-sm text-gray-500">
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.variant.product.name} — {item.variant.name} × {item.quantity}
                    {item.priceAtOrder !== null && (
                      <> — {Number(item.priceAtOrder) * item.quantity} ₽</>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}