'use server'

import { getAdminSession } from '@/lib/auth/assert-admin'
import { storeDocument } from '@/lib/s3-server'

// Только для админки (document.ts, productDocument.ts).
// Публичные формы (lead.ts, order.ts) вызывают storeDocument напрямую.
export async function uploadDocumentServer(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!(await getAdminSession())) return { success: false, error: 'Нет доступа' }
  return storeDocument(formData)
}