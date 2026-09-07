import { prisma } from '@/lib/prisma'
import UsersList from '@/components/UsersList'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-8 text-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Пользователи</h1>
        <UsersList users={users} />
      </div>
    </div>
  )
}