import Link from "next/link";
import { ArrowRight } from "lucide-react";
// ✏️ Тексты — черновик, поправь под реальные условия работы
const STEPS = [
  { title: "Выберите товары", text: "Найдите оборудование в каталоге или через поиск, сравните характеристики моделей." },
  { title: "Оформите заявку", text: "Добавьте позиции в корзину и отправьте заявку — оплата на сайте не требуется." },
  { title: "Мы свяжемся с вами", text: "Менеджер уточнит детали, наличие и стоимость." },
  { title: "Получите счёт", text: "Согласуем условия, выставим счёт и организуем поставку." },
];

const ADVANTAGES = [
  { title: "Актуальные цены и наличие", text: "Стоимость и остатки по каждой модели видны прямо в каталоге." },
  { title: "Техническая документация", text: "Паспорта, сертификаты и инструкции доступны на страницах товаров." },
  { title: "Подбор и сравнение", text: "Фильтры по характеристикам и сравнение моделей помогают выбрать оборудование." },
  { title: "Работа с юридическими лицами", text: "Заявки, счета и закрывающие документы для вашего бизнеса." },
];

export function HomeSteps() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const inverted = index % 2 === 0;

          return (
            <div
              key={step.title}
              className={[
                "group relative p-6 transition-all duration-500 sm:p-7 lg:p-8",
                index > 0
                  ? "border-t border-[#dfe3e7] sm:border-l sm:border-t-0"
                  : "",
                inverted
                  ? "bg-gradient-to-br from-[#179146] to-[#0f172a]"
                  : "bg-white",
                inverted
                  ? "hover:bg-white hover:bg-none"
                  : "hover:bg-gradient-to-br hover:from-[#179146] hover:to-[#0f172a]",
              ].join(" ")}
            >
              {/* Номер */}
              <span
                className={[
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all duration-500",
                  inverted
                    ? "bg-white/15 text-white group-hover:bg-[#f3f4f6] group-hover:text-[#179146]"
                    : "bg-gradient-to-br from-[#179146] to-[#0f172a] text-white group-hover:bg-white/15 group-hover:bg-none group-hover:text-white",
                ].join(" ")}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Линия между шагами */}
              {index < STEPS.length - 1 && (
                <div
                  className={[
                    "absolute left-[68px] right-[-1px] top-[47px] hidden h-px transition-colors duration-500 lg:block",
                    inverted
                      ? "bg-white/20 group-hover:bg-[#dfe3e7]"
                      : "bg-[#dfe3e7] group-hover:bg-white/20",
                  ].join(" ")}
                />
              )}

              {/* Контент */}
              <div className="relative mt-6">
                <h3
                  className={[
                    "text-base font-medium leading-snug transition-colors duration-500",
                    inverted
                      ? "text-white group-hover:text-[#28313d]"
                      : "text-[#28313d] group-hover:text-white",
                  ].join(" ")}
                >
                  {step.title}
                </h3>

                <p
                  className={[
                    "mt-2 text-sm leading-6 transition-colors duration-500",
                    inverted
                      ? "text-white/65 group-hover:text-[#66717d]"
                      : "text-[#66717d] group-hover:text-white/65",
                  ].join(" ")}
                >
                  {step.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HomeAdvantages() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {ADVANTAGES.map((item, index) => {
        const inverted = index % 2 === 1;

        return (
          <div
            key={item.title}
            className={[
              "group relative overflow-hidden rounded-2xl p-6 transition-all duration-500",
              inverted
                ? "bg-gradient-to-br from-[#179146] to-[#0f172a] hover:bg-white hover:bg-none"
                : "bg-white hover:bg-gradient-to-br hover:from-[#179146] hover:to-[#0f172a]",
            ].join(" ")}
          >
            {/* Иконка */}
            <span
              className={[
                "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500",
                inverted
                  ? "bg-white/15 text-white group-hover:bg-[#f3f4f6] group-hover:text-[#179146]"
                  : "bg-[#f3f4f6] text-[#179146] group-hover:bg-white/15 group-hover:text-white",
              ].join(" ")}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  d="M3 8l3 3 7-7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            {/* Текст */}
            <div className="mt-6">
              <h3
                className={[
                  "text-base font-medium leading-snug transition-colors duration-500",
                  inverted
                    ? "text-white group-hover:text-[#28313d]"
                    : "text-[#28313d] group-hover:text-white",
                ].join(" ")}
              >
                {item.title}
              </h3>

              <p
                className={[
                  "mt-2 text-sm leading-6 transition-colors duration-500",
                  inverted
                    ? "text-white/65 group-hover:text-[#66717d]"
                    : "text-[#66717d] group-hover:text-white/65",
                ].join(" ")}
              >
                {item.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function HomeCta() {
  return (
    <section className="relative mt-20 overflow-hidden rounded-3xl bg-gradient-to-br from-[#179146] to-[#0f172a]">
      {/* Декоративный фон */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/[0.06]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-black/[0.08]" />

      <div className="relative flex flex-col gap-8 p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
        {/* Текст */}
        <div className="max-w-[680px]">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/50">
            Поможем с выбором
          </p>

          <h2 className="mt-3 text-2xl font-medium leading-[1.15] tracking-[-0.025em] text-white sm:text-3xl">
            Не нашли нужное оборудование?
          </h2>

          <p className="mt-4 max-w-[600px] text-sm leading-6 text-white/65 sm:text-base">
            Расскажите, какое оборудование вам требуется.
            <br />Поможем подобрать решение и подготовим предложение.
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link
            href="/catalog"
            className="
              group
              inline-flex
              h-12
              items-center
              gap-3
              rounded-xl
              bg-white
              pl-5
              pr-1.5
              text-sm
              font-medium
              text-[#28313d]
              transition-all
              duration-300
              hover:bg-[#f4f5f7]
            "
          >
            <span>В каталог</span>

            <span
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-[#e5e8eb]
                transition-all
                duration-300
                group-hover:bg-[#179146]
                group-hover:text-white
              "
            >
              <ArrowRight
                size={16}
                strokeWidth={1.8}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </Link>

          <Link
            href="/cart"
            className="
              inline-flex
              h-12
              items-center
              rounded-xl
              border
              border-white/20
              bg-white/[0.06]
              px-5
              text-sm
              font-medium
              text-white
              backdrop-blur-sm
              transition-all
              duration-300
              hover:border-white/30
              hover:bg-white/12
            "
          >
            Открыть корзину
          </Link>
        </div>
      </div>
    </section>
  );
}