export const LEAD_MAX_FILES = 5;
export const LEAD_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ на файл
export const LEAD_ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt", ".jpg", ".jpeg", ".png",
];
export const LEAD_ACCEPT = LEAD_ALLOWED_EXTENSIONS.join(",");