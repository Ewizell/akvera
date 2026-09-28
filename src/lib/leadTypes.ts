export type LeadListItem = {
  id: string;
  type: "CALLBACK" | "QUOTE";
  status:
    | "NEW"
    | "IN_PROGRESS"
    | "DONE"
    | "CANCELLED"
    | "SPAM";
  name: string;
  phone: string;
  email: string | null;
  organization: string | null;
  message: string | null;
  sourcePage: string | null;
  adminComment: string | null;
  createdAt: Date;
  attachments: { id: string; url: string; filename: string }[];
};

export const LEAD_TYPE_LABELS: Record<LeadListItem["type"], string> = {
  CALLBACK: "Перезвонить",
  QUOTE: "Запрос КП",
};

export const LEAD_STATUS_LABELS: Record<LeadListItem["status"], string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  DONE: "Обработана",
  SPAM: "Спам",
  CANCELLED: "Отменена",
  
};