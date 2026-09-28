import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import HomeSection from "@/components/HomeSection";
import BrandSlider from "@/components/BrandSlider";
import { HomeSteps, HomeCta } from "@/components/HomeInfoBlocks";
import { HomeRequisites } from "@/components/HomeContentBlocks";
import { AboutActivities, AboutValues } from "@/components/AboutBlocks";
import { ABOUT_PAGE_LEAD, ABOUT_PAGE_TEXT, ABOUT_STATS } from "@/lib/site-content";
import { SITE_URL, absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 3600;

const TITLE = "О компании Akvera — поставщик промышленного оборудования";
const DESCRIPTION =
  "Akvera — поставщик промышленного оборудования для предприятий: подбор, поставка, техническая документация и поддержка. Работаем с юридическими лицами.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: absoluteUrl("/about"), type: "website" },
};

export default async function AboutPage() {
  const brands = await prisma.brand.findMany({
    where: { products: { some: { isHidden: false } } },
    orderBy: { products: { _count: "desc" } },
    take: 12,
    select: {
      id: true,
      slug: true,
      name: true,
      logoUrl: true,
      _count: { select: { products: { where: { isHidden: false } } } },
    },
  });

  const crumbs = [{ label: "Главная", href: "/" }, { label: "О компании" }];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: TITLE,
        url: absoluteUrl("/about"),
        description: DESCRIPTION,
        about: { "@type": "Organization", name: "Akvera", url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.label,
          ...(c.href ? { item: absoluteUrl(c.href) } : {}),
        })),
      },
    ],
  };

  return (
    <main className="max-w-[1440px] mx-auto px-20 py-10 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs items={crumbs} />

      <h1 className="mt-3 mb-6 text-[36px] font-bold leading-[1.2] text-[#0f172a]">О компании</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_520px]">
        <div>
          <p className="text-lg font-medium leading-relaxed text-[#0f172a]">{ABOUT_PAGE_LEAD}</p>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-[#475569]">
            {ABOUT_PAGE_TEXT.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>

        <dl className="grid grid-cols-2 content-start gap-4">
          {ABOUT_STATS.map((s) => (
            <div key={s.label} className="rounded-2xl bg-[#f3f4f6] p-6">
              <dt className="text-[32px] font-bold leading-none text-[#179146]">{s.value}</dt>
              <dd className="mt-2 text-sm text-[#767d83]">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <HomeSection title="Чем мы занимаемся">
        <AboutActivities />
      </HomeSection>

      <HomeSection title="Наши принципы">
        <AboutValues />
      </HomeSection>

      <HomeSection title="Как мы работаем">
        <HomeSteps />
      </HomeSection>

      {brands.length > 0 && (
        <HomeSection title="С кем мы работаем" href="/brands" linkLabel="Все бренды">
          <BrandSlider
            items={brands.map((b) => ({
              id: b.id,
              slug: b.slug,
              name: b.name,
              logoUrl: b.logoUrl,
              productCount: b._count.products,
            }))}
          />
        </HomeSection>
      )}

      <HomeCta />

      <HomeSection title="Реквизиты" id="requisites">
        <HomeRequisites />
      </HomeSection>
    </main>
  );
}