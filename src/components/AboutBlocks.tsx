import { ACTIVITIES, VALUES, REQUISITES } from "@/lib/site-content";

export function AboutActivities() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {ACTIVITIES.map((a, i) => {
        const isLight =
          i % 4 === 0 ||
          i % 4 === 3;

        return (
          <div
            key={a.title}
            className={[
              "group relative min-h-[250px] overflow-hidden rounded-2xl p-6 sm:p-7",
              "transition-all duration-300",

              isLight
                ? "bg-white hover:bg-gradient-to-br hover:from-accent hover:to-accent-end"
                : "bg-[#eef0f2] hover:bg-gradient-to-br hover:from-accent hover:to-accent-end",
            ].join(" ")}
          >
            {/* Большая декоративная иконка */}
            <div
              className="
                pointer-events-none
                absolute
                -right-5
                -top-5
                text-accent/[0.07]
                transition-all
                duration-500
                group-hover:scale-105
                group-hover:text-white/[0.08]
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-40 w-40"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12l2.5 2.5L16 9" />
              </svg>
            </div>

            {/* Контент */}
            <div className="relative z-10">
              <span
                className="
                  text-xs
                  font-semibold
                  tracking-[0.12em]
                  text-accent
                  transition-colors
                  duration-300
                  group-hover:text-white/60
                "
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="mt-14 max-w-[80%]">
                <h3
                  className="
                    text-xl
                    font-medium
                    leading-tight
                    tracking-[-0.02em]
                    text-[#28313d]
                    transition-colors
                    duration-300
                    group-hover:text-white
                  "
                >
                  {a.title}
                </h3>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-[#66717d]
                    transition-colors
                    duration-300
                    group-hover:text-white/65
                  "
                >
                  {a.text}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AboutValues() {
  return (
    <div className="rounded-2xl bg-white p-6 sm:p-8 lg:p-10">
      {/* Центральный акцент */}
      <div className="max-w-[700px]">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Наш подход
        </span>

        <h3 className="mt-3 max-w-[600px] text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#28313d] sm:text-3xl">
          Подбираем оборудование не по каталогу, а под задачу
        </h3>

        <p className="mt-3 max-w-[650px] text-sm leading-6 text-[#66717d]">
          Учитываем технические требования, условия эксплуатации,
          особенности объекта и задачи заказчика.
        </p>
      </div>

      {/* Принципы */}
      <div className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
        {VALUES.map((v, i) => (
          <div
            key={v.title}
            className="
              group
              relative
              border-t
              border-[#e5e8eb]
              pt-5
            "
          >
            <div className="flex items-start gap-4">
              {/* Номер */}
              <span
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#f0f2f3]
                  text-xs
                  font-semibold
                  text-accent
                  transition-all
                  duration-300
                  group-hover:bg-accent
                  group-hover:text-white
                "
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div>
                <h4
                  className="
                    text-base
                    font-medium
                    leading-snug
                    text-[#28313d]
                  "
                >
                  {v.title}
                </h4>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[#66717d]
                  "
                >
                  {v.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AboutRequisites() {
  return (
    <dl className="divide-y divide-[#e0e2e5] rounded-2xl bg-[#f3f4f6]">
      {REQUISITES.filter((r) => r.value.trim() !== "").map((r) => (
        <div key={r.label} className="grid gap-1 px-6 py-4 sm:grid-cols-[200px_1fr] sm:gap-4">
          <dt className="text-sm text-[#969393]">{r.label}</dt>
          <dd className="text-sm font-medium text-[#0f172a]">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}