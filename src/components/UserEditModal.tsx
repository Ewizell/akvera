'use client'

import { useState, useTransition } from 'react'
import { updateUser } from '@/lib/actions/user'

const inputCls =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
const cardCls = 'bg-white border border-gray-200 rounded-lg p-5'
const cardTitleCls = 'text-base font-semibold text-gray-900 mb-4'

type User = {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: 'CUSTOMER' | 'ADMIN'
}

export default function UserEditModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateUser(user.id, formData)
      if (result.success) {
        onClose()
      } else {
        setError(result.error ?? 'Ошибка сохранения')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto text-gray-900">
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-3xl mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{user.email}</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">
            ✕
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <form action={handleSubmit} className="space-y-5">
          <div className={cardCls}>
            <h2 className={cardTitleCls}>Данные аккаунта</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Email</label>
                <input name="email" type="email" defaultValue={user.email} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Новый пароль</label>
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  placeholder="Оставьте пустым, чтобы не менять"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Имя</label>
                  <input name="name" defaultValue={user.name ?? ''} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Телефон</label>
                  <input name="phone" defaultValue={user.phone ?? ''} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Роль</label>
                <select name="role" defaultValue={user.role} required className={inputCls}>
                  <option value="CUSTOMER">Покупатель</option>
                  <option value="ADMIN">Администратор</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}