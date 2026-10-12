import type { Metadata } from "next";
import { CadenceBadge } from "@/components/cadence-badge";
import { DataMark } from "@/components/data-mark";
import { EmptyNote } from "@/components/empty-note";
import { HomeHero } from "@/components/home-hero";
import { NewsFeed } from "@/components/news-feed";
import { loadCompanies } from "@/lib/ingest/companies";
import { loadFunding } from "@/lib/ingest/funding";
import { loadModels } from "@/lib/ingest/models";
import { loadNews } from "@/lib/ingest/news";
import { loadTrends } from "@/lib/ingest/trends";

export const metadata: Metadata = {
  title: { absolute: "纬图 · 人工智能产业索引" },
  description:
    "动态、模型基准、融资与产业地图。公开源按栏目更新，读不到的标示意。",
};

export default async function HomePage() {
  const [news, trends, companies, models, funding] = await Promise.all([
    loadNews(),
    loadTrends(),
    loadCompanies(),
    loadModels(),
    loadFunding(),
  ]);

  return (
    <>
      <HomeHero
        asOf={news.fetchedAt}
        newsOrigin={news.origin}
        cards={[
          {
            id: "news",
            href: "#latest",
            count: news.items.length,
            origin: news.origin,
            sourceName: news.sourceName,
          },
          {
            id: "models",
            href: "/models",
            count: models.items.length,
            origin: models.origin,
            sourceName: models.sourceName,
          },
          {
            id: "funding",
            href: "/funding",
            count: funding.items.length,
            origin: funding.origin,
            sourceName: funding.sourceName,
          },
          {
            id: "landscape",
            href: "/landscape",
            count: companies.items.length,
            origin: companies.origin,
            sourceName: companies.sourceName,
          },
        ]}
      />
      <section id="latest" aria-labelledby="latest-heading">
        <div className="mb-6 border-b border-foreground/80 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="latest-heading" className="font-serif text-3xl tracking-tight">
              最新动态
            </h2>
            <CadenceBadge cadence="hourly" />
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            头条、侧卡和列表读同一份动态。对得上机构的条目会链到档案，实时标题链到原文。
          </p>
          <div className="mt-4 max-w-2xl">
            <DataMark
              origin={news.origin}
              sourceName={news.sourceName}
              sourceHref={news.sourceHref}
              note={news.note}
            />
          </div>
        </div>
        {news.items.length === 0 ? (
          <EmptyNote>这一轮没有动态。</EmptyNote>
        ) : (
          <NewsFeed
            news={news.items}
            trends={trends.items}
            companies={companies.items}
            counts={{
              news: news.items.length,
              models: models.items.length,
              rounds: funding.items.length,
              companies: companies.items.length,
            }}
            origin={news.origin}
            asOf={news.fetchedAt}
            trendsOrigin={trends.origin}
          />
        )}
      </section>
    </>
  );
}
