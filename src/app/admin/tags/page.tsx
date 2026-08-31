import { prisma } from '@/lib/prisma'
import TagList from '@/components/TagList'

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8 text-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Теги</h1>
        <TagList tags={tags} />
      </div>
    </div>
  )
}