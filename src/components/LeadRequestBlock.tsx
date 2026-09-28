"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { createCallbackLead, createQuoteLead } from "@/lib/actions/lead";
import { LEAD_ACCEPT, LEAD_MAX_FILE_SIZE, LEAD_MAX_FILES } from "@/lib/lead-config";
import ConsentCheckbox from "@/components/ConsentCheckbox";

type Mode = "callback" | "quote";

const inputCls =
  "h-11 w-full rounded-xl bg-[#f3f4f6] px-4 text-sm text-[#1c2126] outline-none placeholder:text-[#969393] focus:ring-2 focus:ring-[#179146]/40";

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
      const files = fd.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
      if (files.length > LEAD_MAX_FILES) {
        setError(`Можно прикрепить не больше ${LEAD_MAX_FILES} файлов`);
        return;
      }
      if (files.some((f) => f.size > LEAD_MAX_FILE_SIZE)) {
        setError(`Размер файла не должен превышать ${LEAD_MAX_FILE_SIZE / 1024 / 1024} МБ`);
        return;
      }
    }

    startTransition(async () => {
      const res = mode === "quote" ? await createQuoteLead(fd) : await createCallbackLead(fd);
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
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#179146]/10 text-[#179146]">
          <svg viewBox="0 0 16 16" fill="none" className="h-7 w-7">
            <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="mt-4 text-xl font-semibold text-[#0f172a]">Заявка отправлена</h3>
        <p className="mt-2 text-sm text-[#767d83]">Мы свяжемся с вами в ближайшее время.</p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 rounded-full border border-[#179146] px-6 py-2 text-sm font-semibold text-[#179146] transition-colors hover:bg-[#179146] hover:text-white"
        >
          Отправить ещё одну
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input type="hidden" name="sourcePage" value={pathname} />
      {/* ловушка для ботов */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <input name="name" required maxLength={100} placeholder="Ваше имя *" className={inputCls} />
      <input name="phone" type="tel" required maxLength={30} placeholder="Телефон *" className={inputCls} />

      {mode === "quote" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="email" type="email" maxLength={150} placeholder="Почта" className={inputCls} />
            <input name="organization" maxLength={200} placeholder="Организация" className={inputCls} />
          </div>
          <textarea
            name="message"
            rows={4}
            maxLength={3000}
            placeholder="Что нужно: наименование, количество, параметры"
            className="w-full resize-none rounded-xl bg-[#f3f4f6] px-4 py-3 text-sm text-[#1c2126] outline-none placeholder:text-[#969393] focus:ring-2 focus:ring-[#179146]/40"
          />
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#c9cdd2] px-4 py-3 text-sm text-[#475569] transition-colors hover:border-[#179146]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#179146]">
              <path d="M21 12.5l-8.5 8.5a5 5 0 01-7-7L14 5.5a3.5 3.5 0 015 5L10.5 19a2 2 0 01-3-3L15 8.5" />
            </svg>
            <span className="min-w-0 truncate">
              {fileNames.length > 0 ? fileNames.join(", ") : "Прикрепить спецификацию (PDF, Word, Excel, фото)"}
            </span>
            <input
              type="file"
              name="attachments"
              multiple
              accept={LEAD_ACCEPT}
              className="sr-only"
              onChange={(e) => setFileNames(Array.from(e.target.files ?? []).map((f) => f.name))}
            />
          </label>
        </>
      )}

      <ConsentCheckbox className="pt-1" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-full bg-[#179146] text-sm font-semibold text-white transition-colors hover:bg-[#127a3a] disabled:opacity-60"
      >
        {pending ? "Отправляем…" : mode === "quote" ? "Запросить коммерческое предложение" : "Перезвоните мне"}
      </button>
    </form>
  );
}

export default function LeadRequestBlock() {
  const [mode, setMode] = useState<Mode>("callback");

  const tabCls = (active: boolean) =>
    `flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
      active ? "bg-[#179146] text-white" : "text-[#475569] hover:bg-[#f3f4f6]"
    }`;

  return (
    <section id="request" className="mt-16 scroll-mt-24">
      <div className="grid gap-8 rounded-3xl bg-[#f3f4f6] p-8 sm:p-12 lg:grid-cols-[1fr_560px]">
        <div className="self-center">
          <h2 className="text-[28px] font-bold leading-[1.2] text-[#0f172a]">Оставьте заявку</h2>
          <p className="mt-3 max-w-md text-base text-[#475569]">
            Не готовы собирать корзину? Оставьте контакты, и мы перезвоним. Или отправьте спецификацию, и мы
            подготовим коммерческое предложение.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-[#475569]">
            {["Подберём оборудование и аналоги", "Рассчитаем стоимость и наличие", "Подготовим коммерческое предложение"].map(
              (t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#179146]" />
                  {t}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex gap-1 rounded-full bg-white p-1 ring-1 ring-[#e9e9e9]">
            <button type="button" onClick={() => setMode("callback")} className={tabCls(mode === "callback")}>
              Перезвоните мне
            </button>
            <button type="button" onClick={() => setMode("quote")} className={tabCls(mode === "quote")}>
              Запросить КП
            </button>
          </div>

          <div className={mode === "callback" ? "" : "hidden"}>
            <LeadForm mode="callback" />
          </div>
          <div className={mode === "quote" ? "" : "hidden"}>
            <LeadForm mode="quote" />
          </div>
        </div>
      </div>
    </section>
  );
}