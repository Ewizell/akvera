'use client'

import { useEffect, useState, useTransition } from 'react'
import { updateUser } from '@/lib/actions/user'

type User = {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: 'CUSTOMER' | 'ADMIN'
}

const inputCls =
  'h-11 w-full rounded-xl border-0 bg-[#f4f5f7] px-3.5 text-sm text-[#28313d] outline-none ring-1 ring-transparent transition placeholder:text-[#a1a8b3] focus:bg-white focus:ring-2 focus:ring-[#28394c]/15 disabled:cursor-not-allowed disabled:opacity-60'

const labelCls =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]'

export default function UserEditModal({
  user,
  onClose,
}: {
  user: User
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isPending) {
        onClose()
      }
    }

    globalThis.document.addEventListener('keydown', handleKeyDown)

    return () => {
      globalThis.document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, isPending])

  function handleSubmit(formData: FormData) {
    setError(null)

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18212b]/45 px-4 py-6 backdrop-blur-[3px]"
      onClick={() => {
        if (!isPending) onClose()
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl bg-[#f7f8fa] text-[#28313d] shadow-[0_24px_70px_rgba(24,33,43,0.18)] ring-1 ring-black/[0.06]"
        onClick={(event) => event.stopPropagation()}
      >
        <form action={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Header */}
          <div className="shrink-0 border-b border-[#e4e7eb] bg-white px-5 py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white shadow-sm">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M10 10C12.07 10 13.75 8.32 13.75 6.25C13.75 4.18 12.07 2.5 10 2.5C7.93 2.5 6.25 4.18 6.25 6.25C6.25 8.32 7.93 10 10 10Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M3.5 17C3.5 13.96 6.41 11.5 10 11.5C13.59 11.5 16.5 13.96 16.5 17"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#929aa6]">
                    Пользователи
                  </p>

                  <h2 className="mt-0.5 truncate text-base font-semibold text-[#28313d]">
                    Редактировать пользователя
                  </h2>

                  <p className="mt-0.5 truncate text-xs text-[#929aa6]">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                aria-label="Закрыть"
                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#89929d] transition hover:bg-[#f3f5f7] hover:text-[#28313d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 5L15 15M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-5">
              {/* Account data */}
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M10 10C12.07 10 13.75 8.32 13.75 6.25C13.75 4.18 12.07 2.5 10 2.5C7.93 2.5 6.25 4.18 6.25 6.25C6.25 8.32 7.93 10 10 10Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <path
                        d="M3.5 17C3.5 13.96 6.41 11.5 10 11.5C13.59 11.5 16.5 13.96 16.5 17"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#28313d]">
                      Данные аккаунта
                    </h3>
                    <p className="mt-0.5 text-xs text-[#929aa6]">
                      Контактные данные, пароль и права доступа
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="user-email" className={labelCls}>
                      Email
                    </label>

                    <input
                      id="user-email"
                      name="email"
                      type="email"
                      defaultValue={user.email}
                      required
                      disabled={isPending}
                      className={inputCls}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="user-password" className={labelCls}>
                      Новый пароль
                    </label>

                    <input
                      id="user-password"
                      name="password"
                      type="password"
                      minLength={8}
                      placeholder="Оставьте пустым, чтобы не менять"
                      disabled={isPending}
                      className={inputCls}
                    />

                    <p className="mt-1.5 text-[11px] text-[#929aa6]">
                      Минимальная длина нового пароля — 8 символов.
                    </p>
                  </div>

                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="user-name" className={labelCls}>
                        Имя
                      </label>

                      <input
                        id="user-name"
                        name="name"
                        defaultValue={user.name ?? ''}
                        disabled={isPending}
                        placeholder="Имя пользователя"
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label htmlFor="user-phone" className={labelCls}>
                        Телефон
                      </label>

                      <input
                        id="user-phone"
                        name="phone"
                        defaultValue={user.phone ?? ''}
                        disabled={isPending}
                        placeholder="+7 (___) ___-__-__"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="user-role" className={labelCls}>
                      Роль
                    </label>

                    <div className="relative">
                      <select
                        id="user-role"
                        name="role"
                        defaultValue={user.role}
                        required
                        disabled={isPending}
                        className={`${inputCls} appearance-none pr-10`}
                      >
                        <option value="CUSTOMER">Покупатель</option>
                        <option value="ADMIN">Администратор</option>
                      </select>

                      <svg
                        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89929d]"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M6 8L10 12L14 8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current role */}
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef1f4] text-[#596572]">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M10 2.75L16 5V9.75C16 13.35 13.52 16.58 10 17.5C6.48 16.58 4 13.35 4 9.75V5L10 2.75Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7.25 9.75L9.25 11.75L13 8"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7b8592]">
                      Текущая роль
                    </p>

                    <p className="mt-0.5 text-sm font-medium text-[#28313d]">
                      {user.role === 'ADMIN'
                        ? 'Администратор'
                        : 'Покупатель'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-[#f4f5f7] px-3.5 py-3">
                  <p className="text-xs leading-5 text-[#7b8592]">
                    Администратор получает доступ к административной части
                    системы. Покупатель использует обычный пользовательский
                    аккаунт.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-[#fff7f7] px-3.5 py-3 ring-1 ring-[#f0d5d5]">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f9eaea] text-[#b33a3a]">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M10 6.5V10.5M10 13.5H10.01"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8.75 3.9L2.9 14.1C2.37 15.02 3.04 16.15 4.1 16.15H15.9C16.96 16.15 17.63 15.02 17.1 14.1L11.25 3.9C10.72 2.98 9.28 2.98 8.75 3.9Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#a83232]">
                      Ошибка сохранения
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-[#b33a3a]">
                      {error}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[#e4e7eb] bg-white px-5 py-3.5">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="h-10 rounded-xl border border-[#dfe3e8] bg-white px-4 text-xs font-semibold text-[#596572] shadow-sm transition hover:border-[#cbd1d8] hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Отмена
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#28394c] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2a38] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {isPending ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
