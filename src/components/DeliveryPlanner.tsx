'use client'

import { useState } from 'react'

const REGIONS = [
  { id: 'moscow', label: 'Москва и МО', time: '1–2 рабочих дня', options: ['Самовывоз со склада', 'Курьерская доставка', 'Транспортная компания'] },
  { id: 'central', label: 'Центральный ФО', time: '2–4 рабочих дня', options: ['Транспортная компания', 'Доставка до терминала', 'Самовывоз со склада'] },
  { id: 'russia', label: 'Другой регион России', time: '3–10 рабочих дней', options: ['Транспортная компания', 'Доставка до терминала'] },
] as const

export default function DeliveryPlanner() {
  const [regionId, setRegionId] = useState<(typeof REGIONS)[number]['id']>('moscow')
  const region = REGIONS.find((item) => item.id === regionId)!
  return <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/[.04] sm:p-8"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-accent">Планировщик поставки</p><h2 className="mt-2 text-2xl font-semibold text-[#28313d]">Выберите регион получения</h2></div><p className="text-sm text-[#7b8794]">Точные условия подтвердит менеджер</p></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{REGIONS.map((item) => <button key={item.id} type="button" onClick={() => setRegionId(item.id)} className={`rounded-2xl border p-4 text-left transition ${item.id === regionId ? 'border-[#179146] bg-[#edf8f0] ring-1 ring-[#179146]' : 'border-[#e1e5e9] bg-white hover:border-[#a9b4bf]'}`}><span className="block text-sm font-semibold text-[#28313d]">{item.label}</span><span className="mt-2 block text-xs text-[#697482]">Ориентир: {item.time}</span></button>)}</div><div className="mt-5 grid gap-4 rounded-2xl bg-[#f4f6f7] p-5 sm:grid-cols-[.75fr_1.25fr]"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#7b8794]">Ориентировочный срок</p><p className="mt-2 text-2xl font-semibold text-[#28394c]">{region.time}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-[#7b8794]">Доступные способы</p><div className="mt-2 flex flex-wrap gap-2">{region.options.map((option) => <span key={option} className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#52606f] ring-1 ring-black/[.04]">{option}</span>)}</div></div></div></section>
}
