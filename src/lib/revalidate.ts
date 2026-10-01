import { revalidatePath } from "next/cache";

/**
 * Сбрасывает кэш всех страниц сайта.
 * Вызывать после любого изменения данных в админке:
 * теги, товары, исполнения, категории, бренды, документы.
 */
export function revalidateSite() {
  revalidatePath("/", "layout");
}