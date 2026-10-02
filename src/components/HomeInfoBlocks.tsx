import Link from "next/link";
import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    title: "Выберите товары",
    text: "Найдите оборудование в каталоге или через поиск, сравните характеристики моделей.",
  },
  {
    title: "Оформите заявку",
    text: "Добавьте позиции в корзину и отправьте заявку — оплата на сайте не требуется.",
  },
  {
    title: "Мы свяжемся с вами",
    text: "Менеджер уточнит детали, наличие и стоимость.",
  },
  {
    title: "Получите счёт",
    text: "Согласуем условия, выставим счёт и организуем поставку.",
  },
];

const ADVANTAGES = [
  {
    title: "Актуальные цены и наличие",
    text: "Стоимость и остатки по каждой модели видны прямо в каталоге.",
  },
  {
    title: "Техническая документация",
    text: "Паспорта, сертификаты и инструкции доступны на страницах товаров.",
  },
  {
    title: "Подбор и сравнение",
    text: "Фильтры по характеристикам и сравнение моделей помогают выбрать оборудование.",
  },
  {
    title: "Работа с юридическими лицами",
    text: "Заявки, счета и закрывающие документы для вашего бизнеса.",
  },
];

export function HomeSteps() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const inverted = index % 2 === 1;

          return (
            <div
              key={step.title}
              className={[
                "group relative flex items-start gap-3 p-4 transition-all duration-500 sm:block sm:p-7 lg:p-8",

                index > 0
                  ? "border-t border-[#dfe3e7] sm:border-l sm:border-t-0"
                  : "",

                inverted
                  ? "bg-gradient-to-br from-[#28313d] to-[#3d5570] hover:bg-[#e2f0ef] hover:bg-none"
                  : "bg-white hover:bg-gradient-to-br hover:from-accent hover:to-accent-end",
              ].join(" ")}
            >
              {/* Номер */}
              <span
                className={[
                  "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[12px] font-medium transition-all duration-500 sm:h-10 sm:w-10 sm:text-sm",
                  inverted
                    ? "bg-white/15 text-white group-hover:bg-white group-hover:text-accent"
                    : "bg-[#f3f4f7] text-accent group-hover:bg-white/15 group-hover:text-white",
                ].join(" ")}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Линия между шагами — только на больших экранах */}
              {index < STEPS.length - 1 && (
                <div
                  className={[
                    "absolute left-[68px] right-[-1px] top-[47px] hidden h-px transition-colors duration-500 lg:block",
                    inverted
                      ? "bg-white/20 group-hover:bg-[#cbd8e5]"
                      : "bg-[#dfe3e7] group-hover:bg-white/20",
                  ].join(" ")}
                />
              )}

              {/* Контент */}
              <div className="relative min-w-0 sm:mt-6">
                <h3
                  className={[
                    "text-[14px] font-medium leading-snug transition-colors duration-500 sm:text-base",
                    inverted
                      ? "text-white group-hover:text-[#28313d]"
                      : "text-[#28313d] group-hover:text-white",
                  ].join(" ")}
                >
                  {step.title}
                </h3>

                <p
                  className={[
                    "mt-1.5 text-[12px] leading-[1.45] transition-colors duration-500 sm:mt-2 sm:text-sm sm:leading-6",
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
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      {ADVANTAGES.map((item, index) => {
        const inverted = index % 2 === 1;

        // На мобильном меняем 3-й и 4-й элементы местами,
        // чтобы цвета располагались диагонально.
        const mobileOrder =
          index === 2
            ? "max-lg:order-4"
            : index === 3
              ? "max-lg:order-3"
              : "";

        return (
          <div
            key={item.title}
            className={[
              mobileOrder,
              "group relative overflow-hidden rounded-2xl p-3.5 transition-all duration-500 sm:p-6",

              inverted
                ? "bg-gradient-to-br from-[#28313d] to-[#3d5570] hover:bg-[#e2f0ef] hover:bg-none"
                : "bg-white hover:bg-gradient-to-br hover:from-accent hover:to-accent-end",
            ].join(" ")}
          >
            {/* Иконка */}
            <span
              className={[
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-500 sm:h-10 sm:w-10 sm:rounded-xl",
                inverted
                  ? "bg-white/15 text-white group-hover:bg-white group-hover:text-[#28313d]"
                  : "bg-[#f3f4f6] text-accent group-hover:bg-white/15 group-hover:text-white",
              ].join(" ")}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
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
            <div className="mt-3.5 sm:mt-6">
              <h3
                className={[
                  "text-[13px] font-medium leading-[1.3] transition-colors duration-500 sm:text-base sm:leading-snug",
                  inverted
                    ? "text-white group-hover:text-[#28313d]"
                    : "text-[#28313d] group-hover:text-white",
                ].join(" ")}
              >
                {item.title}
              </h3>

              <p
                className={[
                  "mt-1.5 text-[11.5px] leading-[1.5] transition-colors duration-500 sm:mt-2 sm:text-sm sm:leading-6",
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
    <section className="relative mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-accent-end sm:mt-16 sm:rounded-3xl lg:mt-20">
      {/* Декоративный фон */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/[0.06] sm:h-72 sm:w-72" />

      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-black/[0.08] sm:-bottom-32 sm:h-80 sm:w-80" />

      <div className="relative flex flex-col gap-6 p-5 sm:gap-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
        {/* Текст */}
        <div className="max-w-[680px]">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/50 sm:text-xs">
            Поможем с выбором
          </p>

          <h2 className="mt-2.5 text-[25px] font-medium leading-[1.15] tracking-[-0.025em] text-white sm:mt-3 sm:text-3xl">
            Не нашли нужное оборудование?
          </h2>

          <p className="mt-3 max-w-[600px] text-[13px] leading-5 text-white/65 sm:mt-4 sm:text-base sm:leading-6">
            Расскажите, какое оборудование вам требуется.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Поможем подобрать решение и подготовим предложение.
          </p>
        </div>

{/* Кнопки */}
<div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
  <Link
    href="/catalog"
    className="
      group
      inline-flex
      h-11
      w-full
      items-center
      rounded-xl
      bg-white
      px-1.5
      text-sm
      font-medium
      text-[#28313d]
      transition-all
      duration-300
      hover:bg-[#f4f5f7]
      sm:h-12
      sm:w-auto
    "
  >
    <span className="flex flex-1 items-center justify-center pl-3 sm:pl-3">
      В каталог
    </span>

    <span
      className="
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-lg
        bg-[#e5e8eb]
        transition-all
        duration-300
        group-hover:bg-accent
        group-hover:text-white
        sm:h-9
        sm:w-9
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
    href="/#requisites"
    className="
      inline-flex
      h-11
      w-full
      items-center
      rounded-xl
      border
      border-white/20
      bg-white/[0.06]
      px-1.5
      text-sm
      font-medium
      text-white
      backdrop-blur-sm
      transition-all
      duration-300
      hover:border-white/30
      hover:bg-white/12
      sm:h-12
      sm:w-auto
    "
  >
    <span className="flex flex-1 items-center justify-center pl-3 sm:pl-3">
      Контакты
    </span>

    {/* Пустая область той же ширины, что и стрелка */}
    <span className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
  </Link>
</div>
      </div>
    </section>
  );
}
