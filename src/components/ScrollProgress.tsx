"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;

      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const progress =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      if (barRef.current) {
        barRef.current.style.transform = `scaleY(${progress})`;
      }
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
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 right-0 z-[100] w-[3px]"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-top bg-gradient-to-b from-accent to-accent-end"
        style={{ transform: "scaleY(0)" }}
      />
    </div>
  );
}