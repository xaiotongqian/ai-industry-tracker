import type { Metadata } from "next";
import { ModuleStrip } from "@/components/module-strip";
import { LeadStory, NewsFeed } from "@/components/news-feed";
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
  const [lead, ...rest] = news.items;

  return (
    <div className="space-y-10">
      {lead ? (
        <LeadStory
          item={lead}
          origin={news.origin}
          asOf={news.fetchedAt}
          companies={companies.items}
        />
      ) : (
        <h1 className="font-serif text-4xl tracking-tight">暂无动态</h1>
      )}
      <ModuleStrip
        asOf={news.fetchedAt}
        cards={[
          {
            id: "news",
            href: "#latest",
            count: news.items.length,
            origin: news.origin,
          },
          {
            id: "models",
            href: "/models",
            count: models.items.length,
            origin: models.origin,
          },
          {
            id: "funding",
            href: "/funding",
            count: funding.items.length,
            origin: funding.origin,
          },
          {
            id: "landscape",
            href: "/landscape",
            count: companies.items.length,
            origin: companies.origin,
          },
        ]}
      />
      {lead || rest.length > 0 ? (
        <NewsFeed
          news={rest}
          trends={trends.items}
          origin={news.origin}
          asOf={news.fetchedAt}
          trendsOrigin={trends.origin}
          note={news.note}
        />
      ) : null}
    </div>
  );
}
