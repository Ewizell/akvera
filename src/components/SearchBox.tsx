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
        setSuggestions(data.results ?? [])
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
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Поиск по названию или артикулу..."
          className="w-full border rounded-l-lg px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-black text-white rounded-r-lg text-sm hover:bg-gray-800"
        >
          Найти
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
            >
              <div className="relative w-10 h-10 shrink-0 bg-gray-100 rounded overflow-hidden">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-contain" sizes="40px" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}