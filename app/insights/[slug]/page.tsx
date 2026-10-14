import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { InsightFacts } from "@/components/insight-summary";
import { InsightText } from "@/components/insight-prose";
import { InvestmentDisclaimer } from "@/components/investment-disclaimer";
import { PageFrame } from "@/components/page-frame";
import { SectionIndex } from "@/components/section-index";
import {
  INSIGHT_BYLINE,
  INSIGHT_NOTE,
  getInsight,
  insights,
  pillarLabel,
  type InsightLink,
} from "@/data/insights";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return insights.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) {
    return { title: "未找到洞察" };
  }
  return {
    title: insight.title,
    description: insight.lede,
  };
}

export default async function InsightPage({
  params,
}: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) notFound();

  const investing = insight.pillar === "investing";
  const columns = insight.related.filter((item) => !item.href.startsWith("/insights/"));
  const essays = insight.related.filter((item) => item.href.startsWith("/insights/"));

  return (
    <PageFrame>
      <article>
        <Breadcrumbs
          items={[
            { href: "/", label: "动态" },
            { href: "/insights", label: "洞察" },
            { label: insight.title },
          ]}
        />
        <header className="mt-12">
          <p className="text-sm text-muted-foreground">
            {pillarLabel(insight.pillar)}
            <span aria-hidden> · </span>
            {INSIGHT_BYLINE}
            <span aria-hidden> · </span>
            {INSIGHT_NOTE}
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl sm:leading-[1.05]">
            {insight.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {insight.lede}
          </p>
          <InsightFacts insight={insight} />
          <SectionIndex current="insights" />
        </header>

        {investing ? (
          <div className="mt-12">
            <InvestmentDisclaimer />
          </div>
        ) : null}

        <aside aria-label="这篇先记住" className="mt-12 max-w-2xl border-y border-border py-6">
          <p className="text-sm font-medium tracking-tight">这篇先记住</p>
          <p className="mt-3 text-xl leading-relaxed">{insight.takeaway}</p>
        </aside>

        {insight.blocks.length >= 2 ? (
          <nav aria-label="目录" className="mt-12 max-w-2xl">
            <h2 className="text-sm text-muted-foreground">目录</h2>
            <ol className="mt-4 border-t border-border">
              {insight.blocks.map((block, index) => (
                <li key={block.id} className="border-b border-border">
                  <a
                    href={`#${block.id}`}
                    className={cn(
                      "flex min-h-11 items-baseline gap-4 py-3",
                      focusRing,
                      hoverFade,
                    )}
                  >
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg tracking-tight">{block.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="mt-12 max-w-2xl">
          {insight.blocks.map((block) => (
            <section key={block.id} id={block.id} className="mt-12 scroll-mt-20 first:mt-0">
              <h2 className="text-2xl font-semibold tracking-tight">{block.heading}</h2>
              <div className="mt-4 space-y-6">
                {block.paragraphs.map((paragraph, index) => (
                  <p key={`${block.id}-${index}`} className="text-lg leading-8">
                    <InsightText text={paragraph} />
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {investing ? (
          <div className="mt-12">
            <InvestmentDisclaimer />
          </div>
        ) : null}

        <nav aria-label="相关阅读" className="mt-20 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">相关阅读</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            只列这篇已经指向的页面。模型、融资和地图上的数字以那些页面最近一次拉取为准，这里不抄。
          </p>
          <RelatedGroup label="栏目" items={columns} />
          <RelatedGroup label="其他洞察" items={essays} />
        </nav>

        {insight.gaps && insight.gaps.length > 0 ? (
          <section aria-label="本篇不链到" className="mt-16 max-w-2xl">
            <h2 className="text-sm text-muted-foreground">本篇不链到</h2>
            <ul className="mt-4 border-t border-border">
              {insight.gaps.map((gap) => (
                <li key={gap.label} className="border-b border-border py-5">
                  <p className="text-lg tracking-tight">{gap.label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{gap.reason}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </PageFrame>
  );
}

function RelatedGroup({ label, items }: { label: string; items: InsightLink[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-8">
      <h3 className="text-sm text-muted-foreground">{label}</h3>
      <ul className="mt-4 border-t border-border">
        {items.map((item) => (
          <li key={item.href} className="border-b border-border">
            <Link
              href={item.href}
              className={cn("block py-4", focusRing, hoverFade)}
            >
              <span className="text-lg tracking-tight">{item.label}</span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
