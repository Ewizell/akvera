import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SOLUTIONS } from '@/lib/solutions'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Инженерные решения',
  description: 'Подбор инженерного оборудования Akvera для вентиляции, отопления и водоснабжения.',
  alternates: { canonical: absoluteUrl('/solutions') },
}

export default function SolutionsPage() {
  return <main className="bg-[#f4f5f7]"><div className="mx-auto max-w-[1440px] px-5 pb-16 pt-6 sm:px-8 lg:px-12"><Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Решения' }]} /><section className="overflow-hidden rounded-3xl bg-[#28313d] p-7 text-white sm:p-10 lg:p-12"><p className="text-xs font-semibold uppercase tracking-[.16em] text-white/50">Подбор под задачу</p><h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Инженерные решения для вашего объекта</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/65">Не просто поставляем оборудование: помогаем собрать совместимое решение, подготовить документы и организовать поставку.</p></section><section className="mt-8 grid gap-4 lg:grid-cols-3">{SOLUTIONS.map((solution) => <Link key={solution.slug} href={`/solutions/${solution.slug}`} className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[.04] transition hover:-translate-y-1 hover:shadow-md"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4ee] text-[#179146]"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V5h16v14M8 15h8M12 5v10" /></svg></span><p className="mt-5 text-xs font-semibold uppercase tracking-wide text-accent">{solution.eyebrow}</p><h2 className="mt-2 text-xl font-semibold leading-7 text-[#28313d]">{solution.title}</h2><p className="mt-3 text-sm leading-6 text-[#697482]">{solution.description}</p><span className="mt-6 inline-block text-sm font-semibold text-[#405b7d]">Подробнее →</span></Link>)}</section></div></main>
}
