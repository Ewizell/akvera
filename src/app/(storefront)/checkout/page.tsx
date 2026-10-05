import { CheckoutForm } from '@/components/CheckoutForm'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export default function CheckoutPage() {
  const crumbs = [{ label: 'Главная', href: '/' }, { label: 'Оформление заказа' }]

  return (
    <main className="bg-[#f8fafc] py-5 sm:py-10">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-20">
        <Breadcrumbs items={crumbs} />
        <h1 className="text-[26px] sm:text-[36px] font-semibold mb-4 sm:mb-6 mt-2">Оформление заказа</h1>
        <CheckoutForm />
      </div>
    </main>
  )
}