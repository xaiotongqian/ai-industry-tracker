import type { Metadata } from "next";
import Link from "next/link";
import { InvestmentDisclaimer } from "@/components/investment-disclaimer";
import { PageFrame } from "@/components/page-frame";
import { PageIntro } from "@/components/page-intro";
import { INSIGHT_BYLINE, insights, pillars } from "@/data/insights";
import { formatDate } from "@/lib/format";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "洞察",
  description:
    "AI纵横 编辑撰写的分析：发展态势、行业影响与投资视角。标明观点，不是实时生成，也不构成投资建议。",
};

export default function InsightsPage() {
  return (
    <PageFrame>
      <PageIntro
        section="insights"
        title="洞察"
        cadence="editorial"
        lede="原创分析，不是新闻抓取。每篇标明「AI纵横 观点」，由编辑写定。数字以站内栏目为准，这里不另造实时结论。"
        mark={
          <p className="text-sm leading-6 text-muted-foreground">
            署名 {INSIGHT_BYLINE}。站点作者{" "}
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
      <div className="space-y-20">
        {pillars.map((pillar) => {
          const items = insights.filter((item) => item.pillar === pillar.id);
          return (
            <section key={pillar.id} aria-labelledby={`pillar-${pillar.id}`}>
              <h2
                id={`pillar-${pillar.id}`}
                className="text-sm text-muted-foreground"
              >
                {pillar.label}
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed">{pillar.lede}</p>
              {pillar.id === "investing" ? (
                <div className="mt-8">
                  <InvestmentDisclaimer />
                </div>
              ) : null}
              <ol className={cn("border-t border-border", pillar.id === "investing" ? "mt-0 border-t-0" : "mt-8")}>
                {items.map((item) => (
                  <li key={item.slug} className="border-b border-border">
                    <Link
                      href={`/insights/${item.slug}`}
                      className={cn("block py-8", focusRing, hoverFade)}
                    >
                      <p className="text-sm text-muted-foreground">
                        <time dateTime={item.publishedOn}>{formatDate(item.publishedOn)}</time>
                        <span aria-hidden> · </span>
                        {INSIGHT_BYLINE}
                      </p>
                      <h3 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        {item.lede}
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
