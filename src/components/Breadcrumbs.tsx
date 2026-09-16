import Link from "next/link";

type Crumb = {
  label: string;
  href?: string; // последний элемент — без ссылки
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2">
      <ol className="flex flex-wrap items-center gap-[12px] font-montserrat font-semibold text-[14px] tracking-[1px] uppercase text-[#179146]">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-[12px]">
            {i > 0 && <span>/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:opacity-70 transition-opacity">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}