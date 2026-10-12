import Link from "next/link";
import SearchBox from "@/components/SearchBox";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-160px)] flex-1 items-center justify-center bg-[#f4f5f7] px-4 py-16 sm:px-6 sm:py-20 lg:px-12">
      <div className="w-full max-w-2xl text-center">
        <p className="text-[40px] font-medium uppercase tracking-[0.14em] text-accent sm:text-xs">
          Ошибка 404
        </p>

        <h1 className="mt-3 text-[34px] font-medium leading-tight tracking-[-0.03em] text-[#28313d] sm:text-5xl">
          Страница не найдена
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-[13px] leading-6 text-[#66717d] sm:mt-5 sm:text-sm sm:leading-7">
          Возможно, товар или раздел был перемещён или удалён. <br/>Попробуйте
          найти то, что искали, через поиск ниже.
        </p>

        <div className="mx-auto mt-7 w-full max-w-xl sm:mt-8">
          <SearchBox />
        </div>

        <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
          <Link
            href="/"
            className="
              group
              flex
              h-11
              w-full
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
              sm:w-auto
              sm:pl-4
            "
          >
            <span className="flex flex-1 items-center justify-center pl-3 sm:flex-none sm:pl-0">
              На главную
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

          <Link
            href="/catalog"
            className="
              group
              flex
              h-11
              w-full
              items-center
              rounded-xl
              bg-white
              px-1.5
              text-sm
              font-medium
              text-[#28313d]
              ring-1
              ring-inset
              ring-[#d9dfe4]
              transition-all
              duration-300
              hover:bg-[#e5e8eb]
              hover:ring-[#d0d6dc]
              cursor-pointer
              sm:w-auto
              sm:pl-4
            "
          >
            <span className="flex flex-1 items-center justify-center pl-3 sm:flex-none sm:pl-0">
              В каталог
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
                bg-[#f4f5f7]
                text-[#66717d]
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
      </div>
    </main>
  );
}