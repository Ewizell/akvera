import { OrderStatus } from "@/generated/prisma/enums";

export type OrderListItem = {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  createdAt: Date;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string;
  itemsCount: number;
  total: number | null;
  adminComment: string | null;
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Новая",
  PROCESSING: "В обработке",
  COMPLETED: "Завершена",
  CANCELLED: "Отменена",
};