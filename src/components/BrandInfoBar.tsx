import Image from "next/image";
import Link from "next/link";

export default function BrandInfoBar({
  name,
  description,
  logoUrl,
}: {
  name: string;
  description: string | null;
  logoUrl: string | null;
}) {
  return (
    <div className="mb-6 flex flex-col gap-5 border-b border-[#d9dfe4] pb-6 sm:mb-7 sm:pb-7 md:flex-row md:items-center md:justify-between md:gap-8">
      <div className="flex min-w-0 flex-1 items-center gap-5 sm:gap-6">
        {logoUrl && (
          <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
            <Image
              src={logoUrl}
              alt={name}
              fill
              sizes="128px"
              className="object-contain rounded-xl"
            />
          </div>
        )}

        {description && (
          <div
            className="
              min-w-0 max-w-3xl
              text-[14px] leading-6 text-[#66717d]
              sm:text-sm sm:leading-7
              [&_p]:m-0
              [&_p+p]:mt-3
              [&_a]:text-accent
              [&_a]:underline
              [&_a]:underline-offset-4
              [&_strong]:font-semibold
              [&_strong]:text-[#28313d]
            "
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </div>

      <Link
        href="/brands"
        className="
          group
          flex
          h-11
          w-full
          shrink-0
          items-center
          rounded-xl
          bg-[#28313d]
          px-1.5
          text-sm
          font-medium
          text-white
          transition-all
          duration-300
          hover:bg-gradient-to-br
          hover:from-accent
          hover:to-accent-end
          cursor-pointer
          sm:inline-flex
          sm:w-auto
          sm:pl-4
        "
      >
        <span className="flex flex-1 items-center justify-center pl-3 sm:flex-none sm:pl-0">
          Все бренды
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
            bg-white/10
            text-white
            transition-transform
            duration-300
            group-hover:translate-x-0.5
            sm:ml-3
          "
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
          >
            <path
              d="M2 7.5h11M8 2.5l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>
    </div>
  );
}