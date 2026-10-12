"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

const COLLAPSE_AFTER = 120;
const DOWN_DELTA = 80;
const UP_DELTA = 20;
const ALWAYS_OPEN_BELOW = 40;

export default function CollapsibleTopBar({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let lastY = Math.max(0, window.scrollY);
    let anchor = lastY;
    let direction: "up" | "down" | null = null;
    let frame = 0;

    setCollapsed(false);

    function update() {
      frame = 0;

      const y = Math.max(0, window.scrollY);
      const next = y > lastY ? "down" : y < lastY ? "up" : direction;

      if (next !== direction) {
        direction = next;
        anchor = lastY;
      }

      lastY = y;

      if (y < ALWAYS_OPEN_BELOW) {
        setCollapsed(false);
        return;
      }

      if (direction === "down" && y - anchor > DOWN_DELTA && y > COLLAPSE_AFTER) {
        setCollapsed(true);
      } else if (direction === "up" && anchor - y > UP_DELTA) {
        setCollapsed(false);
      }
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <div
      inert={collapsed}
      className={[
        "hidden transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none lg:grid",
        collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
      ].join(" ")}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="pb-3">{children}</div>
      </div>
    </div>
  );
}