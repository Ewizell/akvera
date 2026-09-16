'use client'

import { useState } from 'react'

export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex items-center gap-2 cursor-pointer"
    >
      <span className="font-manrope font-semibold text-[14px] text-[#1c2116]">{label}</span>
      <span className="font-manrope font-medium text-[14px] text-[#1c2126] transition-colors duration-200 group-hover:text-[#179146]">
        {value}
      </span>
      <span className="text-[#969393] transition-colors duration-200 group-hover:text-[#179146]">
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </span>
    </button>
  )
}