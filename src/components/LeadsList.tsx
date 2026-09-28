"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateLeadStatus,
  updateLeadAdminComment,
  deleteLead,
} from "@/lib/actions/lead";
import {
  LEAD_STATUS_LABELS,
  LEAD_TYPE_LABELS,
  type LeadListItem,
} from "@/lib/leadTypes";

const cardCls =
  "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] transition hover:shadow-md";

const inputCls =
  "h-10 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15 disabled:cursor-not-allowed disabled:opacity-60";

const textareaCls =
  "w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 py-3 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15";

const primaryButtonCls =
  "inline-flex h-9 items-center justify-center rounded-xl bg-[#28394c] px-3.5 text-xs font-semibold text-white transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonCls =
  "inline-flex h-9 items-center justify-center rounded-xl bg-[#f4f5f7] px-3.5 text-xs font-semibold text-[#4f5a67] transition hover:bg-[#e9ecef] disabled:cursor-not-allowed disabled:opacity-50";

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 animate-spin"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        className="opacity-25"
      />
      <path
        strokeLinecap="round"
        d="M21 12a9 9 0 00-9-9"
      />
    </svg>
  );
}

function LeadIcon({
  type,
}: {
  type: "lead" | "user" | "phone" | "mail" | "organization" | "comment";
}) {
  if (type === "user") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <circle cx="10" cy="7" r="3" />
        <path
          strokeLinecap="round"
          d="M4.5 16c.7-2.5 2.5-4 5.5-4s4.8 1.5 5.5 4"
        />
      </svg>
    );
  }

  if (type === "phone") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.2 3.5l2.1 3.7-1.4 1.5c.8 1.7 2.1 3 3.8 3.8l1.5-1.4 3.7 2.1-.7 2.7c-.2.8-1 1.3-1.8 1.2C8 16.4 3.6 12 2.9 6.6c-.1-.8.4-1.6 1.2-1.8l2.1-.7z"
        />
      </svg>
    );
  }

  if (type === "mail") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect
          x="3"
          y="4.5"
          width="14"
          height="11"
          rx="2"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6l6 4.5L16 6"
        />
      </svg>
    );
  }

  if (type === "organization") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16V5.5L10 3l6 2.5V16"
        />
        <path
          strokeLinecap="round"
          d="M7 16v-3h6v3M7 7h.01M10 7h.01M13 7h.01M7 10h.01M10 10h.01M13 10h.01"
        />
      </svg>
    );
  }

  if (type === "comment") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5.5A2.5 2.5 0 016.5 3h7A2.5 2.5 0 0116 5.5v5a2.5 2.5 0 01-2.5 2.5H9l-4 3v-3.4A2.5 2.5 0 014 10.5v-5z"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 4h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
      />
      <path
        strokeLinecap="round"
        d="M7 8h6M7 11h4"
      />
      <circle cx="13.5" cy="13.5" r="2.5" />
      <path
        strokeLinecap="round"
        d="M13.5 12.2v1.4M12.8 13.5h1.4"
      />
    </svg>
  );
}

function getStatusClass(status: LeadListItem["status"]) {
  switch (status) {
    case "NEW":
      return "bg-[#eef5f8] text-[#28394c] ring-[#dce7ec]";

    case "IN_PROGRESS":
      return "bg-[#f5f1e8] text-[#8a6a2c] ring-[#eadfca]";

    case "DONE":
      return "bg-[#f1f7f3] text-[#397653] ring-[#d5e8dc]";

    case "CANCELLED":
      return "bg-[#f5f5f5] text-[#7b8592] ring-[#e2e4e7]";

    default:
      return "bg-[#f4f5f7] text-[#687382] ring-[#e1e4e8]";
  }
}

