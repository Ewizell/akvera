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
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-6xl p-6">
        {/* Breadcrumbs */}
        <div className="mb-7">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#929aa6]">
            <span>Система</span>
            <span className="text-[#c4c9cf]">/</span>
            <span>Пользователи</span>
          </div>

          <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-[#28313d]">
            Пользователи
          </h1>

          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[#7b8592]">
            Управление учетными записями пользователей, контактными данными и
            правами доступа.
          </p>
        </div>

        <UsersList users={users} />
      </div>
    </div>
  )
}

