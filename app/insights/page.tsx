import type { Metadata } from "next";
import Link from "next/link";
import { InsightSummary } from "@/components/insight-summary";
import { InvestmentDisclaimer } from "@/components/investment-disclaimer";
import { PageFrame } from "@/components/page-frame";
import { PageIntro } from "@/components/page-intro";
import { INSIGHT_BYLINE, INSIGHT_NOTE, insights, pillars } from "@/data/insights";
import { formatDate } from "@/lib/format";
import { byPublishedDesc, measureInsight, measureLabel } from "@/lib/insight-stats";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "洞察",
  description:
    "AI纵横 编辑写定的分析：发展态势、行业影响与投资视角。页首按栏目计数。不是实时生成，也不构成投资建议。",
};

export default function InsightsPage() {
  return (
    <PageFrame>
      <PageIntro
        section="insights"
        title="洞察"
        cadence="editorial"
        lede="原创分析，不是新闻抓取。每篇标明「AI纵横 观点」，由编辑写定。页首按栏目计数。文中若提到模型、融资或地图，数字以那些页面最近一次拉取为准。"
        mark={
          <p className="text-sm leading-6 text-muted-foreground">
            署名 {INSIGHT_BYLINE}。{INSIGHT_NOTE} 站点作者{" "}
            <Link
              href="/about"
              className={cn("text-link underline-offset-4 hover:underline", focusRing)}
            >
              刘永武
            </Link>
            。
          </p>
        }
      />
      <InsightSummary items={insights} />
      <div className="space-y-20">
        {pillars.map((pillar) => {
          const items = insights.filter((item) => item.pillar === pillar.id).sort(byPublishedDesc);
          return (
            <section key={pillar.id} aria-labelledby={`pillar-${pillar.id}`}>
              <h2 id={`pillar-${pillar.id}`} className="text-sm text-muted-foreground">
                {pillar.label}
                <span className="ml-3 tabular-nums">{items.length} 篇</span>
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed">{pillar.lede}</p>
              {pillar.id === "investing" ? (
                <div className="mt-8">
                  <InvestmentDisclaimer />
                </div>
              ) : null}
              <ol
                className={cn(
                  "border-t border-border",
                  pillar.id === "investing" ? "mt-0 border-t-0" : "mt-8",
                )}
              >
                {items.map((item) => (
                  <li key={item.slug} className="border-b border-border">
                    <Link
                      href={`/insights/${item.slug}`}
                      className={cn("block py-8", focusRing, hoverFade)}
                    >
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground">
                          {item.topic}
                        </span>
                        <span>{pillar.label}</span>
                        <span aria-hidden>·</span>
                        <time dateTime={item.publishedOn}>{formatDate(item.publishedOn)}</time>
                      </p>
                      <h3 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        {item.lede}
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {INSIGHT_BYLINE}
                        <span aria-hidden> · </span>
                        {measureLabel(measureInsight(item))}
                      </p>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </PageFrame>
  );
}
