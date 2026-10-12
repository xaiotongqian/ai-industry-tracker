import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getCompany } from "@/data/companies";
import { news } from "@/data/news";
import { trends } from "@/data/trends";
import { companies } from "@/data/companies";
import { models } from "@/data/models";
import { rounds } from "@/data/funding";
import type { NewsItem } from "@/data/types";
import { relativeLabel } from "@/lib/format";

function companyName(slug: string): string {
  return getCompany(slug)?.name ?? slug;
}

function Lead({ item }: { item: NewsItem }) {
  return (
    <article className="border border-border bg-card p-5 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline">{item.desk}</Badge>
        <time
          dateTime={item.publishedAt}
          className="font-mono text-xs text-muted-foreground"
        >
          {relativeLabel(item.publishedAt)}
        </time>
      </div>
      <h2 className="mt-4 font-serif text-3xl leading-tight text-balance sm:text-4xl">
        <Link
          href={`/companies/${item.companySlug}`}
          className="hover:text-primary"
        >
          {item.title}
        </Link>
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
        {item.summary}
      </p>
      <p className="mt-6 font-mono text-xs text-muted-foreground">
        {item.wire} · 示意稿 · {companyName(item.companySlug)}
      </p>
    </article>
  );
}

function SideCard({ item }: { item: NewsItem }) {
  return (
    <article className="flex h-full flex-col border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline">{item.desk}</Badge>
        <time
          dateTime={item.publishedAt}
          className="font-mono text-[11px] text-muted-foreground"
        >
          {relativeLabel(item.publishedAt)}
        </time>
      </div>
      <h3 className="mt-3 font-serif text-lg leading-snug">
        <Link
          href={`/companies/${item.companySlug}`}
          className="hover:text-primary"
        >
          {item.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {item.summary}
      </p>
    </article>
  );
}

function FeedRow({ item }: { item: NewsItem }) {
  return (
    <li className="grid gap-2 py-4 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-4">
      <time
        dateTime={item.publishedAt}
        className="font-mono text-xs text-muted-foreground"
      >
        {relativeLabel(item.publishedAt)}
      </time>
      <div>
        <h3 className="font-serif text-lg leading-snug">
          <Link
            href={`/companies/${item.companySlug}`}
            className="hover:text-primary"
          >
            {item.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {item.summary}
        </p>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground">{item.desk}</p>
    </li>
  );
}

export function NewsFeed() {
  const [lead, ...rest] = news;
  if (!lead) return null;
  const side = rest.slice(0, 3);
  const feed = rest.slice(3);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <Lead item={lead} />
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {side.map((item) => (
            <SideCard key={item.id} item={item} />
          ))}
        </div>
        <ol className="mt-8 divide-y border-y border-border">
          {feed.map((item) => (
            <FeedRow key={item.id} item={item} />
          ))}
        </ol>
      </div>
      <aside className="space-y-6 lg:col-span-4">
        <section className="border border-border bg-card p-4">
          <h2 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
            样本规模
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {[
              ["动态", news.length],
              ["模型", models.length],
              ["融资", rounds.length],
              ["机构", companies.length],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="font-mono text-2xl tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            地图计划覆盖 200 家以上。当前 {companies.length} 家用来预览版式。
          </p>
        </section>
        <section className="border border-border bg-card p-4">
          <h2 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
            算力与趋势
          </h2>
          <p className="mt-2 text-xs text-cinnabar">槽位：Epoch AI · 每周 · 未接入</p>
          <ul className="mt-3 space-y-2">
            {trends.map((trend) => (
              <li key={trend.id} className="text-sm leading-6">
                {trend.text}
                <span className="ml-1.5 text-[10px] tracking-widest text-cinnabar">
                  示意
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="border border-border bg-card p-4">
          <h2 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
            机构档案
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            每条动态链到对应机构。也可以从产业地图进入。
          </p>
          <Link
            href="/companies/deepseek"
            className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
          >
            打开深度求索的档案
          </Link>
        </section>
      </aside>
    </div>
  );
}
