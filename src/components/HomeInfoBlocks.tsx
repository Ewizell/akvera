import Link from "next/link";

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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s, i) => (
        <div key={s.title} className="rounded-2xl border border-[#e9e9e9] bg-white p-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#179146] text-sm font-bold text-white">
            {i + 1}
          </span>
          <h3 className="mt-4 text-base font-semibold text-[#0f172a]">{s.title}</h3>
          <p className="mt-2 text-sm text-[#767d83]">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

export function HomeAdvantages() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {ADVANTAGES.map((a) => (
        <div key={a.title} className="flex gap-4 rounded-2xl bg-[#f3f4f6] p-6">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#179146]/10 text-[#179146]">
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h3 className="text-base font-semibold text-[#0f172a]">{a.title}</h3>
            <p className="mt-1 text-sm text-[#767d83]">{a.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeCta() {
  return (
    <section className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#179146] p-8 sm:flex-row sm:items-center sm:p-12">
      <div className="max-w-xl">
        <h2 className="text-[28px] font-bold leading-[1.2] text-white">Не нашли нужное оборудование?</h2>
        <p className="mt-2 text-white/85">
          Добавьте товары в корзину и отправьте заявку — мы свяжемся с вами и поможем с подбором.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/catalog"
          className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#179146] transition-opacity hover:opacity-90"
        >
          В каталог
        </Link>
        <Link
          href="/cart"
          className="rounded-full border border-white/60 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Открыть корзину
        </Link>
      </div>
    </section>
  );
}