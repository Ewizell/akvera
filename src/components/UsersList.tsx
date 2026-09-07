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

function UserRow({ user, onEdit }: { user: User; onEdit: (u: User) => void }) {
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
    <li className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {ROLE_LABELS[user.role]}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {user.name || '—'} {user.phone ? `· ${user.phone}` : ''}
        </p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {confirming ? (
          <span className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Удалить?</span>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-red-600 font-medium hover:underline disabled:opacity-50"
            >
              Да
            </button>
            <button onClick={() => setConfirming(false)} className="text-gray-500 hover:underline">
              Отмена
            </button>
          </span>
        ) : (
          <>
            <button onClick={() => onEdit(user)} className="text-sm text-blue-600 hover:underline">
              Редактировать
            </button>
            <button
              onClick={() => {
                setError(null)
                setConfirming(true)
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Удалить
            </button>
          </>
        )}
      </div>
    </li>
  )
}

export default function UsersList({ users }: { users: User[] }) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingUser = users.find((u) => u.id === editingId) ?? null

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {users.length} {users.length === 1 ? 'пользователь' : 'пользователей'}
        </p>
        <button
          onClick={() => setCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + Добавить пользователя
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
          Пользователей пока нет
        </div>
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <UserRow key={user.id} user={user} onEdit={(u) => setEditingId(u.id)} />
          ))}
        </ul>
      )}

      {creating && <UserCreateModal onClose={() => setCreating(false)} />}

      {editingUser && <UserEditModal user={editingUser} onClose={() => setEditingId(null)} />}
    </>
  )
}