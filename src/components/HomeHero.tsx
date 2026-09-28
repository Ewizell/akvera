import Link from "next/link";

export type HomeStat = { value: string; label: string };

export default function HomeHero({ stats }: { stats: HomeStat[] }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#1c2a3f] px-6 py-12 sm:px-12 sm:py-16">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#179146]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#179146]/10 blur-3xl" />

      <div className="relative max-w-3xl">
        <h1 className="text-[32px] font-bold leading-[1.15] text-white sm:text-[48px]">
          Оборудование для инженерных систем
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">
          Комплексные поставки сантехнического оборудования для отопления, водоснабжения и водоотведения. 
        </p>

        <form
          action="/catalog/search"
          method="get"
          className="mt-8 flex max-w-xl items-center rounded-full bg-white p-1.5 shadow-lg"
        >
          <input
            name="q"
            type="search"
            placeholder="Название, артикул или модель"
            className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm text-[#1c2126] outline-none placeholder:text-[#969393]"
          />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-full bg-[#179146] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#127a3a]"
          >
            Найти
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/catalog"
            className="rounded-full bg-[#179146] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#127a3a]"
          >
            Открыть каталог
          </Link>
          <Link
            href="/brands"
            className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Все бренды
          </Link>
        </div>
      </div>

      {stats.length > 0 && (
        <dl className="relative mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/15 pt-6">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-[28px] font-bold leading-none text-white sm:text-[36px]">{s.value}</dt>
              <dd className="mt-1 text-xs text-white/60 sm:text-sm">{s.label}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}