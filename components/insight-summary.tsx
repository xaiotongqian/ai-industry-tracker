import type { Insight } from "@/data/insights";
import { INSIGHT_BYLINE, INSIGHT_NOTE, pillars, pillarLabel } from "@/data/insights";
import { formatDate } from "@/lib/format";
import { glanceAtInsights, measureInsight } from "@/lib/insight-stats";

export function InsightSummary({ items }: { items: readonly Insight[] }) {
  const glance = glanceAtInsights(items);

  return (
    <section aria-label="本栏概览" className="mb-16 border-t border-border pt-10 sm:mb-20">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="本栏" value={String(glance.count)} hint="篇 · 编辑写定" />
        {pillars.map((pillar) => (
          <Stat
            key={pillar.id}
            label={pillar.label}
            value={String(glance.byPillar[pillar.id])}
            hint={pillar.id === "investing" ? "篇 · 含免责声明" : "篇"}
          />
        ))}
        <Stat
          label="最近刊出"
          value={glance.latest ? formatDate(glance.latest) : "—"}
          hint={INSIGHT_NOTE}
          compact
        />
      </dl>
      <p className="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground">
        篇数按本栏文章、分三个栏目计算，不是市场统计。阅读时间按正文汉字估算，外文词各算一字，约
        400 字一分钟，标成「约」。这些文章由编辑写定，不经过拉取，也不随模型、融资或地图更新。
      </p>
    </section>
  );
}

export function InsightFacts({ insight }: { insight: Insight }) {
  const measure = measureInsight(insight);

  return (
    <section aria-label="这篇概览" className="mt-10 border-t border-border pt-10">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="栏目" value={pillarLabel(insight.pillar)} hint={insight.topic} compact />
        <Stat label="署名" value={INSIGHT_BYLINE} hint={INSIGHT_NOTE} compact />
        <Stat
          label="刊出"
          value={formatDate(insight.publishedOn)}
          hint="编辑刊出"
          compact
        />
        <Stat
          label="篇幅"
          value={`约 ${measure.minutes} 分钟`}
          hint={`正文 ${measure.paragraphs} 段`}
        />
        <Stat label="小节" value={String(measure.sections)} hint="文内小标题" />
      </dl>
      <p className="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground">
        阅读时间按这篇正文估算，约 400 字一分钟，不是测量。小节数等于下面的小标题个数。
      </p>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  compact = false,
}: {
  label: string;
  value: string;
  hint: string;
  compact?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-2">
        <span
          className={
            compact
              ? "block text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
              : "block text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl"
          }
        >
          {value}
        </span>
        <span className="mt-2 block text-sm leading-6 text-muted-foreground">{hint}</span>
      </dd>
    </div>
  );
}
