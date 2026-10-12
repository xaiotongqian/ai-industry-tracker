import Link from "next/link";
import type { Company, DataOrigin, NewsItem, TrendNote } from "@/data/types";
import { relativeLabel } from "@/lib/format";
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

function MetaLine({
  item,
  asOf,
  companies,
}: {
  item: NewsItem;
  asOf: string;
  companies?: Company[];
}) {
  const name = companies ? companyName(companies, item.companySlug) : null;
  return (
    <p className="font-mono text-[11px] leading-5 text-muted-foreground">
      <time dateTime={item.publishedAt}>{relativeLabel(item.publishedAt, asOf)}</time>
      <span aria-hidden> · </span>
      {item.wire}
      <span aria-hidden> · </span>
      {item.desk}
      {name && item.companySlug ? (
        <>
          <span aria-hidden> · </span>
          <Link href={`/companies/${item.companySlug}`} className={cn("hover:text-primary", focusRing)}>
            {name}
          </Link>
        </>
      ) : null}
    </p>
  );
}

export function LeadStory({
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
  return (
    <article id="latest">
      <MetaLine item={item} asOf={asOf} companies={companies} />
      <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[1.12] tracking-tight text-balance sm:text-5xl lg:text-6xl">
        <StoryTitle item={item} origin={origin} className="hover:text-primary" />
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8">{item.summary}</p>
      <p
        className={cn(
          "mt-3 font-mono text-[11px]",
          origin === "demo" ? "text-cinnabar" : "text-muted-foreground",
        )}
      >
        {origin === "demo" ? "示意稿" : "原文"}
      </p>
    </article>
  );
}

function SideStory({
  item,
  origin,
  asOf,
}: {
  item: NewsItem;
  origin: DataOrigin;
  asOf: string;
}) {
  return (
    <article>
      <MetaLine item={item} asOf={asOf} />
      <h2 className="mt-1 font-serif text-xl leading-snug">
        <StoryTitle item={item} origin={origin} className="hover:text-primary" />
      </h2>
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
    <li className="border-b border-border py-3">
      <MetaLine item={item} asOf={asOf} />
      <h3 className="mt-1 font-serif text-xl leading-snug">
        <StoryTitle item={item} origin={origin} className="hover:text-primary" />
      </h3>
    </li>
  );
}

export function NewsFeed({
  news,
  trends,
  origin,
  asOf,
  trendsOrigin,
  note,
}: {
  news: NewsItem[];
  trends: TrendNote[];
  origin: DataOrigin;
  asOf: string;
  trendsOrigin: DataOrigin;
  note?: string;
}) {
  const side = news.slice(0, 3);
  const feed = news.slice(3);

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {side.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-3">
            {side.map((item) => (
              <SideStory key={item.id} item={item} origin={origin} asOf={asOf} />
            ))}
          </div>
        ) : null}
        {feed.length > 0 ? (
          <ol className={cn("border-t border-border", side.length > 0 && "mt-8")}>
            {feed.map((item) => (
              <FeedRow key={item.id} item={item} origin={origin} asOf={asOf} />
            ))}
          </ol>
        ) : null}
        {note ? (
          <p className="mt-6 max-w-2xl text-xs leading-5 text-muted-foreground">{note}</p>
        ) : null}
      </div>
      <aside className="space-y-10 lg:col-span-4">
        <section>
          <h2 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
            算力与趋势
          </h2>
          <p
            className={cn(
              "mt-2 font-mono text-[11px]",
              trendsOrigin === "demo" ? "text-cinnabar" : "text-muted-foreground",
            )}
          >
            {trendsOrigin === "demo" ? "示意 · Epoch AI" : "Epoch AI · 每周"}
          </p>
          <ul className="mt-3 space-y-2">
            {trends.map((trend) => (
              <li key={trend.id} className="text-sm leading-6">
                {trend.text}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
            机构档案
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            对得上机构的动态会链到档案。
          </p>
          <Link
            href="/companies/deepseek"
            className={cn(
              "mt-2 inline-block text-sm text-primary underline-offset-4 hover:underline",
              focusRing,
            )}
          >
            深度求索
          </Link>
        </section>
      </aside>
    </div>
  );
}
