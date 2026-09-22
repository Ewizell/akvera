import { CheckoutForm } from '@/components/CheckoutForm'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export default function CheckoutPage() {
  const crumbs = [{ label: 'Главная', href: '/' }, { label: 'Оформление заказа' }]

  return (
    <main className="bg-[#f8fafc] py-10">
      <div className="max-w-[1280px] mx-auto px-4 md:px-20">
        <Breadcrumbs items={crumbs} />
        <h1 className="text-[36px] font-semibold mb-6 mt-2">Оформление заказа</h1>
        <CheckoutForm />
      </div>
    </main>
  )
}