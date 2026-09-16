'use client'

import Image from 'next/image'

export default function CardIconButton({
  icon,
  active,
  activeFilter,
  label,
  onClick,
}: {
  icon: string
  active: boolean
  activeFilter?: string
  label: string
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-sm cursor-pointer hover:bg-white transition-colors"
    >
      <Image
        src={icon}
        alt=""
        width={18}
        height={18}
        style={active && activeFilter ? { filter: activeFilter } : undefined}
      />
    </button>
  )
}