import Link from "next/link";

export default function ShowAllProductsButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[#179146] px-5 py-2.5 text-[14px] font-semibold text-[#179146] transition-colors hover:bg-[#179146] hover:text-white"
    >
      Показать все товары
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
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
  );
}