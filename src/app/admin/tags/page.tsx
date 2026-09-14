import { prisma } from '@/lib/prisma'
import TagList from '@/components/TagList'

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-6xl p-6">
        {/* Breadcrumbs */}
        <div className="mb-7">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#929aa6]">
            <span>Каталог</span>
            <span className="text-[#c4c9cf]">/</span>
            <span>Теги</span>
          </div>

          <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-[#28313d]">
            Теги
          </h1>

          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[#7b8592]">
            Управление тегами каталога для классификации и удобной фильтрации
            товаров.
          </p>
        </div>

        <TagList tags={tags} />
      </div>
    </div>
  )
}
