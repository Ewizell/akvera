import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1fr_0.85fr]">
      {/* Левая карточка */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-[#fff]">
        <div className="flex-1 p-5 sm:p-9 lg:p-10">
          <h3 className="mt-0 max-w-[620px] text-[22px] font-[500] leading-[1.15] tracking-[-0.025em] text-[#28313d] sm:mt-4 sm:text-3xl">
            Оборудование для инженерных систем
          </h3>

          <div className="mt-3 max-w-[650px] space-y-3 text-sm leading-6 text-[#66717d] sm:mt-5 sm:space-y-4 sm:text-[15px] sm:leading-7">
            {ABOUT_PARAGRAPHS.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>

        {/* Нижняя панель: на телефоне кнопка на всю ширину */}
        <div className="px-5 pb-5 sm:px-9 sm:py-5">
          <Link
            href="/about"
            className="group flex h-12 w-full items-center justify-between gap-3 rounded-xl bg-[#e5e8eb] pl-4 pr-1.5 text-sm font-medium text-[#28313d] transition-all duration-300 hover:bg-gradient-to-br hover:from-accent hover:to-accent-end hover:text-white sm:inline-flex sm:h-11 sm:w-auto sm:justify-start"
          >
            <span>Подробнее</span>

            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d9dde1] text-[#28313d] transition-all duration-300 group-hover:bg-white/15 group-hover:text-white">
              <ArrowRight
                size={16}
                strokeWidth={1.8}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </div>
      </div>

      {/* Правая карточка со статистикой */}
      <div className="group relative order-first overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-accent-end sm:min-h-[360px] lg:order-none">
        {/* Декоративный свет */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/[0.07] blur-3xl transition-transform duration-700 group-hover:scale-110" />

        {/* Затемнение в нижней части */}
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-black/[0.12] blur-3xl" />

        {/* Дополнительный градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent-end/35" />

        {/* Статистика */}
        <div className="relative flex h-full flex-col justify-between gap-6 p-5 sm:gap-0 sm:p-7">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/55">
            Akvera в цифрах
          </p>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-8">
            {ABOUT_STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-medium leading-none tracking-[-0.02em] text-white sm:text-3xl">
                  {stat.value}
                </dt>

                <dd className="mt-2 max-w-[150px] text-xs leading-5 text-white/60 sm:text-sm">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

export function HomeDelivery() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
      {DELIVERY_ITEMS.map((item, index) => {
  const inverted = index % 2 === 1;

  // Планшет (2 колонки): нечётная последняя карточка занимает всю ширину
  const isLastOdd =
    index === DELIVERY_ITEMS.length - 1 && DELIVERY_ITEMS.length % 2 === 1;

  return (
    <div
      key={item.title}
      className={[
        isLastOdd ? "sm:max-lg:col-span-2" : "",
        "group relative overflow-hidden rounded-2xl p-5 transition-all duration-500 sm:p-7",
              inverted
                ? "bg-gradient-to-br from-[#28313d] to-[#3d5570] hover:bg-[#e2f0ef] hover:bg-none"
                : "bg-white hover:bg-gradient-to-br hover:from-accent hover:to-accent-end",
            ].join(" ")}
          >
            {/* Декоративная иконка */}
            <div
              className={[
                "pointer-events-none absolute right-3 top-3 transition-colors duration-500 sm:right-5 sm:top-5",
                inverted
                  ? "text-white/10 group-hover:text-accent/10"
                  : "text-accent/10 group-hover:text-white/10",
              ].join(" ")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-24 w-24 sm:h-32 sm:w-32"
              >
                {ICONS[item.icon]}
              </svg>
            </div>

            {/* Контент */}
            <div className="relative z-10">
              <h3
                className={[
                  "relative max-w-[80%] text-base font-medium leading-snug transition-colors duration-500",
                  inverted
                    ? "text-white group-hover:text-[#28313d]"
                    : "text-[#28313d] group-hover:text-white",
                ].join(" ")}
              >
                {item.title}
              </h3>

              <ul className="mt-4 space-y-2 sm:mt-5 sm:space-y-2.5">
                {item.points.map((point) => (
                  <li
                    key={point}
                    className={[
                      "flex gap-2.5 text-[13px] leading-5 transition-colors duration-500 sm:text-sm",
                      inverted
                        ? "text-white/65 group-hover:text-[#66717d]"
                        : "text-[#66717d] group-hover:text-white/65",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500",
                        inverted
                          ? "bg-white/70 group-hover:bg-accent"
                          : "bg-accent group-hover:bg-white/70",
                      ].join(" ")}
                    />

                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function HomeFaq() {
  return (
    <div className="space-y-2.5 sm:space-y-3">
      {FAQ_ITEMS.map((item, index) => {
        const tinted = index % 2 === 1;

        return (
          <details
            key={item.question}
            className={[
              "group overflow-hidden rounded-2xl transition-all duration-500",
              tinted ? "bg-[#fff]" : "bg-white",
              "open:bg-white",
              "open:shadow-[0_4px_20px_rgba(40,49,61,0.06)]",
            ].join(" ")}
          >
            <summary
              className="
                flex
                cursor-pointer
                list-none
                items-center
                justify-between
                gap-3
                px-4
                py-4
                text-[15px]
                font-medium
                leading-6
                select-none
                sm:gap-6
                sm:px-7
                sm:py-5
                text-[#28313d]
                transition-colors
                duration-300
                hover:text-accent
                [&::-webkit-details-marker]:hidden
                sm:px-7
              "
            >
              <span>{item.question}</span>

              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  sm:h-9
                  sm:w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#e5e8eb]
                  text-[#66717d]
                  transition-all
                  duration-500
                  group-hover:bg-[#dfe3e7]
                  group-hover:text-[#28313d]
                  group-open:bg-gradient-to-br
                  group-open:from-accent
                  group-open:to-accent-end
                  group-open:text-white
                  group-open:rotate-45
                "
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M7 1.5v11M1.5 7h11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </summary>

            <div className="px-4 pb-5 sm:px-7 sm:pb-6">
              <div className="h-px bg-[#e9ecef]" />

              <p className="max-w-[850px] break-words pt-4 text-sm leading-6 text-[#66717d] sm:pt-5">
                {item.answer}
              </p>
            </div>
          </details>
        );
      })}
    </div>
  );
}

export function HomeRequisites() {
  const items: {
    label: string;
    value: string;
    href?: string;
  }[] = [
    {
      label: "Телефон",
      value: CONTACTS.phone,
      href: `tel:${CONTACTS.phone.replace(/[^\d+]/g, "")}`,
    },
    {
      label: "Почта",
      value: CONTACTS.email,
      href: `mailto:${CONTACTS.email}`,
    },
    {
      label: "Адрес",
      value: CONTACTS.address,
    },
    {
      label: "Режим работы",
      value: CONTACTS.hours,
    },
  ];

  const hasMap = Boolean(CONTACTS.mapEmbedUrl);

  return (
    <div
      className={
        hasMap
          ? "grid gap-3 sm:gap-4 lg:grid-cols-[0.9fr_1.1fr]"
          : "space-y-3 sm:space-y-4"
      }
    >
      {/* Левая часть */}
      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="p-5 sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#929aa6] sm:text-xs">
            Контакты
          </p>

          <h3 className="mt-2.5 text-[24px] font-medium leading-tight tracking-[-0.025em] text-[#28313d] sm:mt-3 sm:text-2xl">
            Свяжитесь с нами
          </h3>

          <p className="mt-2.5 max-w-[500px] text-[13px] leading-5 text-[#66717d] sm:mt-3 sm:text-sm sm:leading-6">
            Ответим на вопросы по оборудованию и поставке.
          </p>

          {/* Основные контакты */}
          <div className="mt-5 space-y-2.5 sm:mt-7 sm:space-y-3">
            {items.slice(0, 2).map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="
                  group
                  flex
                  min-w-0
                  items-center
                  justify-between
                  gap-3
                  rounded-xl
                  bg-[#f6f6f6]
                  px-4
                  py-3.5
                  transition-all
                  duration-300
                  hover:bg-gradient-to-br
                  hover:from-accent
                  hover:to-accent-end
                  sm:px-5
                  sm:py-4
                "
              >
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#929aa6] transition-colors duration-300 sm:text-[11px] group-hover:text-white/55">
                    {item.label}
                  </p>

                  <p className="mt-1 truncate text-[13px] font-medium text-[#28313d] transition-colors duration-300 sm:text-sm group-hover:text-white">
                    {item.value}
                  </p>
                </div>

                <ArrowRight
                  size={16}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#929aa6] transition-all duration-300 group-hover:translate-x-1 group-hover:text-white"
                />
              </a>
            ))}
          </div>

          {/* Дополнительная информация */}
          <div className="mt-2.5 grid gap-2.5 sm:mt-3 sm:grid-cols-2 sm:gap-3">
            {items.slice(2).map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-[#f6f6f6] px-4 py-3.5 sm:px-5 sm:py-4"
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#929aa6] sm:text-[11px]">
                  {item.label}
                </p>

                <p className="mt-1.5 text-[13px] leading-5 text-[#28313d] sm:text-sm">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {SHOW_REQUISITES && (
          <div className="border-t border-[#dfe3e7] px-5 py-4 sm:px-8 sm:py-5">
            <AboutRequisites />
          </div>
        )}
      </div>

      {/* Правая часть — карта */}
      {hasMap && (
        <div className="relative min-h-[300px] overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-accent-end sm:min-h-[380px] lg:min-h-[420px]">
          <iframe
            src={CONTACTS.mapEmbedUrl}
            title="Карта проезда"
            className="absolute inset-0 h-full w-full"
            loading="lazy"
          />

          {/* Лёгкий градиент поверх карты */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#18212b]/45 via-transparent to-[#18212b]/10" />

          {/* Метка */}
          <div className="pointer-events-none absolute left-4 right-4 top-4 rounded-xl bg-[#18212b]/80 px-3.5 py-2.5 backdrop-blur-sm sm:left-5 sm:right-auto sm:top-5 sm:px-4 sm:py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/50 sm:text-xs">
              Мы находимся
            </p>

            <p className="mt-1 text-[13px] font-medium leading-5 text-white sm:text-sm">
              {CONTACTS.address}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}