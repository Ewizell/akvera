import Link from "next/link";

export default function HomeSection({
  title,
  id,
  href,
  linkLabel = "Смотреть все",
  children,
}: {
  title: string;
  id?: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-24">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-[28px] font-bold leading-[1.2] text-[#0f172a]">{title}</h2>
        {href && (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[#179146] px-5 py-2 text-sm font-semibold text-[#179146] transition-colors hover:bg-[#179146] hover:text-white"
          >
            {linkLabel}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}