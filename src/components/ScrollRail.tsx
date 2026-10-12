"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function ScrollRail() {
  const fillRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;

      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const progress =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${progress})`;
      }

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }

      setVisible(window.scrollY > 300);
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <>
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] lg:hidden"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-accent to-accent-end"
        style={{ transform: "scaleX(0)" }}
      />
    </div>

    <div
      className={[
        "fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 transition-opacity duration-300 lg:flex",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Наверх"
        tabIndex={visible ? 0 : -1}
        className="cursor-pointer rotate-180 rounded-xl bg-[#f4f5f7] px-2.5 py-3 text-xs font-medium tracking-wide text-[#28313d] transition-all duration-300 [writing-mode:vertical-rl] hover:bg-gradient-to-br hover:from-accent hover:to-accent-end hover:text-white"
      >
        Наверх
      </button>

      <div
        aria-hidden="true"
        className="h-24 w-[2px] overflow-hidden rounded-full bg-[#d5d8dc]"
      >
        <div
          ref={fillRef}
          className="h-full w-full origin-top bg-gradient-to-b from-accent to-accent-end"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
    </div>
    </>
  );
}