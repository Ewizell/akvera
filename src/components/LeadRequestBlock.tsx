"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { createCallbackLead, createQuoteLead } from "@/lib/actions/lead";
import {
  LEAD_ACCEPT,
  LEAD_MAX_FILE_SIZE,
  LEAD_MAX_FILES,
} from "@/lib/lead-config";
import ConsentCheckbox from "@/components/ConsentCheckbox";

type Mode = "callback" | "quote";

// text-base на телефоне: при шрифте меньше 16px iOS Safari увеличивает страницу при фокусе
const inputCls =
  "h-12 w-full rounded-xl bg-[#f3f4f6] px-4 text-base text-[#1c2126] outline-none transition-all duration-300 placeholder:text-[#969da5] focus:bg-white focus:ring-2 focus:ring-accent/25 sm:h-11 sm:text-sm";

function LeadForm({ mode }: { mode: Mode }) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);

    if (mode === "quote") {
      const files = fd
        .getAll("attachments")
        .filter(
          (f): f is File =>
            f instanceof File && f.size > 0
        );

      if (files.length > LEAD_MAX_FILES) {
        setError(
          `Можно прикрепить не больше ${LEAD_MAX_FILES} файлов`
        );
        return;
      }

      if (
        files.some(
          (f) => f.size > LEAD_MAX_FILE_SIZE
        )
      ) {
        setError(
          `Размер файла не должен превышать ${
            LEAD_MAX_FILE_SIZE / 1024 / 1024
          } МБ`
        );
        return;
      }
    }

    startTransition(async () => {
      const res =
        mode === "quote"
          ? await createQuoteLead(fd)
          : await createCallbackLead(fd);

      if (res.success) {
        setDone(true);
        setFileNames([]);
      } else {
        setError(res.error);
      }
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-end text-white shadow-lg shadow-accent/10">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="h-7 w-7"
          >
            <path
              d="M3 8l3 3 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <h3 className="mt-5 text-xl font-semibold text-[#28313d]">
          Заявка отправлена
        </h3>

        <p className="mt-2 text-sm text-[#66717d]">
          Мы свяжемся с вами в ближайшее время.
        </p>

        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 rounded-xl bg-[#f3f4f6] px-5 py-2.5 text-sm font-medium text-[#28313d] transition-all duration-300 hover:bg-gradient-to-br hover:from-accent hover:to-accent-end hover:text-white"
        >
          Отправить ещё одну
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3"
    >
      <input
        type="hidden"
        name="sourcePage"
        value={pathname}
      />

      {/* Ловушка для ботов */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <input
        name="name"
        autoComplete="name"
        required
        maxLength={100}
        placeholder="Ваше имя *"
        className={inputCls}
      />

      <input
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
        maxLength={30}
        placeholder="Телефон *"
        className={inputCls}
      />

      {mode === "callback" && (
        <input
          name="email"
          type="email"
          autoComplete="email"
          maxLength={150}
          placeholder="Почта (необязательно, пришлём подтверждение)"
          className={inputCls}
        />
      )}

      {mode === "quote" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="email"
              type="email"
              autoComplete="email"
              maxLength={150}
              placeholder="Почта"
              className={inputCls}
            />

            <input
              name="organization"
              autoComplete="organization"
              maxLength={200}
              placeholder="Организация"
              className={inputCls}
            />
          </div>

          <textarea
            name="message"
            rows={4}
            maxLength={3000}
            placeholder="Что нужно: наименование, количество, параметры"
            className="w-full resize-none rounded-xl bg-[#f3f4f6] px-4 py-3 text-base text-[#1c2126] outline-none transition-all duration-300 placeholder:text-[#969da5] focus:bg-white focus:ring-2 focus:ring-accent/25 sm:text-sm"
          />

          <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#cfd4d9] bg-[#fafafa] px-4 py-3 text-sm text-[#475569] transition-all duration-300 hover:border-accent hover:bg-[#f4f5f7]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-accent"
            >
              <path d="M21 12.5l-8.5 8.5a5 5 0 01-7-7L14 5.5a3.5 3.5 0 015 5L10.5 19a2 2 0 01-3-3L15 8.5" />
            </svg>

            {/* Короткая подсказка на телефоне, полная от sm */}
            <span className="min-w-0 truncate">
              {fileNames.length > 0 ? (
                fileNames.join(", ")
              ) : (
                <>
                  <span className="sm:hidden">Прикрепить спецификацию</span>
                  <span className="hidden sm:inline">
                    Прикрепить спецификацию (PDF, Word, Excel, фото)
                  </span>
                </>
              )}
            </span>

            <input
              type="file"
              name="attachments"
              multiple
              accept={LEAD_ACCEPT}
              className="sr-only"
              onChange={(e) =>
                setFileNames(
                  Array.from(
                    e.target.files ?? []
                  ).map((f) => f.name)
                )
              }
            />
          </label>
        </>
      )}

      <ConsentCheckbox className="pt-1" />

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-accent to-accent-end text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/15 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="relative">
          {pending
            ? "Отправляем…"
            : mode === "quote"
              ? "Запросить коммерческое предложение"
              : "Перезвоните мне"}
        </span>
      </button>
    </form>
  );
}

export default function LeadRequestBlock() {
  const [mode, setMode] = useState<Mode>("callback");

  const tabCls = (active: boolean) =>
    `flex-1 rounded-xl px-2 py-3 text-sm font-semibold transition-all duration-300 sm:px-4 ${
      active
        ? "bg-white text-[#28313d] shadow-[0_2px_8px_rgba(40,49,61,0.08)]"
        : "text-[#66717d] hover:bg-white/60 hover:text-[#28313d]"
    }`;

  return (
    <section
      id="request"
      className="mt-10 scroll-mt-[76px] sm:mt-16 lg:mt-20 lg:scroll-mt-[132px]"
    >
      <div className="grid overflow-hidden rounded-3xl bg-[#28313d] lg:grid-cols-[0.9fr_1.1fr]">

        {/* Левая часть */}
        <div className="relative flex flex-col overflow-hidden p-5 sm:p-9 lg:min-h-[520px] lg:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#28313d] via-[#28313d] to-[#18212b]" />

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#0f172a]/50 blur-3xl" />

          <div className="relative flex h-full flex-col">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                Свяжитесь с нами
              </p>

              <h2 className="mt-3 max-w-[480px] text-[26px] font-medium leading-[1.1] tracking-[-0.03em] text-white sm:mt-4 sm:text-[36px]">
                Поможем подобрать оборудование под вашу задачу
              </h2>

              <p className="mt-3 max-w-[470px] text-sm leading-6 text-white/60 sm:mt-5 sm:text-[15px] sm:leading-7">
                Расскажите, что вам требуется. Подберём оборудование,
                проверим наличие и подготовим предложение с учётом вашей
                задачи.
              </p>
            </div>

            <div className="mt-auto pt-6 sm:pt-10">
              <div className="border-t border-white/10 pt-5 sm:pt-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">
                  Что мы можем сделать
                </p>

                <ul className="mt-5 space-y-3">
                  {[
                    "Подобрать оборудование и аналоги",
                    "Проверить стоимость и наличие",
                    "Подготовить коммерческое предложение",
                  ].map((text) => (
                    <li
                      key={text}
                      className="flex items-center gap-3 text-sm text-white/70"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[#4fbd7a]">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2.5 6l2.2 2.2L9.5 3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>

                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Правая часть */}
        <div className="bg-[#fff] p-3 sm:p-6 lg:p-7">
          <div className="rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(40,49,61,0.07)] sm:p-7">

            {/* Переключатель */}
            <div className="mb-5 flex gap-1 rounded-xl bg-[#f4f5f7] p-1 sm:mb-6">
              <button
                type="button"
                onClick={() => setMode("callback")}
                className={tabCls(mode === "callback")}
              >
                Перезвоните мне
              </button>

              <button
                type="button"
                onClick={() => setMode("quote")}
                className={tabCls(mode === "quote")}
              >
                Запросить КП
              </button>
            </div>

            {/* Обе формы лежат в одной ячейке grid: высоту блока задаёт самая
                высокая из них, поэтому ничего не выходит за границы и не нужен
                фиксированный min-h. Скрытая форма остаётся в раскладке (invisible),
                так что при переключении вкладок блок не прыгает. */}
            <div className="grid">
              <div
                className={[
                  "[grid-area:1/1] transition-opacity duration-300",
                  mode === "callback"
                    ? "visible opacity-100"
                    : "pointer-events-none invisible opacity-0",
                ].join(" ")}
              >
                <LeadForm mode="callback" />
              </div>

              <div
                className={[
                  "[grid-area:1/1] transition-opacity duration-300",
                  mode === "quote"
                    ? "visible opacity-100"
                    : "pointer-events-none invisible opacity-0",
                ].join(" ")}
              >
                <LeadForm mode="quote" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}