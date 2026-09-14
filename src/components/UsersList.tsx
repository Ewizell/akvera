'use client'

import { useState, useTransition } from 'react'
import { deleteUser } from '@/lib/actions/user'
import UserCreateModal from './UserCreateModal'
import UserEditModal from './UserEditModal'

type User = {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: Date
}

const ROLE_LABELS: Record<User['role'], string> = {
  CUSTOMER: 'Покупатель',
  ADMIN: 'Администратор',
}

function UserRow({
  user,
  onEdit,
}: {
  user: User
  onEdit: (u: User) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUser(user.id)

      if (!result.success) {
        setError(result.error ?? 'Не удалось удалить пользователя')
        setConfirming(false)
      }
    })
  }

  return (
    <li className="group rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* User info */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Avatar */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-sm font-semibold text-white shadow-sm">
            {user.email.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-[#28313d]">
                {user.email}
              </p>

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  user.role === 'ADMIN'
                    ? 'bg-[#edf1f5] text-[#3d5063]'
                    : 'bg-[#f1f3f5] text-[#737d89]'
                }`}
              >
                {ROLE_LABELS[user.role]}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#929aa6]">
              <span>{user.name || 'Имя не указано'}</span>

              {user.phone && (
                <>
                  <span className="text-[#d1d5da]">·</span>
                  <span>{user.phone}</span>
                </>
              )}
            </div>

            {error && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#fff7f7] px-2.5 py-1.5 text-[11px] font-medium text-[#b33a3a] ring-1 ring-[#f0d5d5]">
                <svg
                  className="h-3.5 w-3.5 shrink-0"
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
                    d="M8.75 3.9L2.9 14.1C2.37 2.98 9.28 2.98 8.75 3.9Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {confirming ? (
            <div className="flex items-center gap-2 rounded-xl bg-[#fff7f7] px-3 py-2 ring-1 ring-[#f0d5d5]">
              <span className="text-xs font-medium text-[#7b4a4a]">
                Удалить пользователя?
              </span>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#b33a3a] transition hover:bg-[#f9eaea] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Удаление...' : 'Удалить'}
              </button>

              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={isPending}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#7b8592] transition hover:bg-white hover:text-[#28313d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Отмена
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEdit(user)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#dfe3e8] bg-white px-3 text-xs font-semibold text-[#596572] shadow-sm transition hover:border-[#cbd1d8] hover:bg-[#f4f5f7] hover:text-[#28313d]"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M13.75 4.25L15.75 6.25M5 15L5.5 11.5L13 4C13.55 3.45 14.45 3.45 15 4L16 5C16.55 5.55 16.55 6.45 16 7L8.5 14.5L5 15Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Редактировать
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setConfirming(true)
                }}
                disabled={isPending}
                className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold text-[#a55a5a] transition hover:bg-[#fff1f1] hover:text-[#b33a3a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  className="mr-1.5 h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5.5 6.5H14.5M8 6.5V5.25C8 4.56 8.56 4 9.25 4H10.75C11.44 4 12 4.56 12 5.25V6.5M7 8.5V13.5M10 8.5V13.5M13 8.5V13.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.5 6.5L7 15C7.05 15.83 7.74 16.5 8.57 16.5H11.43C12.26 16.5 12.95 15.83 13 15L13.5 6.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
                Удалить
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  )
}

export default function UsersList({ users }: { users: User[] }) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingUser = users.find((u) => u.id === editingId) ?? null

  const adminsCount = users.filter((user) => user.role === 'ADMIN').length
  const customersCount = users.filter(
    (user) => user.role === 'CUSTOMER',
  ).length

  return (
    <>
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Total */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#28394c] to-[#3d5570] text-white">
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

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#929aa6]">
                  Всего пользователей
                </p>
                <p className="mt-0.5 text-xl font-semibold tracking-tight text-[#28313d]">
                  {users.length}
                </p>
              </div>
            </div>
          </div>

          {/* Customers */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#596572]">
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
                    d="M4 16.5C4.5 13.55 6.7 12 10 12C13.3 12 15.5 13.55 16 16.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#929aa6]">
                  Покупатели
                </p>
                <p className="mt-0.5 text-xl font-semibold tracking-tight text-[#28313d]">
                  {customersCount}
                </p>
              </div>
            </div>
          </div>

          {/* Admins */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf1f5] text-[#3d5063]">
                <svg
                  className="h-5 w-5"
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

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#929aa6]">
                  Администраторы
                </p>
                <p className="mt-0.5 text-xl font-semibold tracking-tight text-[#28313d]">
                  {adminsCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users list */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="border-b border-[#e8ebee] px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#28313d]">
                  Список пользователей
                </h2>
                <p className="mt-0.5 text-xs text-[#929aa6]">
                  Учетные записи и управление доступом
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCreating(true)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#28394c] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2a38]"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M10 4V16M4 10H16"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                Добавить пользователя
              </button>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="p-5">
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d9dee4] bg-[#fafbfc] px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef1f4] text-[#8d97a3]">
                  <svg
                    className="h-6 w-6"
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

                <p className="mt-4 text-sm font-medium text-[#596572]">
                  Пользователей пока нет
                </p>

                <p className="mt-1 max-w-sm text-xs leading-5 text-[#929aa6]">
                  Создайте первую учетную запись, чтобы начать работу с
                  пользователями.
                </p>

                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#28394c] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2a38]"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M10 4V16M4 10H16"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  Добавить пользователя
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <ul className="space-y-2.5">
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={(u) => setEditingId(u.id)}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {creating && (
        <UserCreateModal onClose={() => setCreating(false)} />
      )}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  )
}

