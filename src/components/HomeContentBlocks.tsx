import Link from "next/link";
import { AboutRequisites } from "@/components/AboutBlocks";
import {
  ABOUT_PARAGRAPHS,
  ABOUT_STATS,
  CONTACTS,
  DELIVERY_ITEMS,
  FAQ_ITEMS,
  SHOW_REQUISITES,
  type DeliveryIcon,
} from "@/lib/site-content";

const ICONS: Record<DeliveryIcon, React.ReactNode> = {
  truck: (
    <>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.5" />
      <circle cx="17" cy="17.5" r="1.5" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
};

export function HomeAbout() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_520px]">
      <div>
        <div className="space-y-4 text-base leading-relaxed text-[#475569]">
          {ABOUT_PARAGRAPHS.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <Link
          href="/about"
          className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[#179146] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#127a3a]"
        >
          Подробнее
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path
              d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        {ABOUT_STATS.map((s) => (
          <div key={s.label} className="rounded-2xl bg-[#f3f4f6] p-6">
            <dt className="text-[32px] font-bold leading-none text-[#179146]">{s.value}</dt>
            <dd className="mt-2 text-sm text-[#767d83]">{s.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function HomeDelivery() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {DELIVERY_ITEMS.map((item) => (
        <div key={item.title} className="rounded-2xl border border-[#e9e9e9] bg-white p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#179146]/10 text-[#179146]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              {ICONS[item.icon]}
            </svg>
          </span>
          <h3 className="mt-4 text-base font-semibold text-[#0f172a]">{item.title}</h3>
          <ul className="mt-3 space-y-2">
            {item.points.map((point) => (
              <li key={point} className="flex gap-2 text-sm text-[#475569]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#179146]" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function HomeFaq() {
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item) => (
        <details
          key={item.question}
          className="group rounded-2xl border border-[#e9e9e9] bg-white px-6 open:border-[#179146]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold text-[#0f172a] [&::-webkit-details-marker]:hidden">
            {item.question}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e9e9e9] text-[#1c2126] transition-transform group-open:rotate-45 group-open:bg-[#179146] group-open:text-white">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
          </summary>
          <p className="pb-5 text-sm leading-relaxed text-[#475569]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function HomeRequisites() {
  const items: { label: string; value: string; href?: string }[] = [
    { label: "Телефон", value: CONTACTS.phone, href: `tel:${CONTACTS.phone.replace(/[^\d+]/g, "")}` },
    { label: "Почта", value: CONTACTS.email, href: `mailto:${CONTACTS.email}` },
    { label: "Адрес", value: CONTACTS.address },
    { label: "Режим работы", value: CONTACTS.hours },
  ];
  const hasMap = Boolean(CONTACTS.mapEmbedUrl);

    return (
    <div className={hasMap ? "grid gap-6 lg:grid-cols-2" : "space-y-6"}>
      <div className="space-y-6">
        <div className={`grid gap-4 sm:grid-cols-2 ${hasMap ? "" : "lg:grid-cols-4"}`}>
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl bg-[#f3f4f6] p-6">
              <p className="text-xs uppercase tracking-wider text-[#969393]">{item.label}</p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-2 block text-base font-semibold text-[#0f172a] transition-colors hover:text-[#179146]"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-2 text-base font-semibold text-[#0f172a]">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        {SHOW_REQUISITES && <AboutRequisites />}
      </div>

      {hasMap && (
        <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-[#e9e9e9] lg:min-h-0">
          <iframe
            src={CONTACTS.mapEmbedUrl}
            title="Карта проезда"
            className="absolute inset-0 h-full w-full"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}