import Link from "next/link";
import { getLeads } from "@/lib/actions/lead";
import { LeadStatus, LeadType } from "@/generated/prisma/enums";
import LeadsList from "@/components/LeadsList";
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/leadTypes";

export const dynamic = "force-dynamic";

function buildHref(
  type?: string,
  status?: string,
  page?: number
) {
  const p = new URLSearchParams();

  if (type) p.set("type", type);
  if (status) p.set("status", status);
  if (page && page > 1) p.set("page", String(page));

  const qs = p.toString();

  return qs
    ? `/admin/leads?${qs}`
    : "/admin/leads";
}

const filterCls =
  "inline-flex h-9 items-center justify-center rounded-xl px-3.5 text-xs font-semibold transition";

const activeFilterCls =
  "bg-[#28394c] text-white shadow-sm";

const inactiveFilterCls =
  "bg-white text-[#687382] ring-1 ring-black/[0.05] hover:bg-[#f4f5f7] hover:text-[#28394c]";

const sectionLabelCls =
  "mb-2 block text-[10px] font-semibold uppercase tracking-wide text-[#8b949f]";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;

  const type = Object.values(LeadType).includes(
    sp.type as LeadType
  )
    ? (sp.type as LeadType)
    : undefined;

  const status = Object.values(LeadStatus).includes(
    sp.status as LeadStatus
  )
    ? (sp.status as LeadStatus)
    : undefined;

  const page = Math.max(
    1,
    parseInt(sp.page ?? "1", 10) || 1
  );

  const {
    items,
    total,
    pageCount,
  } = await getLeads({
    type,
    status,
    page,
  });

  return (
    <div className="min-h-full bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#8b949f]">
              Администрирование
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#28313d]">
              Заявки
            </h1>

            <p className="mt-1 text-sm text-[#8b949f]">
              Обращения клиентов и запросы на оборудование
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-semibold text-[#687382] shadow-sm ring-1 ring-black/[0.04]">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#eef1f4] text-[#28394c]">
              {total}
            </span>

            Всего заявок
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] sm:p-5">
          <div className="grid gap-5 lg:grid-cols-2">

            {/* Types */}
            <div>
              <span className={sectionLabelCls}>
                Тип заявки
              </span>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildHref(undefined, status)}
                  className={`${filterCls} ${
                    !type
                      ? activeFilterCls
                      : inactiveFilterCls
                  }`}
                >
                  Все типы
                </Link>

                {Object.values(LeadType).map((t) => (
                  <Link
                    key={t}
                    href={buildHref(t, status)}
                    className={`${filterCls} ${
                      type === t
                        ? activeFilterCls
                        : inactiveFilterCls
                    }`}
                  >
                    {LEAD_TYPE_LABELS[t]}
                  </Link>
                ))}
              </div>
            </div>

            {/* Statuses */}
            <div>
              <span className={sectionLabelCls}>
                Статус
              </span>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildHref(type)}
                  className={`${filterCls} ${
                    !status
                      ? activeFilterCls
                      : inactiveFilterCls
                  }`}
                >
                  Все статусы
                </Link>

                {Object.values(LeadStatus).map((s) => (
                  <Link
                    key={s}
                    href={buildHref(type, s)}
                    className={`${filterCls} ${
                      status === s
                        ? activeFilterCls
                        : inactiveFilterCls
                    }`}
                  >
                    {LEAD_STATUS_LABELS[s]}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leads */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#28313d]">
                Список заявок
              </h2>

              <p className="mt-0.5 text-xs text-[#969faa]">
                {items.length > 0
                  ? `Показано ${items.length} заявок`
                  : "Заявок по выбранным фильтрам нет"}
              </p>
            </div>

            {pageCount > 1 && (
              <div className="rounded-xl bg-[#f4f5f7] px-3 py-2 text-xs font-semibold text-[#687382]">
                Страница {page} из {pageCount}
              </div>
            )}
          </div>

          <LeadsList items={items} />
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-[#969faa]">
              Страница{" "}
              <span className="font-semibold text-[#28313d]">
                {page}
              </span>{" "}
              из{" "}
              <span className="font-semibold text-[#28313d]">
                {pageCount}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={buildHref(
                    type,
                    status,
                    page - 1
                  )}
                  className={`${filterCls} ${inactiveFilterCls} cursor-pointer`}
                >
                  ← Назад
                </Link>
              ) : (
                <span
                  className={`${filterCls} cursor-not-allowed bg-[#f4f5f7] text-[#b4bac2]`}
                >
                  ← Назад
                </span>
              )}

              <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-[#28394c] px-3 text-xs font-semibold text-white">
                {page}
              </div>

              {page < pageCount ? (
                <Link
                  href={buildHref(
                    type,
                    status,
                    page + 1
                  )}
                  className={`${filterCls} ${inactiveFilterCls} cursor-pointer`}
                >
                  Вперёд →
                </Link>
              ) : (
                <span
                  className={`${filterCls} cursor-not-allowed bg-[#f4f5f7] text-[#b4bac2]`}
                >
                  Вперёд →
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

