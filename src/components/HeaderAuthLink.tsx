'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function HeaderAuthLink() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <span className="text-sm text-gray-300">…</span>
  }

  if (!session) {
    return (
      <Link href="/login" className="hover:underline">
        Войти
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/account" className="hover:underline">
        Кабинет
      </Link>
      <button onClick={() => signOut({ callbackUrl: '/' })} className="text-gray-500 hover:underline">
        Выйти
      </button>
    </div>
  )
}