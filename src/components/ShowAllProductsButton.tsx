import Link from "next/link";

export default function ShowAllProductsButton({
  href,
}: {
  href: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        inline-flex
        h-11
        shrink-0
        items-center
        justify-between
        gap-3
        rounded-xl
        bg-[#e5e8eb]
        pl-4
        pr-1.5
        text-sm
        font-medium
        text-[#28313d]
        transition-all
        duration-300
        hover:bg-gradient-to-br
        hover:from-accent
        hover:to-accent-end
        hover:text-white
        sm:h-12
      "
    >
      <span className="whitespace-nowrap">
        Показать все товары
      </span>

      <span
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-[#d9dde1]
          text-[#28313d]
          transition-all
          duration-300
          group-hover:bg-white/15
          group-hover:text-white
        "
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="
            transition-transform
            duration-200
            group-hover:translate-x-0.5
          "
        >
          <path
            d="M2 8H14M14 8L8.5 2.5M14 8L8.5 13.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}