import type { DataOrigin, ModelRow } from "@/data/types";
import { formatDate, formatIndex, formatTokenPrice } from "@/lib/format";
import { TOP_TIER_GAP, glanceAt } from "@/lib/model-stats";

export function ModelSummary({
  models,
  origin,
  fetchedAt,
  indexVersion,
}: {
  models: ModelRow[];
  origin: DataOrigin;
  fetchedAt: string;
  indexVersion: number | null;
}) {
  const glance = glanceAt(models);
  const top = glance.top;
  const cheapest = glance.cheapestTopTier;
  const fastest = glance.fastest;

  return (
    <section aria-label="本表概览" className="mb-16 border-t border-border pt-10 sm:mb-20">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        <Stat
          label="本表"
          value={String(glance.count)}
          hint={origin === "demo" ? "个 · 示意" : "个模型"}
        />
        <Stat
          label="质量最高"
          value={top ? formatIndex(top.quality) : "—"}
          hint={top?.name ?? "暂无"}
        />
        <Stat
          label="顶尖档最低价"
          value={cheapest ? formatTokenPrice(cheapest.price) : "—"}
          hint={cheapest ? `${cheapest.name} · 输入` : "暂无"}
        />
        <Stat
          label="最快"
          value={fastest ? String(fastest.speed) : "—"}
          hint={fastest ? `${fastest.name} · tok/s` : "暂无"}
        />
        <Stat
          label="最近拉取"
          value={formatDate(fetchedAt)}
          hint={origin === "demo" ? "示意表" : "实时"}
          compact
        />
      </dl>
      <p className="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground">
        {indexVersion != null ? `Intelligence Index v${indexVersion}。` : null}
        顶尖档指质量不低于本表最高分 {TOP_TIER_GAP} 分。名次和价格高低只在这{" "}
        {glance.count} 行里计算，不是源站给出的名次。
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
