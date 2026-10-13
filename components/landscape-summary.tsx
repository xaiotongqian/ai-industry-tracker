import type { DataOrigin } from "@/data/types";
import { formatDate } from "@/lib/format";
import type { CompanyGlance } from "@/lib/company-stats";

export function LandscapeSummary({
  glance,
  origin,
  fetchedAt,
}: {
  glance: CompanyGlance;
  origin: DataOrigin;
  fetchedAt: string;
}) {
  return (
    <section aria-label="地图概览" className="mb-16 border-t border-border pt-10 sm:mb-20">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        <Stat
          label="本图"
          value={String(glance.count)}
          hint={origin === "demo" ? "家 · 示意样本" : "家"}
        />
        <Stat
          label="有报道估值"
          value={String(glance.reportedValuation)}
          hint={`示意 ${glance.mockValuation} · 未给出 ${glance.openValuation}`}
        />
        <Stat
          label="上市"
          value={String(glance.publicCount)}
          hint={`另有隶属集团 ${glance.subsidiaryCount}`}
        />
        <Stat label="未上市" value={String(glance.privateCount)} hint="私人公司" />
        <Stat
          label="最近拉取"
          value={formatDate(fetchedAt)}
          hint={origin === "demo" ? "示意样本" : "实时"}
          compact
        />
      </dl>
      <p className="mt-8 text-sm leading-7 text-muted-foreground">
        {glance.byCategory.map((item) => `${item.label} ${item.count}`).join(" · ")}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        有报道估值只计来源写成美元数字的条目。示意、未披露和未换算不计入。上市和未上市按名单标记，隶属集团另计。这些数字是整张地图，不受下面的筛选影响。
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
