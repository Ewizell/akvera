'use client'

type Tag = {
  id: string
  name: string
}

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
    return (
      <div className="rounded-xl bg-[#f4f5f7] px-4 py-3">
        <p className="text-xs leading-5 text-[#8a939f]">
          Тегов пока нет — создайте их в разделе «Теги»
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => (
        <label
          key={tag.id}
          className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-[#4d5866] ring-1 ring-black/[0.05] transition hover:bg-[#f4f5f7]"
        >
          <input
            type="checkbox"
            name={name}
            value={tag.id}
            defaultChecked={selectedIds.includes(tag.id)}
            className="h-4 w-4 rounded border-[#cbd0d7] text-[#28394c] accent-[#28394c] focus:ring-[#28394c]/20"
          />

          <span className="transition group-hover:text-[#28313d]">
            {tag.name}
          </span>
        </label>
      ))}
    </div>
  )
}
