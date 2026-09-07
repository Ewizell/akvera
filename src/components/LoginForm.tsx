'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')

    startTransition(async () => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Неверный email или пароль')
        return
      }

      router.push(callbackUrl)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Пароль</label>
        <input
          name="password"
          type="password"
          required
          className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full"
      >
        {isPending ? 'Вход...' : 'Войти'}
      </button>
    </form>
  )
}