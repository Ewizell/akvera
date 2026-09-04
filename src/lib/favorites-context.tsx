'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'akvera_favorites';

interface FavoritesContextValue {
  variantIds: string[];
  count: number;
  isFavorite: (variantId: string) => boolean;
  addFavorite: (variantId: string) => void;
  removeFavorite: (variantId: string) => void;
  toggleFavorite: (variantId: string) => void;
  clear: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeToStorage(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage недоступен (приватный режим, квота и т.д.) — просто игнорируем
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [variantIds, setVariantIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setVariantIds(readFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeToStorage(variantIds);
  }, [variantIds, hydrated]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setVariantIds(readFromStorage());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isFavorite = useCallback(
    (variantId: string) => variantIds.includes(variantId),
    [variantIds]
  );

  const addFavorite = useCallback((variantId: string) => {
    setVariantIds((prev) => (prev.includes(variantId) ? prev : [...prev, variantId]));
  }, []);

  const removeFavorite = useCallback((variantId: string) => {
    setVariantIds((prev) => prev.filter((id) => id !== variantId));
  }, []);

  const toggleFavorite = useCallback((variantId: string) => {
    setVariantIds((prev) =>
      prev.includes(variantId) ? prev.filter((id) => id !== variantId) : [...prev, variantId]
    );
  }, []);

  const clear = useCallback(() => setVariantIds([]), []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      variantIds,
      count: variantIds.length,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clear,
    }),
    [variantIds, isFavorite, addFavorite, removeFavorite, toggleFavorite, clear]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}