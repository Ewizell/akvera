import { ACTIVITIES, VALUES, REQUISITES } from "@/lib/site-content";

export function AboutActivities() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {ACTIVITIES.map((a, i) => (
        <div key={a.title} className="rounded-2xl border border-[#e9e9e9] bg-white p-8">
          <span className="text-sm font-bold text-[#179146]">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-3 text-xl font-semibold text-[#0f172a]">{a.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#475569]">{a.text}</p>
        </div>
      ))}
    </div>
  );
}

export function AboutValues() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {VALUES.map((v) => (
        <div key={v.title} className="rounded-2xl bg-[#f3f4f6] p-6">
          <span className="block h-1 w-8 rounded bg-[#179146]" />
          <h3 className="mt-4 text-base font-semibold text-[#0f172a]">{v.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#767d83]">{v.text}</p>
        </div>
      ))}
    </div>
  );
}

export function AboutRequisites() {
  return (
    <dl className="divide-y divide-[#e0e2e5] rounded-2xl bg-[#f3f4f6]">
      {REQUISITES.filter((r) => r.value.trim() !== "").map((r) => (
        <div key={r.label} className="grid gap-1 px-6 py-4 sm:grid-cols-[200px_1fr] sm:gap-4">
          <dt className="text-sm text-[#969393]">{r.label}</dt>
          <dd className="text-sm font-medium text-[#0f172a]">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}