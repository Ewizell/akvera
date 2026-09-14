'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function HeaderAuthLink() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex h-11 w-[106px] shrink-0 items-center justify-center rounded-xl bg-[#179146]/50 text-white text-base font-semibold">
        …
      </div>
    )
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="flex h-11 w-[106px] shrink-0 items-center justify-center rounded-xl bg-[#179146] text-white text-base font-semibold hover:bg-[#147a3b]"
      >
        Войти
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3 shrink-0">
      <Link
        href="/account"
        className="flex h-11 items-center justify-center rounded-xl bg-[#179146] px-4 text-white text-base font-semibold hover:bg-[#147a3b] whitespace-nowrap"
      >
        Кабинет
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-[#475569] text-sm font-medium hover:underline"
      >
        Выйти
      </button>
    </div>
  )
}