"use server";

import { Prisma } from "@/generated/prisma/client";
import { LeadStatus, LeadType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import path from "path";
import { uploadDocumentServer, deleteFromS3 } from "@/lib/actions/upload";
import { LEAD_ALLOWED_EXTENSIONS, LEAD_MAX_FILES, LEAD_MAX_FILE_SIZE } from "@/lib/lead-config";
import { getConsentMeta } from "@/lib/consent-meta";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

async function isRateLimited(): Promise<boolean> {
  const h = await headers();
  const ip =
    h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function str(formData: FormData, key: string, max: number): string {
  return (formData.get(key)?.toString().trim() ?? "").slice(0, max);
}

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") throw new Error("Forbidden");
}

async function createLead(type: LeadType, formData: FormData, allowFiles: boolean) {
  try {
    // ловушка для ботов: люди скрытое поле не заполняют
    if (formData.get("website")?.toString()) return { success: true as const };

    if (formData.get("consent")?.toString() !== "on") {
      return { success: false as const, error: "Нужно согласие на обработку персональных данных" };
    }
    if (await isRateLimited()) {
      return { success: false as const, error: "Слишком много заявок. Попробуйте позже." };
    }

    const name = str(formData, "name", 100);
    const phone = str(formData, "phone", 30);
    const email = str(formData, "email", 150) || null;
    const organization = str(formData, "organization", 200) || null;
    const message = str(formData, "message", 3000) || null;
    const rawSource = str(formData, "sourcePage", 300);
    const sourcePage = rawSource.startsWith("/") ? rawSource : null;

    if (!name) return { success: false as const, error: "Укажите имя" };
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      return { success: false as const, error: "Укажите корректный телефон" };
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false as const, error: "Укажите корректную почту" };
    }

    const files = allowFiles
      ? formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0)
      : [];

    if (files.length > LEAD_MAX_FILES) {
      return { success: false as const, error: `Можно прикрепить не больше ${LEAD_MAX_FILES} файлов` };
    }
    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      if (!LEAD_ALLOWED_EXTENSIONS.includes(ext)) {
        return { success: false as const, error: `Файл «${file.name}»: неподдерживаемый формат` };
      }
      if (file.size > LEAD_MAX_FILE_SIZE) {
        return {
          success: false as const,
          error: `Файл «${file.name}» больше ${LEAD_MAX_FILE_SIZE / 1024 / 1024} МБ`,
        };
      }
    }

    if (type === LeadType.QUOTE && !message && files.length === 0) {
      return { success: false as const, error: "Опишите, что нужно, или прикрепите спецификацию" };
    }

    const leadId = randomUUID();
    const saved: { url: string; filename: string }[] = [];

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      if (!LEAD_ALLOWED_EXTENSIONS.includes(ext)) {
        return { success: false as const, error: `Файл «${file.name}»: неподдерживаемый формат` };
      }

      const uploadFd = new FormData();
      uploadFd.set("file", file);
      const uploaded = await uploadDocumentServer(uploadFd);
      if (!uploaded.success || !uploaded.url) {
        return { success: false as const, error: uploaded.error ?? "Не удалось загрузить файл" };
      }
      saved.push({ url: uploaded.url, filename: file.name.slice(0, 200) });
    }

    await prisma.lead.create({
      data: {
        id: leadId,
        type,
        name,
        phone,
        email,
        organization,
        message,
        sourcePage,
        ...(await getConsentMeta()),
        ...(saved.length > 0 ? { attachments: { create: saved } } : {}),
      },
    });

    revalidatePath("/admin/leads");
    return { success: true as const };
  } catch (error) {
    console.error("createLead error:", error);
    return { success: false as const, error: "Не удалось отправить заявку. Попробуйте ещё раз." };
  }
}

export async function createCallbackLead(formData: FormData) {
  return createLead(LeadType.CALLBACK, formData, false);
}

export async function createQuoteLead(formData: FormData) {
  return createLead(LeadType.QUOTE, formData, true);
}

// ── админка ──

export async function getLeads(params: {
  type?: LeadType;
  status?: LeadStatus;
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();
  const { type, status, page = 1, pageSize = 20 } = params;

  const where: Prisma.LeadWhereInput = {
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { attachments: { select: { id: true, url: true, filename: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  return { items, total, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  await requireAdmin();
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath("/admin/leads");
}

export async function updateLeadAdminComment(id: string, adminComment: string | null) {
  await requireAdmin();
  await prisma.lead.update({ where: { id }, data: { adminComment } });
  revalidatePath("/admin/leads");
}

export async function deleteLead(id: string) {
  await requireAdmin();
  const lead = await prisma.lead.findUnique({
    where: { id },
    select: { attachments: { select: { url: true } } },
  });

  await prisma.lead.delete({ where: { id } }); // бросит ошибку, если id не существует

  if (lead) {
    for (const attachment of lead.attachments) {
      await deleteFromS3(attachment.url);
    }
  }

  revalidatePath("/admin/leads");
}