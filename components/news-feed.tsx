import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Company, DataOrigin, NewsItem, TrendNote } from "@/data/types";
import { relativeLabel } from "@/lib/format";
import { sections, type SectionId } from "@/lib/sections";
import { cn } from "@/lib/utils";

const focusRing =
  "rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

function companyName(companies: Company[], slug: string | null): string | null {
  if (!slug) return null;
  return companies.find((company) => company.slug === slug)?.name ?? null;
}

function StoryTitle({
  item,
  origin,
  className,
}: {
  item: NewsItem;
  origin: DataOrigin;
  className: string;
}) {
  if (origin === "live" && item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(className, focusRing)}
      >
        {item.title}
      </a>
    );
  }
  if (item.companySlug) {
    return (
      <Link href={`/companies/${item.companySlug}`} className={cn(className, focusRing)}>
        {item.title}
      </Link>
    );
  }
  return <span className={className}>{item.title}</span>;
}

function Lead({
  item,
  origin,
  asOf,
  companies,
}: {
  item: NewsItem;
  origin: DataOrigin;
  asOf: string;
  companies: Company[];
}) {
  const name = companyName(companies, item.companySlug);
  return (
    <article className="border border-border bg-card p-5 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline">{item.desk}</Badge>
        <time
          dateTime={item.publishedAt}
          className="font-mono text-xs text-muted-foreground"
        >
          {relativeLabel(item.publishedAt, asOf)}
        </time>
      </div>
      <h3 className="mt-4 font-serif text-3xl leading-tight text-balance sm:text-4xl">
        <StoryTitle item={item} origin={origin} className="hover:text-primary" />
      </h3>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
        {item.summary}
      </p>
      <p className="mt-6 font-mono text-xs text-muted-foreground">
        {item.wire}
        {origin === "demo" ? " · 示意稿" : " · 原文"}
        {name && item.companySlug ? (
          <>
            {" · "}
            <Link
              href={`/companies/${item.companySlug}`}
              className={cn("hover:text-primary", focusRing)}
            >
              {name}
            </Link>
          </>
        ) : null}
      </p>
    </article>
  );
}

function SideCard({
  item,
  origin,
  asOf,
}: {
  item: NewsItem;
  origin: DataOrigin;
  asOf: string;
}) {
  return (
    <article className="flex h-full flex-col border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline">{item.desk}</Badge>
        <time
          dateTime={item.publishedAt}
          className="font-mono text-[11px] text-muted-foreground"
        >
          {relativeLabel(item.publishedAt, asOf)}
        </time>
      </div>
      <h3 className="mt-3 font-serif text-lg leading-snug">
        <StoryTitle item={item} origin={origin} className="hover:text-primary" />
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {item.summary}
      </p>
    </article>
  );
}

function FeedRow({
  item,
  origin,
  asOf,
}: {
  item: NewsItem;
  origin: DataOrigin;
  asOf: string;
}) {
  return (
    <li className="grid gap-2 py-4 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-4">
      <time
        dateTime={item.publishedAt}
        className="font-mono text-xs text-muted-foreground"
      >
        {relativeLabel(item.publishedAt, asOf)}
      </time>
      <div>
        <h3 className="font-serif text-lg leading-snug">
          <StoryTitle item={item} origin={origin} className="hover:text-primary" />
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.summary}</p>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground">{item.desk}</p>
    </li>
  );
}

export function NewsFeed({
  news,
  trends,
  companies,
  counts,
  origin,
  asOf,
  trendsOrigin,
}: {
  news: NewsItem[];
  trends: TrendNote[];
  companies: Company[];
  counts: { news: number; models: number; rounds: number; companies: number };
  origin: DataOrigin;
  asOf: string;
  trendsOrigin: DataOrigin;
}) {
  const [lead, ...rest] = news;
  if (!lead) return null;
  const side = rest.slice(0, 3);
  const feed = rest.slice(3);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <Lead item={lead} origin={origin} asOf={asOf} companies={companies} />
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {side.map((item) => (
            <SideCard key={item.id} item={item} origin={origin} asOf={asOf} />
          ))}
        </div>
        <ol className="mt-8 divide-y border-y border-border">
          {feed.map((item) => (
            <FeedRow key={item.id} item={item} origin={origin} asOf={asOf} />
          ))}
        </ol>
      </div>
      <aside className="space-y-6 lg:col-span-4">
        <section className="border border-border bg-card p-4">
          <h3 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
            进入栏目
          </h3>
          <ul className="mt-3 divide-y border-y border-border">
            {sections.map((section) => (
              <li key={section.id}>
                <Link
                  href={section.id === "news" ? "#latest" : section.href}
                  className={cn(
                    "flex items-baseline justify-between gap-3 py-2 hover:text-primary",
                    focusRing,
                  )}
                >
                  <span className="text-sm">
                    <span className="mr-2 font-mono text-[10px] text-muted-foreground">
                      {section.index}
                    </span>
                    {section.label}
                  </span>
                  <span className="font-mono text-lg tabular-nums">
                    {countFor(section.id, counts)}
                    <span className="ml-1 text-[11px] text-muted-foreground">
                      {section.unit}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            地图计划覆盖 200 家以上。当前 {counts.companies} 家。
          </p>
        </section>
        <section className="border border-border bg-card p-4">
          <h3 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
            算力与趋势
          </h3>
          <p
            className={
              trendsOrigin === "demo"
                ? "mt-2 text-xs text-cinnabar"
                : "mt-2 text-xs text-primary"
            }
          >
            {trendsOrigin === "demo" ? "示意数据 · Demo · Epoch AI" : "Epoch AI · 每周"}
          </p>
          <ul className="mt-3 space-y-2">
            {trends.map((trend) => (
              <li key={trend.id} className="text-sm leading-6">
                {trend.text}
                {trendsOrigin === "demo" ? (
                  <span className="ml-1.5 text-[10px] tracking-widest text-cinnabar">
                    示意
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
        <section className="border border-border bg-card p-4">
          <h3 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
            机构档案
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            对得上机构的动态会链到档案。也可以从产业地图进入。
          </p>
          <Link
            href="/companies/deepseek"
            className={cn(
              "mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline",
              focusRing,
            )}
          >
            打开深度求索的档案
          </Link>
        </section>
      </aside>
    </div>
  );
}

function countFor(
  id: SectionId,
  counts: { news: number; models: number; rounds: number; companies: number },
): number {
  switch (id) {
    case "news":
      return counts.news;
    case "models":
      return counts.models;
    case "funding":
      return counts.rounds;
    case "landscape":
      return counts.companies;
  }
}
