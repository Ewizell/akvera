import { prisma } from "@/lib/prisma";
import HomeHero from "@/components/HomeHero";
import HomeSection from "@/components/HomeSection";
import HomeProductRow from "@/components/HomeProductRow";
import BrandSlider from "@/components/BrandSlider";
import CategoryTileGrid from "@/components/CategoryTileGrid";
import { HomeSteps, HomeAdvantages, HomeCta } from "@/components/HomeInfoBlocks";
import { HomeAbout, HomeDelivery, HomeFaq, HomeRequisites } from "@/components/HomeContentBlocks";
import LeadRequestBlock from "@/components/LeadRequestBlock";
import { FAQ_ITEMS } from "@/lib/site-content";
import { getCatalogProducts } from "@/lib/catalog-query";
import { getVisibleCategoryIds } from "@/lib/visibility";
import { SITE_URL, absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 3600;

// Подстроки названий тегов, по которым собираются ряды товаров.
// Если теги называются иначе — поменяй здесь.
const POPULAR_TAG_FRAGMENT = "популяр";
const NEW_TAG_FRAGMENT = "новинк";

const TITLE = "Akvera — промышленное оборудование от проверенных производителей";
const DESCRIPTION =
  "Каталог промышленного оборудования Akvera: характеристики, актуальные цены и наличие, техническая документация. Оформите заявку онлайн.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: absoluteUrl("/"), type: "website" },
};

function plural(n: number, forms: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

// Категории верхнего уровня; счётчик — сумма товаров самой категории и всех её потомков
async function getTopCategories(visibleIds: string[]) {
  const [categories, grouped] = await Promise.all([
    prisma.category.findMany({
      where: { id: { in: visibleIds } },
      select: { id: true, name: true, slug: true, parentId: true, imageUrl: true },
    }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { isHidden: false },
      _count: { _all: true },
    }),
  ]);

  const own = new Map<string, number>();
  for (const g of grouped) if (g.categoryId) own.set(g.categoryId, g._count._all);

  const childrenOf = new Map<string, string[]>();
  for (const c of categories) {
    if (!c.parentId) continue;
    if (!childrenOf.has(c.parentId)) childrenOf.set(c.parentId, []);
    childrenOf.get(c.parentId)!.push(c.id);
  }

  const total = (id: string): number =>
    (own.get(id) ?? 0) + (childrenOf.get(id) ?? []).reduce((sum, childId) => sum + total(childId), 0);

  return categories
    .filter((c) => c.parentId === null)
    .map((c) => ({ ...c, productCount: total(c.id) }))
    .filter((c) => c.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 8);
}

async function getTaggedCards(nameFragment: string) {
  const tag = await prisma.tag.findFirst({
    where: { name: { contains: nameFragment, mode: "insensitive" } },
    select: { slug: true },
  });
  if (!tag) return null;
  const { cards } = await getCatalogProducts({ tags: [tag.slug] }, 1);
  if (cards.length === 0) return null;
  return { slug: tag.slug, cards: cards.slice(0, 8) };
}

export default async function HomePage() {
  const visibleCategoryIds = await getVisibleCategoryIds();

  const [topCategories, productsCount, brandsCount, brands, popular, fresh] = await Promise.all([
    getTopCategories(visibleCategoryIds),
    prisma.product.count({ where: { isHidden: false } }),
    prisma.brand.count({ where: { products: { some: { isHidden: false } } } }),
    prisma.brand.findMany({
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
    }),
    getTaggedCards(POPULAR_TAG_FRAGMENT),
    getTaggedCards(NEW_TAG_FRAGMENT),
  ]);

  const categoriesCount = visibleCategoryIds.length;

  const stats = [
    { value: productsCount.toLocaleString("ru-RU"), label: plural(productsCount, ["товар", "товара", "товаров"]) },
    { value: String(brandsCount), label: plural(brandsCount, ["бренд", "бренда", "брендов"]) },
    { value: String(categoriesCount), label: plural(categoriesCount, ["категория", "категории", "категорий"]) },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: "Akvera", url: SITE_URL },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
      {
        "@type": "WebSite",
        name: "Akvera",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/catalog/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <main className="max-w-[1440px] mx-auto px-20 py-10 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HomeHero stats={stats} />

      {topCategories.length > 0 && (
        <HomeSection title="Категории оборудования" href="/catalog" linkLabel="Весь каталог">
          <CategoryTileGrid
            items={topCategories.map((c) => ({
              slug: c.slug,
              name: c.name,
              href: `/category/${c.slug}`,
              productCount: c.productCount,
              imageUrl: c.imageUrl,
            }))}
          />
        </HomeSection>
      )}

      {popular && (
        <HomeSection title="Популярные товары" href={`/catalog/all?tags=${popular.slug}`}>
          <HomeProductRow cards={popular.cards} />
        </HomeSection>
      )}

      {fresh && (
        <HomeSection title="Новинки" href={`/catalog/all?tags=${fresh.slug}`}>
          <HomeProductRow cards={fresh.cards} />
        </HomeSection>
      )}

      {brands.length > 0 && (
        <HomeSection title="Бренды" href="/brands" linkLabel="Все бренды">
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

      <HomeSection title="О компании" id="about">
        <HomeAbout />
      </HomeSection>

      <HomeSection title="Как сделать заказ">
        <HomeSteps />
      </HomeSection>

      <HomeSection title="Преимущества">
        <HomeAdvantages />
      </HomeSection>

      <HomeSection title="Доставка и оплата" id="delivery">
        <HomeDelivery />
      </HomeSection>

      <HomeSection title="Частые вопросы" id="faq">
        <div className="w-full">
          <HomeFaq />
        </div>
      </HomeSection>

      <LeadRequestBlock />

      <HomeCta />

      <HomeSection title="Реквизиты" id="requisites">
        <HomeRequisites />
      </HomeSection>
    </main>
  );
}