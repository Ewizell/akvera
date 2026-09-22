'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type Suggestion = {
  id: string
  name: string
  slug: string
  price: number
  imageUrl: string | null
}

export default function SearchBox() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        const unique: Suggestion[] = Array.from(
          new Map<string, Suggestion>(
            (data.results ?? []).map(
              (item: Suggestion): [string, Suggestion] => [item.id, item]
            )
          ).values()
        )
        setSuggestions(unique)
        setOpen(true)
      } catch {
        setSuggestions([])
      }
    }, 250)

    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    router.push(`/catalog/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-[#f0f0f0] h-11 rounded-xl overflow-hidden shadow-[0px_8px_12px_rgba(15,23,42,0.05)]"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Поиск по категориям, артикулам или брендам..."
          className="flex-1 min-w-0 bg-transparent pl-3 text-[15px] text-[#475569] placeholder:text-[#969393] outline-none"
        />
<button
  type="submit"
  aria-label="Найти"
  className="flex items-center justify-center h-11 w-11 shrink-0 bg-[#179146] rounded-r-xl hover:bg-[#147a3b]"
>
  <Image src="/icons/fi-br-search.svg" alt="" width={16} height={16} />
</button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((item, index) => {
            const isBestMatch = index === 0

            return (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 border-b last:border-b-0 border-gray-100 ${
                  isBestMatch
                    ? ' hover:bg-[#eaf5ee]'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`relative w-10 h-10 shrink-0 bg-gray-100 rounded overflow-hidden ${
                    isBestMatch ? 'ring-2 ring-[#179146]' : ''
                  }`}
                >
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-contain" sizes="40px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-[#475569] truncate">{item.name}</p>
                    {isBestMatch && (
                      <span className="shrink-0 rounded-md bg-[#F0F0F0]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#179146]">
                        Лучшее совпадение
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#969393]">
                    {item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}