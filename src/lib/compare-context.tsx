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

const STORAGE_KEY = 'akvera_compare';
const MAX_ITEMS = 5;

interface CompareContextValue {
  variantIds: string[];
  count: number;
  isInCompare: (variantId: string) => boolean;
  addVariant: (variantId: string) => { ok: boolean; reason?: 'limit' };
  removeVariant: (variantId: string) => void;
  toggleVariant: (variantId: string) => { ok: boolean; reason?: 'limit' };
  replaceVariant: (oldVariantId: string, newVariantId: string) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

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

export function CompareProvider({ children }: { children: ReactNode }) {
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

  const isInCompare = useCallback(
    (variantId: string) => variantIds.includes(variantId),
    [variantIds]
  );

  const addVariant = useCallback((variantId: string) => {
    let result: { ok: boolean; reason?: 'limit' } = { ok: true };
    setVariantIds((prev) => {
      if (prev.includes(variantId)) return prev;
      if (prev.length >= MAX_ITEMS) {
        result = { ok: false, reason: 'limit' };
        return prev;
      }
      return [...prev, variantId];
    });
    return result;
  }, []);

  const removeVariant = useCallback((variantId: string) => {
    setVariantIds((prev) => prev.filter((id) => id !== variantId));
  }, []);

  const toggleVariant = useCallback(
    (variantId: string) => {
      if (isInCompare(variantId)) {
        removeVariant(variantId);
        return { ok: true };
      }
      return addVariant(variantId);
    },
    [isInCompare, removeVariant, addVariant]
  );

  const replaceVariant = useCallback((oldVariantId: string, newVariantId: string) => {
    setVariantIds((prev) => {
      if (oldVariantId === newVariantId) return prev;
      if (prev.includes(newVariantId)) {
        return prev.filter((id) => id !== oldVariantId);
      }
      return prev.map((id) => (id === oldVariantId ? newVariantId : id));
    });
  }, []);

  const clear = useCallback(() => setVariantIds([]), []);

  const value = useMemo<CompareContextValue>(
    () => ({
      variantIds,
      count: variantIds.length,
      isInCompare,
      addVariant,
      removeVariant,
      toggleVariant,
      replaceVariant,
      clear,
    }),
    [variantIds, isInCompare, addVariant, removeVariant, toggleVariant, replaceVariant, clear]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within a CompareProvider');
  return ctx;
}

export { MAX_ITEMS as COMPARE_MAX_ITEMS };