import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="
        -mx-5 mb-4 overflow-x-auto px-5
        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        sm:mx-0 sm:mb-6 sm:overflow-visible sm:px-0
      "
    >
      <ol className="flex flex-nowrap items-center gap-2 whitespace-nowrap text-[13px] sm:flex-wrap sm:gap-2.5 sm:text-[15px]">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex shrink-0 items-center gap-2 sm:gap-2.5"
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className="font-medium text-[#a1a9b3]"
              >
                /
              </span>
            )}

            {item.href ? (
              <Link
                href={item.href}
                className="
                  rounded-md
                  font-medium
                  text-[#475569]
                  transition-colors
                  duration-200
                  hover:text-[#179146]
                "
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="font-semibold text-accent"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}