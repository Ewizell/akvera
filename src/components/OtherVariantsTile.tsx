import Link from 'next/link'
import Image from 'next/image'

type OtherVariant = {
  id: string
  slug: string
  name: string
  price: number | null
  image: string | null
}

export function OtherVariantsTile({ variants }: { variants: OtherVariant[] }) {
  if (variants.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold mb-4">Другие исполнения</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {variants.map((v) => (
          <Link
            key={v.id}
            href={`/product/${v.slug}`}
            className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white"
          >
            <div className="relative aspect-square bg-gray-50 rounded overflow-hidden mb-2">
              {v.image ? (
                <Image src={v.image} alt={v.name} fill className="object-contain p-2" sizes="150px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Нет фото
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
            <p className="text-sm text-gray-900">
              {v.price !== null ? `${v.price.toLocaleString('ru-RU')} ₽` : 'по запросу'}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}