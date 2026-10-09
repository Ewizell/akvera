'use client'

import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

const REGIONS = [
  {
    id: 'moscow',
    label: 'Москва и МО',
    time: '1–2 рабочих дня',
    options: [
      'Самовывоз со склада',
      'Курьерская доставка',
      'Транспортная компания',
    ],
  },
  {
    id: 'central',
    label: 'Центральный ФО',
    time: '2–4 рабочих дня',
    options: [
      'Транспортная компания',
      'Доставка до терминала',
      'Самовывоз со склада',
    ],
  },
  {
    id: 'russia',
    label: 'Другой регион России',
    time: '3–10 рабочих дней',
    options: ['Транспортная компания', 'Доставка до терминала'],
  },
] as const

type RegionId = (typeof REGIONS)[number]['id']

export default function DeliveryPlanner() {
  const [regionId, setRegionId] = useState<RegionId>('moscow')

  const region = REGIONS.find((item) => item.id === regionId) ?? REGIONS[0]

  return (
    <section className="mt-8 overflow-hidden rounded-2xl bg-white p-5 sm:mt-10 sm:p-7 lg:rounded-3xl lg:p-8">
      {/* Заголовок */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent sm:text-xs">
            Планировщик поставки
          </p>

          <h2 className="mt-2 text-xl font-medium tracking-tight text-[#28313d] sm:text-2xl">
            Выберите регион получения
          </h2>
        </div>

        <p className="text-[12px] leading-5 text-[#7b8794] max-w-full w-full sm:max-w-xs sm:text-right sm:text-sm">
          Точные сроки и условия подтвердит менеджер
        </p>
      </div>

      {/* Выбор региона */}
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3">
        {REGIONS.map((item, index) => {
          const active = item.id === regionId
          const dark = !active && index === 1

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setRegionId(item.id)}
              className={[
                'group flex min-h-[104px] min-w-0 cursor-pointer items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-colors duration-300 sm:min-h-[124px] sm:p-5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#179146] focus-visible:ring-offset-2',
                active
                  ? 'border-[#28313d] bg-gradient-to-br from-[#28313d] to-[#3d5570] text-white'
                  : dark
                    ? 'border-transparent bg-gradient-to-br from-[#28313d] to-[#3d5570] text-white hover:border-[#179146] hover:bg-[#e2f0ef] hover:bg-none hover:text-[#28313d]'
                    : 'border-[#e7eaee] bg-[#f4f5f7] text-[#28313d] hover:border-[#cbd3da] hover:bg-[#edf8f0]',
              ].join(' ')}
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-5 sm:text-base">
                  {item.label}
                </span>

                <span
                  className={[
                    'mt-2 block text-[12px] leading-5 sm:text-xs',
                    active
                      ? 'text-white/65'
                      : dark
                        ? 'text-white/60 group-hover:text-[#66717d]'
                        : 'text-[#7b8794]',
                  ].join(' ')}
                >
                  Ориентир: {item.time}
                </span>
              </span>

              <span
                className={[
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 sm:h-8 sm:w-8',
                  active
                    ? 'bg-accent text-white'
                    : dark
                      ? 'bg-white/10 text-white group-hover:bg-white group-hover:text-accent'
                      : 'bg-white text-accent',
                ].join(' ')}
                aria-hidden="true"
              >
                {active ? (
                  <Check size={16} strokeWidth={2} />
                ) : (
                  <ArrowRight
                    size={16}
                    strokeWidth={1.8}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Результат выбора */}
      <div
        aria-live="polite"
        className="mt-4 grid gap-5 rounded-2xl bg-[#f4f5f7] p-4 sm:mt-5 sm:grid-cols-[0.75fr_1.25fr] sm:gap-6 sm:p-6"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#7b8794] sm:text-xs">
            Ориентировочный срок
          </p>

          <p className="mt-2 text-xl font-medium leading-tight tracking-tight text-[#28313d] sm:text-2xl">
            {region.time}
          </p>

          <p className="mt-2 text-[12px] leading-5 text-[#7b8794] sm:text-sm">
            Срок зависит от наличия оборудования и выбранного способа доставки.
          </p>
        </div>

        <div className="min-w-0 sm:border-l sm:border-[#e1e5e9] sm:pl-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#7b8794] sm:text-xs">
            Доступные способы
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {region.options.map((option) => (
              <span
                key={option}
                className="inline-flex max-w-full items-center gap-2 rounded-lg border border-[#e7eaee] bg-white px-3 py-2 text-[12px] font-medium leading-4 text-[#52606f] sm:text-sm"
              >
                <Check
                  size={14}
                  strokeWidth={2}
                  className="shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span>{option}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}