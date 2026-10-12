"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Suggestion = {
id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  rank: number; // 3 = начало названия/артикула, 2 = все слова найдены, 1 = нечёткое
};

export default function SearchBox() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();

    if (!q) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("search failed");

        const data = await res.json();

        // дубли уже убраны в SQL (DISTINCT ON)
        setSuggestions(data.results ?? []);
        setOpen(true);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setSuggestions([]);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort(); // устаревший запрос больше не перезапишет результат
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!query.trim()) return;

    setOpen(false);

    router.push(`/catalog/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Поиск */}
      <form
        onSubmit={handleSubmit}
        className="
          flex
          h-11
          w-full
          items-center
          overflow-hidden
          rounded-xl
          bg-[#f0f0f0]/80
          shadow-[0_1px_3px_rgba(15,23,42,0.04)]
          transition-all
          duration-200
          focus-within:bg-[#f0f0f0]/85
          focus-within:shadow-[0_0_0_2px_rgba(23,145,70,0.12)]
        "
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Поиск по категориям, артикулам или брендам..."
          className="
            min-w-0
            flex-1
            bg-transparent
            px-4
            text-[15px]
            text-[#475569]
            outline-none
            placeholder:text-[#969393]
            placeholder:text-[13px]
            sm:placeholder:text-[15px]
          "
        />

        <button
          type="submit"
          aria-label="Найти"
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-r-xl
            bg-accent
            transition-colors
            duration-200
            hover:bg-accent-hover
          "
        >
          <Image
            src="/icons/fi-br-search.svg"
            alt=""
            width={16}
            height={16}
          />
        </button>
      </form>

      {/* Выпадающий список */}
      {open && suggestions.length > 0 && (
        <div
          className="
            absolute
            left-0
            right-0
            top-full
            z-50
            mt-2
            overflow-hidden
            rounded-2xl
            border
            border-white/70
            bg-white/95
            shadow-[0_12px_30px_rgba(40,49,61,0.10)]
            backdrop-blur-sm
          "
        >
          {suggestions.map((item, index) => {
            const isBestMatch = index === 0 && item.rank >= 2;

            return (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                onClick={() => setOpen(false)}
                className={[
                  "group flex items-center gap-3 border-b border-[#e5e7e8]/70 px-3 py-3 transition-colors duration-200 last:border-b-0 hover:bg-[#f4f5f7]/80",
                  isBestMatch
                    ? "relative before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#179146]"
                    : "",
                ].join(" ")}
              >
                {/* Изображение */}
                <div
                  className={[
                    "relative h-11 w-11 shrink-0 overflow-hidden rounded-xl",
                    isBestMatch
                      ? "bg-white ring-2 ring-[#179146]/40"
                      : "bg-[#f3f4f6]",
                  ].join(" ")}
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="44px"
                    />
                  ) : null}
                </div>

                {/* Информация */}
                <div className="min-w-0 flex-1">
                  {isBestMatch && (
                    <span className="mb-1 inline-block rounded-md bg-[#179146]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#179146]">
                      Лучшее совпадение
                    </span>
                  )}

                  <p
                    className={[
                      "truncate text-[13px] text-[#28313d] transition-colors duration-200 group-hover:text-[#179146] sm:text-sm",
                      isBestMatch ? "font-semibold" : "font-medium",
                    ].join(" ")}
                  >
                    {item.name}
                  </p>

                  <p className="mt-1 text-[11px] text-[#929aa6] sm:text-xs">
                    {item.price
                      ? `${item.price.toLocaleString("ru-RU")} ₽`
                      : "Цена по запросу"}
                  </p>
                </div>

                {/* Диагональная стрелка */}
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-[#929aa6]
                    transition-all
                    duration-200
                    group-hover:bg-[#e2f0ef]
                    group-hover:text-[#179146]
                  "
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="
                      transition-transform
                      duration-200
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  >
                    <path
                      d="M4 12L12 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />

                    <path
                      d="M6 4h6v6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}