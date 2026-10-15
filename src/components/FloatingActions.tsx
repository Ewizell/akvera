"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  FileText,
  MessageCircle,
  Phone,
  PhoneCall,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import { CONTACTS } from "@/lib/site-content";

// Из «+7 (999) 999-99-99» получается «+79999999999» для ссылки tel:
const PHONE = CONTACTS.phone.replace(/[^\d+]/g, "");
// id блока с формой «Перезвоните мне» на главной
const CALLBACK_HREF = "/request?mode=callback";

const itemClass =
  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#28313d] transition-colors duration-200 hover:bg-[#f4f5f7]";

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 600);
    }

    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-[88px] right-4 z-40 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6"
    >
      {open && (
        <div className="absolute bottom-0 right-full mr-3 flex w-max flex-col rounded-2xl bg-white p-2 shadow-[0_12px_30px_rgba(40,49,61,0.15)]">
          <a href={`tel:${PHONE}`} className={itemClass}>
            <Phone size={18} strokeWidth={1.8} />
            Позвонить
          </a>

          <Link
            href={CALLBACK_HREF}
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <PhoneCall size={18} strokeWidth={1.8} />
            Перезвоните мне
          </Link>

          <Link
            href="/request"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <FileText size={18} strokeWidth={1.8} />
            Запросить КП
          </Link>

          {CONTACTS.telegram && (
            <a
              href={CONTACTS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className={itemClass}
            >
              <Send size={18} strokeWidth={1.8} />
              Telegram
            </a>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Наверх"
        tabIndex={showTop ? 0 : -1}
        className={[
          "flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-white text-[#28313d] shadow-[0_6px_18px_rgba(40,49,61,0.15)] transition-all duration-300 hover:bg-[#f4f5f7]",
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        ].join(" ")}
      >
        <ArrowUp size={18} strokeWidth={1.8} />
      </button>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Закрыть" : "Связаться с нами"}
        aria-expanded={open}
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-[#116b36] text-white shadow-[0_6px_18px_rgba(15,23,42,0.25)] transition-all duration-300 hover:bg-[#0d572c]"
      >
        {open ? (
          <X size={20} strokeWidth={1.8} />
        ) : (
          <MessageCircle size={20} strokeWidth={1.8} />
        )}
      </button>
    </div>
  );
}