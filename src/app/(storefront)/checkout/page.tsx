import { CheckoutForm } from '@/components/CheckoutForm'

export default function CheckoutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Оформление заказа</h1>
      <CheckoutForm />
    </div>
  )
}