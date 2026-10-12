export default function CatalogSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Загрузка"
      className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-8 lg:px-20"
    >
      <div className="h-4 w-48 animate-pulse rounded bg-[#e5e7eb]" />
      <div className="mt-4 h-9 w-72 animate-pulse rounded-lg bg-[#e5e7eb]" />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white">
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-[#f3f4f6]" />

            <div className="space-y-2.5 p-3 sm:p-4">
              <div className="h-5 w-24 animate-pulse rounded bg-[#e5e7eb]" />
              <div className="h-3.5 w-full animate-pulse rounded bg-[#f3f4f6]" />
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-[#f3f4f6]" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-[#e5e7eb]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}