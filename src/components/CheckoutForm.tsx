'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { createOrder } from '@/lib/actions/order'

export function CheckoutForm() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    formData.set(
      'items',
      JSON.stringify(items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })))
    )

    if (files) {
      for (const file of Array.from(files)) {
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Контактное лицо *</label>
          <input
            name="contactName"
            required
            className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Телефон *</label>
          <input
            name="contactPhone"
            required
            className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
          <input
            name="contactEmail"
            type="email"
            className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Комментарий к заказу</label>
          <textarea
            name="comment"
            rows={4}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Вложения (ТЗ, спецификации и т.д.)
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="w-full text-gray-900"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Отправка...' : 'Оформить заявку'}
        </button>
      </form>

      <div className="border rounded p-4 h-fit">
        <h2 className="font-semibold text-gray-900 mb-3">Ваш заказ</h2>
        <ul className="space-y-2 mb-4">
          {items.map((item) => (
            <li key={item.variantId} className="flex justify-between text-sm text-gray-900">
              <span>
                {item.productName} — {item.variantName} × {item.quantity}
              </span>
              <span>{item.price !== null ? `${item.price * item.quantity} ₽` : 'по запросу'}</span>
            </li>
          ))}
        </ul>
        <div className="border-t pt-3 font-semibold text-gray-900">
          Итого: {totalPrice} ₽
        </div>
      </div>
    </div>
  )
}