export default function LeadsList({
  items,
}: {
  items: LeadListItem[];
}) {
  const router = useRouter();

  const [pending, startTransition] =
    useTransition();

  const [confirmId, setConfirmId] =
    useState<string | null>(null);

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      setConfirmId(null);
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-black/[0.04]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef1f4] text-[#687382]">
          <LeadIcon type="lead" />
        </div>

        <p className="mt-4 text-sm font-semibold text-[#28313d]">
          Заявок пока нет
        </p>

        <p className="mt-1 text-xs text-[#969faa]">
          Новые обращения появятся здесь.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((l) => (
        <div
          key={l.id}
          className={`${cardCls} ${
            l.status === "NEW"
              ? "ring-2 ring-[#28394c]/10"
              : ""
          }`}
        >
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                <LeadIcon type="lead" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#eef1f4] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#28394c]">
                    {LEAD_TYPE_LABELS[l.type]}
                  </span>

                  {l.status === "NEW" && (
                    <span className="rounded-md bg-[#f1f7f3] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#397653]">
                      Новая
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-xs text-[#969faa]">
                  {new Date(
                    l.createdAt
                  ).toLocaleString("ru-RU")}
                </p>
              </div>
            </div>

            <select
              value={l.status}
              disabled={pending}
              onChange={(e) =>
                run(() =>
                  updateLeadStatus(
                    l.id,
                    e.target
                      .value as LeadListItem["status"]
                  )
                )
              }
              className="h-9 w-full rounded-xl border-0 bg-[#f4f5f7] px-3 text-xs font-semibold text-[#4f5a67] outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-2 focus:ring-[#28394c]/15 sm:w-auto"
            >
              {Object.entries(
                LEAD_STATUS_LABELS
              ).map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Contact information */}
          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#edf0f2] pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex min-w-0 items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4f5f7] text-[#687382]">
                <LeadIcon type="user" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#969faa]">
                  Имя
                </p>

                <p className="mt-0.5 truncate text-sm font-medium text-[#28313d]">
                  {l.name}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4f5f7] text-[#687382]">
                <LeadIcon type="phone" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#969faa]">
                  Телефон
                </p>

                <a
                  href={`tel:${l.phone.replace(
                    /[^\d+]/g,
                    ""
                  )}`}
                  className="mt-0.5 block truncate text-sm font-medium text-[#28394c] hover:underline"
                >
                  {l.phone}
                </a>
              </div>
            </div>

            {l.email && (
              <div className="flex min-w-0 items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4f5f7] text-[#687382]">
                  <LeadIcon type="mail" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#969faa]">
                    Почта
                  </p>

                  <a
                    href={`mailto:${l.email}`}
                    className="mt-0.5 block truncate text-sm font-medium text-[#28394c] hover:underline"
                  >
                    {l.email}
                  </a>
                </div>
              </div>
            )}

            {l.organization && (
              <div className="flex min-w-0 items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4f5f7] text-[#687382]">
                  <LeadIcon type="organization" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#969faa]">
                    Организация
                  </p>

                  <p className="mt-0.5 truncate text-sm font-medium text-[#28313d]">
                    {l.organization}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {l.message && (
            <div className="mt-4 rounded-xl bg-[#f4f5f7] p-3.5">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-[#687382]">
                  <LeadIcon type="comment" />
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#7b8592]">
                  Сообщение
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-6 text-[#4f5a67]">
                {l.message}
              </p>
            </div>
          )}

          {/* Attachments */}
          {l.attachments.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#969faa]">
                Вложения
              </p>

              <div className="flex flex-wrap gap-2">
                {l.attachments.map((a) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#f4f5f7] px-3 py-2 text-xs font-medium text-[#4f5a67] transition hover:bg-[#e9ecef] hover:text-[#28394c]"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-3.5 w-3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 10.5l4.7-4.7a2.5 2.5 0 013.6 3.5l-5.7 5.8a4 4 0 01-5.7-5.7l6-6"
                      />
                    </svg>

                    <span className="max-w-[220px] truncate">
                      {a.filename}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Source */}
          {l.sourcePage && (
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[#edf0f2] pt-3 text-xs">
              <span className="font-semibold text-[#969faa]">
                Страница:
              </span>

              <span className="font-mono text-[#687382]">
                {l.sourcePage}
              </span>
            </div>
          )}

          {/* Manager comment + delete */}
          <div className="mt-4 border-t border-[#edf0f2] pt-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef1f4] text-[#28394c]">
                <LeadIcon type="comment" />
              </div>

              <div>
                <p className="text-xs font-semibold text-[#28313d]">
                  Комментарий менеджера
                </p>

                <p className="text-[10px] text-[#969faa]">
                  Сохраняется автоматически при выходе из поля
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
              <textarea
                defaultValue={
                  l.adminComment ?? ""
                }
                rows={2}
                placeholder="Добавить комментарий..."
                onBlur={(e) => {
                  const value =
                    e.target.value.trim();

                  if (
                    value !==
                    (l.adminComment ?? "")
                  ) {
                    run(() =>
                      updateLeadAdminComment(
                        l.id,
                        value || null
                      )
                    );
                  }
                }}
                className={`${textareaCls} min-h-[76px] resize-none lg:flex-1`}
              />

              {confirmId === l.id ? (
                <div className="flex shrink-0 flex-col gap-2 rounded-xl bg-[#fff7f7] p-3 ring-1 ring-[#f0d5d5] sm:flex-row sm:items-center">
                  <span className="text-xs font-medium text-[#7b4b4b]">
                    Удалить заявку?
                  </span>

                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      run(() =>
                        deleteLead(l.id)
                      )
                    }
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-[#b33a3a] px-3.5 text-xs font-semibold text-white transition hover:bg-[#9f3030] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pending && (
                      <span className="mr-2">
                        <Spinner />
                      </span>
                    )}
                    Да, удалить
                  </button>

                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      setConfirmId(null)
                    }
                    className={secondaryButtonCls}
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmId(l.id)
                  }
                  disabled={pending}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#fff7f7] px-3.5 text-xs font-semibold text-[#b33a3a] ring-1 ring-[#f0d5d5] transition hover:bg-[#ffefef] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-3.5 w-3.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      strokeLinecap="round"
                      d="M4 6h12"
                    />
                    <path
                      strokeLinecap="round"
                      d="M8 3.5h4"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6l.7 10.5h6.6L14 6"
                    />
                    <path
                      strokeLinecap="round"
                      d="M8.5 9v5M11.5 9v5"
                    />
                  </svg>

                  Удалить
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}