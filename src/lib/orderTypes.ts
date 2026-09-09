import { OrderStatus } from "@/generated/prisma";

export type OrderListItem = {
  id: string;
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