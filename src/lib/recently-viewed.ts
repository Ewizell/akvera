export type RecentlyViewedItem = {
  id: string
  slug: string
  sku: string
  name: string
  price: number | null
  product: { name: string }
  images: { url: string; alt: string | null }[]
}

const STORAGE_KEY = 'akvera_recently_viewed'
const MAX_ITEMS = 12

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addRecentlyViewed(item: RecentlyViewedItem) {
  if (typeof window === 'undefined') return
  const current = getRecentlyViewed().filter((i) => i.id !== item.id)
  const updated = [item, ...current].slice(0, MAX_ITEMS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}