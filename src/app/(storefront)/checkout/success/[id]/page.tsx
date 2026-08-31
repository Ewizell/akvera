import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { variant: true } } },
  })

  if (!order) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Заявка принята</h1>
      <p className="text-gray-600 mb-6">
        Номер заявки: <span className="font-mono">{order.id}</span>. Мы свяжемся с вами по
        телефону {order.contactPhone} в ближайшее время.
      </p>
            <ul className="text-left border rounded p-4 mb-6 space-y-1">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm text-gray-900">
            <span>{item.variant.name} × {item.quantity}</span>
            <span>
              {item.priceAtOrder !== null
                ? `${Number(item.priceAtOrder) * item.quantity} ₽`
                : 'по запросу'}
            </span>
          </li>
        ))}
      </ul>
      <Link href="/catalog" className="text-blue-600 hover:underline">
        Вернуться в каталог
      </Link>
    </div>
  )
}