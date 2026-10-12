import Link from "next/link";
import type { Company, DataOrigin, NewsItem, TrendNote } from "@/data/types";
import { relativeLabel } from "@/lib/format";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

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
        className={cn(className, focusRing, hoverFade)}
      >
        {item.title}
      </a>
    );
  }
  if (item.companySlug) {
    return (
      <Link href={`/companies/${item.companySlug}`} className={cn(className, focusRing, hoverFade)}>
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
  origin,
}: {
  item: NewsItem;
  asOf: string;
  companies?: Company[];
  origin?: DataOrigin;
}) {
  const name = companies ? companyName(companies, item.companySlug) : null;
  return (
    <p className="text-sm leading-6 text-muted-foreground">
      <time dateTime={item.publishedAt}>{relativeLabel(item.publishedAt, asOf)}</time>
      <span aria-hidden> · </span>
      {item.wire}
      <span aria-hidden> · </span>
      {item.desk}
      {name && item.companySlug ? (
        <>
          <span aria-hidden> · </span>
          <Link
            href={`/companies/${item.companySlug}`}
            className={cn("text-link underline-offset-4 hover:underline", focusRing)}
          >
            {name}
          </Link>
        </>
      ) : null}
      {origin === "demo" ? (
        <>
          <span aria-hidden> · </span>
          示意
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
  companies?: Company[];
}) {
  return (
    <article>
      <h2 className="max-w-4xl text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
        <StoryTitle item={item} origin={origin} className="" />
      </h2>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/80">{item.summary}</p>
      <div className="mt-4">
        <MetaLine item={item} asOf={asOf} companies={companies} origin={origin} />
      </div>
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
    <li className="border-b border-border py-6">
      <h3 className="text-xl leading-snug font-medium tracking-tight">
        <StoryTitle item={item} origin={origin} className="" />
      </h3>
      <div className="mt-2">
        <MetaLine item={item} asOf={asOf} origin={origin} />
      </div>
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
  companies,
}: {
  news: NewsItem[];
  trends: TrendNote[];
  origin: DataOrigin;
  asOf: string;
  trendsOrigin: DataOrigin;
  note?: string;
  companies?: Company[];
}) {
  const [lead, ...rest] = news;

  return (
    <div id="latest" className="space-y-20 sm:space-y-28">
      {lead ? (
        <LeadStory item={lead} origin={origin} asOf={asOf} companies={companies} />
      ) : (
        <p className="text-2xl font-medium tracking-tight text-muted-foreground">暂无动态</p>
      )}
      {rest.length > 0 ? (
        <ol className="border-t border-border">
          {rest.map((item) => (
            <FeedRow key={item.id} item={item} origin={origin} asOf={asOf} />
          ))}
        </ol>
      ) : null}
      {note ? (
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{note}</p>
      ) : null}
      <section className="max-w-3xl">
        <h2 className="text-3xl font-semibold tracking-tight">算力与趋势</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {trendsOrigin === "demo" ? "示意 · Epoch AI" : "Epoch AI · 每周"}
        </p>
        <ul className="mt-8 space-y-6">
          {trends.map((trend) => (
            <li key={trend.id} className="text-[17px] leading-relaxed">
              {trend.text}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-3xl font-semibold tracking-tight">机构档案</h2>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          对得上机构的动态会链到档案。
        </p>
        <Link
          href="/companies/deepseek"
          className={cn(
            "mt-4 inline-block text-[17px] text-link underline-offset-4 hover:underline",
            focusRing,
          )}
        >
          深度求索
        </Link>
      </section>
    </div>
  );
}
