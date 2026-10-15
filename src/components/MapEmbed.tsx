"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

export default function MapEmbed({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <button
        type="button"
        onClick={() => setActive(true)}
        className="flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#28313d] transition-colors duration-200 hover:bg-[#f4f5f7]"
      >
        <MapPin size={18} strokeWidth={1.8} />
        Показать карту
      </button>

      <p className="max-w-[280px] text-xs leading-4 text-white/70">
        Карту предоставляет Яндекс, при её загрузке сервис может использовать cookie.
      </p>
    </div>
  );
}