'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

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
  const [pulse, setPulse] = useState(false)
  const prevActive = useRef(active)

  useEffect(() => {
    if (prevActive.current !== active) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 220)
      prevActive.current = active
      return () => clearTimeout(t)
    }
  }, [active])

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-sm cursor-pointer
        transition-transform duration-150 ease-out hover:bg-white hover:scale-110 active:scale-90
        ${pulse ? 'scale-125' : 'scale-100'}`}
    >
      <Image
        src={icon}
        alt=""
        width={18}
        height={18}
        className="transition-transform duration-150"
        style={active && activeFilter ? { filter: activeFilter } : undefined}
      />
    </button>
  )
}