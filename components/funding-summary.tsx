import type { DataOrigin, FundingRound } from "@/data/types";
import { formatDate, formatUsd } from "@/lib/format";
import {
  companyLabel,
  glanceAtFunding,
  type FundingCompanyRef,
} from "@/lib/funding-stats";

export function FundingSummary({
  rounds,
  companies,
  origin,
  fetchedAt,
  sourceTotal,
}: {
  rounds: FundingRound[];
  companies: FundingCompanyRef[];
  origin: DataOrigin;
  fetchedAt: string;
  sourceTotal: number | null;
}) {
  const glance = glanceAtFunding(rounds, companies);
  const bySlug = new Map(companies.map((company) => [company.slug, company]));
  const largest = glance.largest;
  const latest = glance.latest;
  const largestName = largest ? companyLabel(largest, bySlug) : "暂无";
  const latestName = latest ? companyLabel(latest, bySlug) : "暂无";
  const pageHint = [
    origin === "demo" ? "笔 · 示意" : "笔",
    `${glance.mappedCount} 笔已入地图`,
    sourceTotal != null && sourceTotal > glance.count ? `源内 ${sourceTotal} 笔` : null,
  ]
    .filter((bit): bit is string => bit != null)
    .join(" · ");

  return (
    <section aria-label="本页概览" className="mb-16 border-t border-border pt-10 sm:mb-20">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        <Stat
          label="本页"
          value={String(glance.count)}
          hint={pageHint}
        />
        <Stat
          label={origin === "demo" ? "示意合计" : "已披露美元"}
          value={glance.summable ? formatUsd(glance.totalUsd) : "—"}
          hint={
            glance.excludedCount > 0
              ? `${glance.excludedCount} 笔未计入`
              : glance.summable
                ? "本页全部计入"
                : "没有可加总的金额"
          }
        />
        <Stat
          label="最大一轮"
          value={largest && glance.summable ? formatUsd(moneyUsd(largest)) : "—"}
          hint={
            largest
              ? `${largestName} · ${largest.round}${largest.amount.status === "mock" ? " · 示意" : ""}`
              : "暂无"
          }
        />
        <Stat
          label="最近公布"
          value={latest ? formatDate(latest.announcedOn) : "—"}
          hint={latestName}
          compact
        />
        <Stat
          label="最近拉取"
          value={formatDate(fetchedAt)}
          hint={origin === "demo" ? "示意轮次" : "实时"}
          compact
        />
      </dl>
      <p className="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground">
        {origin === "demo"
          ? "合计加总的是示意金额。"
          : "合计只加已披露的美元。其他币种保留原文，不换算。"}
        {sourceTotal != null && sourceTotal > glance.count
          ? ` 源报告共 ${sourceTotal} 笔，本页是最近 ${glance.count} 笔。`
          : ` 最大一轮和笔数按本页这 ${glance.count} 笔计算。`}
        筛选只改下面的列表。
      </p>
    </section>
  );
}

function moneyUsd(round: FundingRound): number {
  return round.amount.status === "mock" || round.amount.status === "reported" ? round.amount.usd : 0;
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
        <span className="mt-2 block text-sm leading-6 text-muted-foreground line-clamp-2">{hint}</span>
      </dd>
    </div>
  );
}
