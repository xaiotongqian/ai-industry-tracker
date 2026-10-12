import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { InvestmentDisclaimer } from "@/components/investment-disclaimer";
import { PageFrame } from "@/components/page-frame";
import { SectionIndex } from "@/components/section-index";
import {
  INSIGHT_BYLINE,
  INSIGHT_NOTE,
  getInsight,
  insights,
  pillarLabel,
} from "@/data/insights";
import { formatDate } from "@/lib/format";
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
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl sm:leading-[1.05]">
            {insight.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {insight.lede}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            <time dateTime={insight.publishedOn}>{formatDate(insight.publishedOn)}</time>
            <span aria-hidden> · </span>
            {INSIGHT_NOTE}
          </p>
          <SectionIndex current="insights" />
        </header>

        {investing ? (
          <div className="mt-12">
            <InvestmentDisclaimer />
          </div>
        ) : null}

        <div className="mt-12 max-w-2xl">
          {insight.blocks.map((block) => (
            <section key={block.heading ?? block.paragraphs[0]} className="mt-10 first:mt-0">
              {block.heading ? (
                <h2 className="text-2xl font-semibold tracking-tight">{block.heading}</h2>
              ) : null}
              <div className={cn("space-y-6", block.heading && "mt-4")}>
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-lg leading-8">
                    {paragraph}
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

        <nav aria-label="相关阅读" className="mt-16 max-w-2xl">
          <h2 className="text-sm text-muted-foreground">相关</h2>
          <ul className="mt-4 border-t border-border">
            {insight.related.map((item) => (
              <li key={item.href} className="border-b border-border">
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center py-4 text-lg tracking-tight",
                    focusRing,
                    hoverFade,
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </PageFrame>
  );
}
