import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LEGAL_DOCS, LEGAL_UPDATED, type LegalKey } from "@/lib/legal-content";

export default function LegalPage({ docKey }: { docKey: LegalKey }) {
  const doc = LEGAL_DOCS[docKey];

  return (
    <main className="max-w-[1440px] mx-auto px-20 py-10 pb-16">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: doc.title }]} />

      <h1 className="mt-3 text-[36px] font-bold leading-[1.2] text-[#0f172a]">{doc.title}</h1>
      <p className="mt-2 text-sm text-[#969393]">Редакция от {LEGAL_UPDATED}</p>

      <div className="mt-8 max-w-3xl space-y-8 text-sm leading-relaxed text-[#475569]">
        {doc.intro && <p>{doc.intro}</p>}
        {doc.sections.map((s, i) => (
          <section key={s.title}>
            <h2 className="text-xl font-semibold text-[#0f172a]">
              {i + 1}. {s.title}
            </h2>
            {s.paragraphs?.map((p) => (
              <p key={p} className="mt-3">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                {s.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}