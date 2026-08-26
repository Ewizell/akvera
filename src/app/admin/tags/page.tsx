import { prisma } from '@/lib/prisma'
import TagList from '@/components/TagList'

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Теги</h1>
      <TagList tags={tags} />
    </div>
  )
}