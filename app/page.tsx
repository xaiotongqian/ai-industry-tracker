import type { Metadata } from "next";
import { ModuleStrip } from "@/components/module-strip";
import { NewsFeed } from "@/components/news-feed";
import { loadCompanies } from "@/lib/ingest/companies";
import { loadFunding } from "@/lib/ingest/funding";
import { loadModels } from "@/lib/ingest/models";
import { loadNews } from "@/lib/ingest/news";
import { loadTrends } from "@/lib/ingest/trends";
import { focusRingDark, frameClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

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
      <section className="-mt-12 bg-black pt-28 pb-20 text-white sm:pt-36 sm:pb-28">
        <div className={frameClass}>
          <p className="text-[13px] tracking-[0.18em] text-white/60">WEITU · 纬图</p>
          <h1 className="mt-5 max-w-4xl text-[2.75rem] leading-[1.12] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            人工智能产业索引。
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-snug text-white/70 sm:text-2xl">
            动态、模型、融资与机构，收在同一处。
          </p>
          {news.items.length > 0 ? (
            <a
              href="#latest"
              className={cn(
                "mt-8 inline-block text-[17px] text-[#2997ff] motion-safe:transition-opacity motion-safe:duration-300 hover:opacity-70",
                focusRingDark,
              )}
            >
              查看最新动态
            </a>
          ) : null}
        </div>
      </section>
      <div className={cn(frameClass, "py-16 sm:py-24")}>
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
        <div className="mt-20 sm:mt-28">
          <NewsFeed
            news={news.items}
            trends={trends.items}
            origin={news.origin}
            asOf={news.fetchedAt}
            trendsOrigin={trends.origin}
            note={news.note}
            companies={companies.items}
          />
        </div>
      </div>
    </>
  );
}
