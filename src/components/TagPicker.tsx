'use client'

type Tag = { id: string; name: string }

export default function TagPicker({
  allTags,
  selectedIds,
  name,
}: {
  allTags: Tag[]
  selectedIds: string[]
  name: string
}) {
  if (allTags.length === 0) {
    return <p className="text-xs text-gray-400">Тегов пока нет — создайте их в разделе «Теги»</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => (
        <label
          key={tag.id}
          className="flex items-center gap-1 text-xs border rounded-full px-2 py-1 cursor-pointer hover:bg-gray-50"
        >
          <input
            type="checkbox"
            name={name}
            value={tag.id}
            defaultChecked={selectedIds.includes(tag.id)}
            className="accent-black"
          />
          {tag.name}
        </label>
      ))}
    </div>
  )
}