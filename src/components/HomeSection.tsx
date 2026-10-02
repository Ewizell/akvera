import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Общие классы кнопки «Смотреть все» (десктопная и мобильная версии отличаются только раскладкой)
const linkBase = `
  group
  items-center
  gap-3
  rounded-xl
  px-2
  pl-4
  text-sm font-medium
  text-[#28313d]
  transition-all duration-300
  hover:bg-gradient-to-br
  hover:from-accent
  hover:to-accent-end
  hover:text-white
`;

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
  // Содержимое кнопки (текст + стрелка в квадрате) — одно для обеих версий
  const linkInner = (
    <>
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
    </>
  );

  return (
    <section
      id={id}
      // Отступ между секциями: компактнее на телефоне.
      // scroll-mt — запас под закреплённую шапку при переходе по якорям (/#faq и т.д.)
      className="mt-10 scroll-mt-[76px] sm:mt-16 lg:mt-20 lg:scroll-mt-[132px]"
    >
      <div className="mb-4 flex items-center justify-between gap-6 sm:mb-7">
        <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#28313d] sm:text-[30px] lg:text-[34px]">
          {title}
        </h2>

        {/* Десктоп/планшет: кнопка справа от заголовка */}
        {href && (
          <Link
            href={href}
            className={`${linkBase} hidden h-11 shrink-0 bg-[#f4f5f7] sm:flex`}
          >
            {linkInner}
          </Link>
        )}
      </div>

      {children}

      {/* Телефон: кнопка на всю ширину под контентом (удобно большим пальцем,
          и заголовок получает всю ширину строки). Белая, чтобы была видна на сером фоне */}
      {href && (
        <Link
          href={href}
          className={`${linkBase} mt-4 flex h-12 w-full justify-between bg-white sm:hidden`}
        >
          {linkInner}
        </Link>
      )}
    </section>
  );
}