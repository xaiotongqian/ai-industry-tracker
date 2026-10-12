import type { Metadata } from "next";
import { DataMark } from "@/components/data-mark";
import { NewsFeed } from "@/components/news-feed";
import { PageIntro } from "@/components/page-intro";
import { loadCompanies } from "@/lib/ingest/companies";
import { loadFunding } from "@/lib/ingest/funding";
import { loadModels } from "@/lib/ingest/models";
import { loadNews } from "@/lib/ingest/news";
import { loadTrends } from "@/lib/ingest/trends";

export const metadata: Metadata = {
  title: { absolute: "首页动态 · 纬图" },
  description: "AI 行业动态，计划每小时更新。",
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
      <PageIntro
        index="01  /  首页"
        title="首页动态"
        cadence="hourly"
        lede="每小时更新。头条、侧卡和列表读同一份动态。对得上机构的条目会链到档案，实时标题链到原文。"
        mark={
          <DataMark
            origin={news.origin}
            sourceName={news.sourceName}
            sourceHref={news.sourceHref}
            note={news.note}
          />
        }
      />
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
    </>
  );
}
