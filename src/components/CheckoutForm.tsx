'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { createOrder } from '@/lib/actions/order'

type DeliveryMethod = 'delivery' | 'pickup'
type PaymentMethod = 'invoice' | 'card' | 'sbp'
type PrepaymentType = 'prepay' | 'half' | 'postpay'

function RadioOption({
  name,
  value,
  checked,
  onChange,
  label,
  disabled,
}: {
  name: string
  value: string
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <label
      className={`flex items-center gap-1.5 text-[14px] ${
        disabled ? 'text-[#c8c6c6] cursor-not-allowed' : 'text-[#1c2126] cursor-pointer'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-[17px] h-[17px] accent-[#179146] disabled:accent-[#d9d9d9]"
      />
      {label}
    </label>
  )
}

function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
      <p className="text-[13px] font-semibold text-[#475569]">{label}</p>
      {children}
    </div>
  )
}

const inputClass =
  'w-full h-12 border border-[#e5e7e8] rounded-xl px-3.5 text-[14px] text-[#1c2126] bg-white focus:outline-none focus:border-[#179146] transition-colors'

export function CheckoutForm() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('invoice')
  const [prepaymentType, setPrepaymentType] = useState<PrepaymentType>('prepay')
  const [agreed, setAgreed] = useState(false)

  const hasRequestPriceItems = items.some((item) => item.price === null)

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setFiles((prev) => {
      const merged = [...prev]
      for (const f of selected) {
        if (!merged.some((m) => m.name === f.name && m.size === f.size)) {
          merged.push(f)
        }
      }
      return merged
    })
    // сбрасываем value, чтобы можно было выбрать тот же файл ещё раз
    e.target.value = ''
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    formData.set(
      'items',
      JSON.stringify(items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })))
    )
    formData.set('deliveryMethod', deliveryMethod)
    formData.set('paymentMethod', paymentMethod)
    formData.set('prepaymentType', prepaymentType)

    if (files.length > 0) {
      for (const file of files) {
        formData.append('attachments', file)
      }
    }

    startTransition(async () => {
      const result = await createOrder(formData)
      if (result.success) {
        clearCart()
        router.push(`/checkout/success/${result.orderId}`)
      } else {
        setError(result.error)
      }
    })
  }

  if (items.length === 0) {
    return <p className="text-gray-600">Корзина пуста.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="flex-1 min-w-0 w-full flex flex-col gap-5">
        {/* 1. Контактные данные */}
        <div className="bg-white border border-[#e5e7e8] rounded-2xl shadow-[0px_6px_18px_0px_rgba(15,23,42,0.07)] p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">1. Контактные данные</h2>
          <div className="flex gap-4">
            <FormField label="Имя">
              <input name="contactName" required className={inputClass} />
            </FormField>
            {/* TODO: поле organization пока не сохраняется бэкендом */}
            <FormField label="Организация">
              <input name="organization" className={inputClass} />
            </FormField>
          </div>
          <div className="flex gap-4">
            <FormField label="Телефон">
              <input name="contactPhone" required className={inputClass} />
            </FormField>
            <FormField label="Электронная почта">
              <input name="contactEmail" type="email" className={inputClass} />
            </FormField>
          </div>
          {/* Вложения — нет в макете, оставил как есть, т.к. функциональность уже была */}
          <div className="flex flex-col gap-2 px-2">
          <h2 className="text-lg font-semibold">Вложения (Карточка компании, ТЗ)</h2>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-fit text-sm font-medium text-[#179146] border border-[#179146] rounded-lg px-3 py-1.5 hover:bg-[#f0faf3] transition-colors"
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

          {files.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${file.size}-${i}`}
                  className="flex items-center justify-between gap-2 text-sm text-[#1c2126] bg-[#f4f5f7] rounded-lg px-3 py-1.5"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-[#767d83] hover:text-red-600 shrink-0 transition-colors"
                    aria-label={`Убрать ${file.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        </div>
        

        {/* 2. Способ получения */}
        <div className="bg-white border border-[#e5e7e8] rounded-2xl shadow-[0px_6px_18px_0px_rgba(15,23,42,0.07)] p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">2. Способ получения</h2>
          <div className="flex gap-6">
            <RadioOption
              name="deliveryMethod"
              value="delivery"
              checked={deliveryMethod === 'delivery'}
              onChange={() => setDeliveryMethod('delivery')}
              label="Доставка по России"
            />
            <RadioOption
              name="deliveryMethod"
              value="pickup"
              checked={deliveryMethod === 'pickup'}
              onChange={() => setDeliveryMethod('pickup')}
              label="Самовывоз со склада"
            />
          </div>

          {deliveryMethod === 'delivery' && (
            <>
              <div className="h-px bg-[#d9d9d9]" />
              <FormField label="Адрес доставки">
                <input name="deliveryAddress" className={inputClass} placeholder="Город, улица, дом" />
              </FormField>
            </>
          )}

          <FormField label="Комментарий">
            <input name="comment" className={inputClass} placeholder="Укажите удобное время" />
          </FormField>
        </div>

        {/* 3. Способ оплаты */}
        <div className="bg-white border border-[#e5e7e8] rounded-2xl shadow-[0px_6px_18px_0px_rgba(15,23,42,0.07)] p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">3. Способ оплаты</h2>
          <div className="flex gap-6">
            <RadioOption
              name="paymentMethod"
              value="invoice"
              checked={paymentMethod === 'invoice'}
              onChange={() => setPaymentMethod('invoice')}
              label="Оплата по счету"
            />
            {/* Пока недоступны — включите, когда подключите онлайн-оплату */}
            <RadioOption
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
              label="Банковской картой"
              disabled
            />
            <RadioOption
              name="paymentMethod"
              value="sbp"
              checked={paymentMethod === 'sbp'}
              onChange={() => setPaymentMethod('sbp')}
              label="СБП"
              disabled
            />
          </div>

          <div className="h-px bg-[#d9d9d9]" />

          <div className="flex gap-6">
            <RadioOption
              name="prepaymentType"
              value="prepay"
              checked={prepaymentType === 'prepay'}
              onChange={() => setPrepaymentType('prepay')}
              label="Предоплата"
            />
            <RadioOption
              name="prepaymentType"
              value="half"
              checked={prepaymentType === 'half'}
              onChange={() => setPrepaymentType('half')}
              label="50/50"
            />
            <RadioOption
              name="prepaymentType"
              value="postpay"
              checked={prepaymentType === 'postpay'}
              onChange={() => setPrepaymentType('postpay')}
              label="Постоплата"
            />
          </div>
        </div>

        

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {/* Ваша заявка */}
      <div className="bg-white border border-[#e5e7e8] rounded-2xl shadow-[0px_6px_18px_0px_rgba(15,23,42,0.07)] p-6 w-full lg:w-[360px] shrink-0 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Ваша заявка</h2>

        <div className="flex flex-col gap-2 text-[14px] text-[#475569]">
          {items.map((item) => (
            <p key={item.variantId}>
              {item.productName}
              {item.variantName ? ` — ${item.variantName}` : ''} × {item.quantity}
            </p>
          ))}
        </div>

        {hasRequestPriceItems && (
          <div className="flex gap-2">
            <div className="w-[3px] rounded-xl bg-[#179146] shrink-0" />
            <p className="text-sm text-[#1c2126]">
              Есть товары с ценой по запросу — сумма будет уточнена при обработке заявки
            </p>
          </div>
        )}

        <p className="text-[26px] font-bold">{totalPrice.toLocaleString('ru-RU')} ₽</p>

        <button
          type="submit"
          disabled={isPending || !agreed}
          className="bg-[#179146] text-white rounded-xl py-3 font-semibold hover:bg-[#137a3a] disabled:opacity-50 transition-colors
            enabled:hover:scale-[1.02] active:scale-[0.98]"
        >
          {isPending ? 'Отправка...' : 'Отправить заявку'}
        </button>

        <label className="flex items-start gap-2 text-[14px] text-[#767d83] cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
            className="w-[18px] h-[18px] mt-0.5 accent-[#179146] rounded shrink-0"
          />
          <span>
            Нажимая кнопку, вы соглашаетесь с{' '}
            {/* TODO: укажите реальную ссылку на политику конфиденциальности */}
            <a href="/privacy" className="text-[#0082b2] font-medium">
              политикой конфиденциальности
            </a>
          </span>
        </label>
      </div>
    </form>
  )
}