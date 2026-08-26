import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r bg-gray-50 p-4">
        <p className="font-bold text-lg mb-6">Админка</p>
        <nav className="space-y-1">
          <Link href="/admin/categories" className="block px-3 py-2 rounded hover:bg-gray-200 text-sm">
            Категории
          </Link>
          <Link href="/admin/products" className="block px-3 py-2 rounded hover:bg-gray-200 text-sm">
            Товары
          </Link>
          <Link href="/admin/brands" className="block px-3 py-2 rounded hover:bg-gray-200 text-sm">
            Бренды
          </Link>
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  )
}