import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <section
      id={id}
      className="mt-20 scroll-mt-[132px]"
    >
      <div className="mb-7 flex items-center justify-between gap-6">
        <h2 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#28313d] sm:text-[34px]">
          {title}
        </h2>

        {href && (
          <Link
            href={href}
            className="
              group
              flex h-11 shrink-0 items-center
              gap-3
              rounded-xl
              bg-[#f4f5f7]
              px-2
              pl-4
              text-sm font-medium
              text-[#28313d]
              transition-all duration-300
              hover:bg-gradient-to-br
              hover:from-[#179146]
              hover:to-[#0f172a]
              hover:text-white
            "
          >
            <span>{linkLabel}</span>

            <span
              className="
                flex h-8 w-8
                items-center justify-center
                rounded-lg
                bg-[#e5e7eb]
                text-[#28313d]
                transition-all duration-300
                group-hover:bg-white/15
                group-hover:text-white
              "
            >
              <ArrowRight
                size={16}
                strokeWidth={1.8}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        )}
      </div>

      {children}
    </section>
  );
}