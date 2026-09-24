'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'

const NAV_ITEMS = [
  {
    href: '/admin/categories',
    label: 'Категории',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/admin/products',
    label: 'Товары',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: '/admin/orders',
    label: 'Заказы',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2h9l3 3v17a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    href: '/admin/brands',
    label: 'Бренды',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    href: '/admin/documents',
    label: 'Документы',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    ),
  },
  {
    href: '/admin/tags',
    label: 'Теги',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.59 13.41L11 3.83A2 2 0 009.59 3H4a1 1 0 00-1 1v5.59a2 2 0 00.59 1.41l9.58 9.58a2 2 0 002.83 0l4.59-4.59a2 2 0 000-2.83z" />
        <circle
          cx="7.5"
          cy="7.5"
          r="1.2"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Пользователи',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: '/admin/import-export',
    label: 'Импорт/экспорт',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
        <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      </svg>
    ),
  },
]

const NAV_WIDTH_EXPANDED = 224
const NAV_WIDTH_COLLAPSED = 56

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--admin-nav-width',
      `${collapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH_EXPANDED}px`
    )
  }, [collapsed])

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#28313d]">
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-black/[0.05] bg-white transition-all duration-200 print:hidden ${
          collapsed ? 'w-14' : 'w-56'
        }`}
      >
        {/* Header */}
        <div
          className={`flex h-[68px] shrink-0 items-center border-b border-black/[0.05] ${
            collapsed ? 'justify-center px-2' : 'justify-between px-3'
          }`}
        >
          {!collapsed && (
            <div className="flex min-w-0 items-center gap-3 px-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
                  <path d="M8 7h8M8 11h8M8 15h4" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-[#28313d]">
                  Админка
                </p>
                <p className="truncate text-[10px] text-[#9aa3ae]">
                  Управление магазином
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#8a939f] transition hover:bg-[#f4f5f7] hover:text-[#28313d]"
            title={collapsed ? 'Развернуть' : 'Свернуть'}
            aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {collapsed ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4">
          {!collapsed && (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9aa3ae]">
              Разделы
            </p>
          )}

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname?.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`group flex h-10 items-center rounded-xl transition-all duration-150 ${
                    collapsed
                      ? 'justify-center px-2'
                      : 'gap-3 px-3'
                  } ${
                    active
                      ? 'bg-[#edf1f5] text-[#28394c]'
                      : 'text-[#697482] hover:bg-[#f5f6f8] hover:text-[#28313d]'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                      active
                        ? 'bg-[#28394c] text-white shadow-sm'
                        : 'text-[#8e98a4] group-hover:text-[#28313d]'
                    }`}
                  >
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span
                      className={`truncate text-[13px] ${
                        active ? 'font-semibold' : 'font-medium'
                      }`}
                    >
                      {item.label}
                    </span>
                  )}

                  {!collapsed && active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#28394c]" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-black/[0.05] p-2.5">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`group flex h-10 w-full items-center rounded-xl text-[#7d8793] transition hover:bg-[#fff7f7] hover:text-[#b33a3a] ${
              collapsed
                ? 'justify-center px-2'
                : 'gap-3 px-3'
            }`}
            title={collapsed ? 'Выйти' : undefined}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition group-hover:bg-[#f8e8e8]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </span>

            {!collapsed && (
              <span className="text-[13px] font-medium">
                Выйти
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`min-h-screen transition-[margin] duration-200 print:ml-0 ${
          collapsed ? 'ml-14' : 'ml-56'
        }`}
      >
        {children}
      </main>
    </div>
  )
}
