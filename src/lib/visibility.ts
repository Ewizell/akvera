import { prisma } from '@/lib/prisma';

/**
 * ID всех категорий, видимых публично: сама категория и вся цепочка её
 * предков не скрыты. Скрытие родителя автоматически "гасит" всех потомков.
 */
export async function getVisibleCategoryIds(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    WITH RECURSIVE visible AS (
      SELECT id FROM "Category" WHERE "parentId" IS NULL AND "isHidden" = false
      UNION ALL
      SELECT c.id FROM "Category" c
      JOIN visible v ON c."parentId" = v.id
      WHERE c."isHidden" = false
    )
    SELECT id FROM visible
  `;
  return rows.map((r) => r.id);
}