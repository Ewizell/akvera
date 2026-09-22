import { OrderStatus } from "@/generated/prisma/enums";
import { STATUS_LABELS } from "@/lib/orderTypes";

const COLORS: Record<OrderStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}