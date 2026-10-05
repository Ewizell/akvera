"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { createOrder } from "@/lib/actions/order";

type DeliveryMethod = "delivery" | "pickup";
type PaymentMethod = "invoice" | "card" | "sbp";
type PrepaymentType = "prepay" | "half" | "postpay";

function RadioOption({
  name,
  value,
  checked,
  onChange,
  label,
  disabled,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={[
        "group inline-flex min-h-10 items-center gap-2.5 rounded-xl px-3.5",
        "text-[13px] font-medium transition-all duration-300",
        "focus-within:ring-2 focus-within:ring-accent/30",
        disabled
          ? "cursor-not-allowed text-[#b8bec4]"
          : checked
            ? "bg-white text-[#28313d] shadow-[0_2px_8px_rgba(40,49,61,0.06)]"
            : "cursor-pointer text-[#66717d] hover:bg-white/60 hover:text-[#28313d]",
      ].join(" ")}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />

      <span
        className={[
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
          disabled
            ? "border-[#d9dde1]"
            : checked
              ? "border-accent"
              : "border-[#aeb6be] group-hover:border-[#7f8993]",
        ].join(" ")}
      >
        {checked && !disabled && (
          <span className="h-2 w-2 rounded-full bg-accent" />
        )}
      </span>

      <span>{label}</span>
    </label>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <p className="text-[12px] font-semibold text-[#66717d]">{label}</p>
      {children}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-[#e1e5e8] bg-white px-3.5 text-[14px] text-[#28313d] transition-all duration-200 placeholder:text-[#a0a8b0] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10";

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e1e5e8] bg-[#f4f5f7] p-4 sm:p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[13px] font-semibold text-[#66717d] shadow-[0_2px_8px_rgba(40,49,61,0.04)]">
          {number}
        </span>

        <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#28313d]">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

export function CheckoutForm() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("delivery");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("invoice");
  const [prepaymentType, setPrepaymentType] =
    useState<PrepaymentType>("prepay");
  const [agreed, setAgreed] = useState(false);

  const hasRequestPriceItems = items.some((item) => item.price === null);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);

    setFiles((prev) => {
      const merged = [...prev];

      for (const file of selected) {
        if (
          !merged.some(
            (item) =>
              item.name === file.name && item.size === file.size
          )
        ) {
          merged.push(file);
        }
      }

      return merged;
    });

    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.set(
      "items",
      JSON.stringify(
        items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        }))
      )
    );

    formData.set("deliveryMethod", deliveryMethod);
    formData.set("paymentMethod", paymentMethod);
    formData.set("prepaymentType", prepaymentType);

    if (files.length > 0) {
      for (const file of files) {
        formData.append("attachments", file);
      }
    }

    startTransition(async () => {
      const result = await createOrder(formData);

      if (result.success) {
        clearCart();
        router.push(`/checkout/success/${result.orderId}`);
      } else {
        setError(result.error);
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e1e5e8] bg-[#f4f5f7] p-8 text-center">
        <p className="text-[14px] text-[#66717d]">Корзина пуста.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-start gap-5 lg:flex-row"
    >
      <div className="flex min-w-0 w-full flex-1 flex-col gap-4">
        {/* 1. Контактные данные */}
        <Section number="01" title="Контактные данные">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <FormField label="Имя">
                <input
                  name="contactName"
                  required
                  autoComplete="name"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Организация">
                <input
                  name="organization"
                  autoComplete="organization"
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <FormField label="Телефон">
                <input
                  name="contactPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  className={inputClass}
                />
              </FormField>

              <FormField label="Электронная почта">
                <input
                  name="contactEmail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className={inputClass}
                  placeholder="Пришлём подтверждение заявки"
                />
              </FormField>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#dfe3e6] pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-[#28313d]">
                    Вложения
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#929aa6]">
                    Карточка компании, ТЗ и другие документы
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="
                    inline-flex
                    h-9
                    shrink-0
                    items-center
                    rounded-xl
                    bg-[#e5e8eb]
                    px-3.5
                    text-[13px]
                    font-medium
                    text-[#66717d]
                    transition-all
                    duration-300
                    hover:bg-white
                    hover:text-[#28313d]
                    hover:shadow-[0_3px_12px_rgba(40,49,61,0.06)]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-accent/30
                  "
                >
                  + Добавить файл
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </div>

              {files.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${file.size}-${index}`}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        rounded-xl
                        bg-white
                        px-3
                        py-2
                        text-[13px]
                        text-[#28313d]
                      "
                    >
                      <span className="min-w-0 truncate">{file.name}</span>

                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="
                          shrink-0
                          text-[#929aa6]
                          transition-colors
                          hover:text-[#28313d]
                        "
                        aria-label={`Убрать ${file.name}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Section>

        {/* 2. Способ получения */}
        <Section number="02" title="Способ получения">
          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl bg-[#e5e8eb] p-1.5">
              <RadioOption
                name="deliveryMethod"
                value="delivery"
                checked={deliveryMethod === "delivery"}
                onChange={() => setDeliveryMethod("delivery")}
                label="Доставка по России"
              />

              <RadioOption
                name="deliveryMethod"
                value="pickup"
                checked={deliveryMethod === "pickup"}
                onChange={() => setDeliveryMethod("pickup")}
                label="Самовывоз со склада"
              />
            </div>

            {deliveryMethod === "delivery" && (
              <div className="border-t border-[#dfe3e6] pt-4">
                <FormField label="Адрес доставки">
                  <input
                    name="deliveryAddress"
                    className={inputClass}
                    placeholder="Город, улица, дом"
                  />
                </FormField>
              </div>
            )}

            <FormField label="Комментарий">
              <input
                name="comment"
                className={inputClass}
                placeholder="Укажите удобное время или дополнительную информацию"
              />
            </FormField>
          </div>
        </Section>

        {/* 3. Способ оплаты */}
        <Section number="03" title="Способ оплаты">
          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl bg-[#e5e8eb] p-1.5">
              <RadioOption
                name="paymentMethod"
                value="invoice"
                checked={paymentMethod === "invoice"}
                onChange={() => setPaymentMethod("invoice")}
                label="Оплата по счёту"
              />

              <RadioOption
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                label="Банковской картой"
                disabled
              />

              <RadioOption
                name="paymentMethod"
                value="sbp"
                checked={paymentMethod === "sbp"}
                onChange={() => setPaymentMethod("sbp")}
                label="СБП"
                disabled
              />
            </div>

            <div className="border-t border-[#dfe3e6] pt-4">
              <p className="mb-2 text-[12px] font-semibold text-[#66717d]">
                Условия оплаты
              </p>

              <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl bg-[#e5e8eb] p-1.5">
                <RadioOption
                  name="prepaymentType"
                  value="prepay"
                  checked={prepaymentType === "prepay"}
                  onChange={() => setPrepaymentType("prepay")}
                  label="Предоплата"
                />

                <RadioOption
                  name="prepaymentType"
                  value="half"
                  checked={prepaymentType === "half"}
                  onChange={() => setPrepaymentType("half")}
                  label="50/50"
                />

                <RadioOption
                  name="prepaymentType"
                  value="postpay"
                  checked={prepaymentType === "postpay"}
                  onChange={() => setPrepaymentType("postpay")}
                  label="Постоплата"
                />
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Ваша заявка */}
      <aside
        className="
          w-full
          shrink-0
          rounded-2xl
          border
          border-[#e1e5e8]
          bg-[#f4f5f7]
          p-4
          sm:p-5
          lg:sticky
          lg:top-24
          lg:w-[360px]
        "
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[18px] font-semibold text-[#28313d]">
              Ваша заявка
            </h2>

            <span className="rounded-lg bg-white px-2.5 py-1 text-[12px] font-medium text-[#929aa6]">
              {items.length}{" "}
              {items.length === 1
                ? "товар"
                : items.length < 5
                  ? "товара"
                  : "товаров"}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                  rounded-xl
                  bg-white
                  px-3
                  py-2.5
                "
              >
                <span className="min-w-0 line-clamp-2 text-[13px] text-[#66717d]">
                  {item.productName}
                  {item.variantName ? ` — ${item.variantName}` : ""}
                </span>

                <span className="shrink-0 text-[13px] font-semibold text-[#28313d]">
                  × {item.quantity}
                </span>
              </div>
            ))}
          </div>

          {hasRequestPriceItems && (
            <div className="flex gap-2.5 rounded-xl bg-white px-3 py-3">
              <div className="w-[3px] shrink-0 rounded-full bg-accent" />

              <p className="text-[12px] leading-relaxed text-[#66717d]">
                Есть товары с ценой по запросу — сумма будет уточнена при
                обработке заявки.
              </p>
            </div>
          )}

          <div className="border-t border-[#dfe3e6] pt-4">
            <p className="text-[12px] font-medium text-[#929aa6]">
              Предварительная сумма
            </p>

            <p className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-[#28313d]">
              {totalPrice.toLocaleString("ru-RU")} ₽
            </p>
          </div>

          {error && (
            <p className="rounded-xl bg-[#fff1f1] px-3 py-2.5 text-[13px] text-[#c23b3b]">
              {error}
            </p>
          )}

          <label className="order-1 flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-[#767d83] lg:order-2">
            <input
              type="checkbox"
              name="consent"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
            />

            <span>
              Я даю{" "}
              <a
                href="/consent"
                target="_blank"
                className="font-medium text-accent hover:underline"
              >
                согласие на обработку персональных данных
              </a>{" "}
              и ознакомлен(а) с{" "}
              <a
                href="/privacy"
                target="_blank"
                className="font-medium text-accent hover:underline"
              >
                политикой обработки персональных данных
              </a>
            </span>
          </label>

          <button
            type="submit"
            disabled={isPending || !agreed}
            className="
              order-2
              flex
              h-12
              w-full
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-accent
              to-accent-end
              text-[14px]
              font-semibold
              text-white
              shadow-[0_4px_14px_rgba(23,145,70,0.14)]
              transition-all
              duration-300
              hover:shadow-[0_6px_18px_rgba(23,145,70,0.18)]
              disabled:cursor-not-allowed
              disabled:opacity-50
              lg:order-1
            "
          >
            {isPending ? "Отправка..." : "Отправить заявку"}
          </button>
        </div>
      </aside>
    </form>
  );
}