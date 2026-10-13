"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DataOrigin, ModelCapabilities, ModelRow } from "@/data/types";
import { formatDate, formatIndex, formatSeconds, formatTokenPrice } from "@/lib/format";
import { glanceAt, outputMultipleNote, priceRelation } from "@/lib/model-stats";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

type SortKey = "quality" | "coding" | "agentic" | "speed" | "price";

const columns: { key: SortKey; label: string; hint: string }[] = [
  { key: "quality", label: "质量", hint: "综合指数" },
  { key: "coding", label: "编码", hint: "编码指数" },
  { key: "agentic", label: "智能体", hint: "智能体指数" },
  { key: "speed", label: "速度", hint: "tok/s" },
  { key: "price", label: "输入价", hint: "美元 / 百万 token" },
];

const capabilityLabels: { key: keyof ModelCapabilities; label: string }[] = [
  { key: "finance", label: "金融会计" },
  { key: "strategy", label: "战略运营" },
  { key: "legal", label: "法律" },
  { key: "healthcare", label: "医疗" },
  { key: "engineering", label: "工程" },
  { key: "economics", label: "经济" },
];

export function ModelTable({
  models,
  origin,
  priceHint = "美元 / 百万 token",
}: {
  models: ModelRow[];
  origin: DataOrigin;
  priceHint?: string;
}) {
  const [key, setKey] = useState<SortKey>("quality");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const glance = useMemo(() => glanceAt(models), [models]);

  function toggle(next: SortKey) {
    if (next === key) {
      setDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setKey(next);
    setDir(next === "price" ? "asc" : "desc");
  }

  const sorted = useMemo(() => {
    const copy = [...models];
    copy.sort((a, b) => compareSort(a, b, key, dir) || a.name.localeCompare(b.name, "zh"));
    return copy;
  }, [key, dir, models]);

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm leading-6 text-muted-foreground">
        点击表头排序。质量、编码、智能体和速度默认从高到低；第一次点输入价会从低到高。
        {origin === "demo" ? "示意行里没有的发布日和评测费用留空。" : "源里没有的指数留空。"}
      </p>
      <div className="mb-8 flex flex-wrap gap-2 md:hidden" role="group" aria-label="排序">
        {columns.map((column) => {
          const active = key === column.key;
          return (
            <SortButton
              key={column.key}
              active={active}
              label={`${column.label}${active ? (dir === "asc" ? " ↑" : " ↓") : ""}`}
              onClick={() => toggle(column.key)}
            />
          );
        })}
      </div>
      <ul className="border-t border-border md:hidden">
        {sorted.map((row) => (
          <li key={row.id} className="border-b border-border py-6">
            <ModelIdentity row={row} rank={glance.rankById.get(row.id) ?? null} glanceNote={priceRelation(row, glance)} />
            <dl className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="质量" value={formatIndex(row.quality)} />
              <Metric label="编码" value={indexText(row.coding)} />
              <Metric label="智能体" value={indexText(row.agentic)} />
              <Metric label="速度" value={String(row.speed)} unit="tok/s" />
              <Metric label="输入价" value={formatTokenPrice(row.price)} />
              <Metric label="输出价" value={row.outputPrice == null ? "—" : formatTokenPrice(row.outputPrice)} />
            </dl>
            <ModelDetails row={row} />
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <caption className="sr-only">
            模型基准。列有质量、编码、智能体、速度和输入价格。展开一行可看能力指数和时延。
          </caption>
          <thead>
            <tr className="border-b border-border text-sm text-muted-foreground">
              <th scope="col" className="py-4 pr-4 font-normal">
                模型
              </th>
              <th scope="col" className="px-4 py-4 font-normal">
                机构
              </th>
              {columns.map((column) => {
                const active = key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
                    className="px-4 py-4 font-normal"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(column.key)}
                      className={cn(
                        "inline-flex flex-col items-start gap-0.5 text-left",
                        focusRing,
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      <span>
                        {column.label}
                        <span aria-hidden className="ml-1 text-xs">
                          {active ? (dir === "asc" ? "↑" : "↓") : ""}
                        </span>
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {column.key === "price" ? priceHint : column.hint}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className="border-b border-border align-top">
                <th scope="row" className="py-6 pr-4 font-medium tracking-tight">
                  <ModelIdentity
                    row={row}
                    rank={glance.rankById.get(row.id) ?? null}
                    glanceNote={priceRelation(row, glance)}
                  />
                  <ModelDetails row={row} />
                </th>
                <td className="px-4 py-6 text-sm text-muted-foreground">
                  <OrgLink row={row} />
                </td>
                <td className="px-4 py-6">
                  <IndexValue value={row.quality} bar />
                </td>
                <td className="px-4 py-6">
                  <IndexValue value={row.coding} />
                </td>
                <td className="px-4 py-6">
                  <IndexValue value={row.agentic} />
                </td>
                <td className="px-4 py-6 tabular-nums">{row.speed}</td>
                <td className="px-4 py-6 tabular-nums">
                  <div>{formatTokenPrice(row.price)}</div>
                  {row.outputPrice != null ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      输出 {formatTokenPrice(row.outputPrice)}
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full px-4 text-sm motion-safe:transition-colors motion-safe:duration-200",
        focusRing,
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function ModelIdentity({
  row,
  rank,
  glanceNote,
}: {
  row: ModelRow;
  rank: number | null;
  glanceNote: string | null;
}) {
  const bits = [
    rank == null ? null : `本表第 ${rank}`,
    row.releaseDate ? `${formatDate(row.releaseDate)}发布` : null,
    glanceNote,
  ].filter((bit): bit is string => bit != null);

  return (
    <div>
      <p className="text-xl font-medium tracking-tight md:text-lg">{row.name}</p>
      <p className="mt-1 text-sm text-muted-foreground md:hidden">
        <OrgLink row={row} />
      </p>
      {bits.length > 0 ? (
        <p className="mt-2 max-w-sm text-sm leading-6 font-normal text-muted-foreground">{bits.join(" · ")}</p>
      ) : null}
    </div>
  );
}

function OrgLink({ row }: { row: ModelRow }) {
  if (!row.companySlug) return row.organization;
  return (
    <Link
      href={`/companies/${row.companySlug}`}
      className={cn("text-link underline-offset-4 hover:underline", focusRing, hoverFade)}
    >
      {row.organization}
    </Link>
  );
}

function IndexValue({ value, bar = false }: { value: number | null; bar?: boolean }) {
  if (value == null) {
    return (
      <span className="text-muted-foreground">
        <span aria-hidden>—</span>
        <span className="sr-only">未提供</span>
      </span>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 tabular-nums">{formatIndex(value)}</span>
      {bar ? (
        <span className="relative h-[2px] w-16 bg-foreground/15" aria-hidden>
          <span
            className="absolute inset-y-0 left-0 bg-foreground"
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          />
        </span>
      ) : null}
    </div>
  );
}

function Metric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  const missing = value === "—";
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 tabular-nums">
        {missing ? (
          <>
            <span aria-hidden>—</span>
            <span className="sr-only">未提供</span>
          </>
        ) : (
          value
        )}
        {unit && !missing ? <span className="ml-1 text-xs text-muted-foreground">{unit}</span> : null}
      </dd>
    </div>
  );
}

function ModelDetails({ row }: { row: ModelRow }) {
  const hasCapability = capabilityLabels.some((item) => row.capabilities[item.key] != null);
  const latency = [
    row.timeToFirstToken != null ? `首 token ${formatSeconds(row.timeToFirstToken)}` : null,
    row.timeToFirstAnswer != null ? `首个回答 ${formatSeconds(row.timeToFirstAnswer)}` : null,
    row.endToEndSeconds != null ? `端到端 ${formatSeconds(row.endToEndSeconds)}` : null,
  ].filter((bit): bit is string => bit != null);
  const cache = [
    row.cacheHitPrice != null ? `缓存命中 ${formatTokenPrice(row.cacheHitPrice)}` : null,
    row.cacheWritePrice != null ? `缓存写入 ${formatTokenPrice(row.cacheWritePrice)}` : null,
  ].filter((bit): bit is string => bit != null);
  const derived = outputMultipleNote(row.price, row.outputPrice);
  const hasCost = row.indexCost != null || row.indexCostPerTask != null;
  if (!hasCapability && latency.length === 0 && cache.length === 0 && !derived && !hasCost) {
    return null;
  }

  return (
    <details className="group mt-3 max-w-md font-normal">
      <summary
        className={cn(
          "cursor-pointer list-none text-sm text-link [&::-webkit-details-marker]:hidden",
          focusRing,
        )}
      >
        <span className="group-open:hidden">展开能力与时延</span>
        <span className="hidden group-open:inline">收起能力与时延</span>
      </summary>
      <div className="mt-4 space-y-4">
        {hasCapability ? (
          <div>
            <p className="text-xs text-muted-foreground">能力指数</p>
            <dl className="mt-2 grid grid-cols-3 gap-x-4 gap-y-3">
              {capabilityLabels.map((item) => {
                const value = row.capabilities[item.key];
                return (
                  <div key={item.key}>
                    <dt className="text-xs text-muted-foreground">{item.label}</dt>
                    <dd className="mt-1 text-sm tabular-nums">
                      {value == null ? (
                        <>
                          <span aria-hidden>—</span>
                          <span className="sr-only">未提供</span>
                        </>
                      ) : (
                        formatIndex(value)
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ) : null}
        {latency.length > 0 ? <p className="text-sm leading-6 text-muted-foreground">{latency.join(" · ")}</p> : null}
        {cache.length > 0 ? <p className="text-sm leading-6 text-muted-foreground">{cache.join(" · ")}</p> : null}
        {hasCost ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {row.indexCost != null ? `评测费用 ${formatTokenPrice(row.indexCost)}` : "评测费用未提供"}
            {row.indexCostPerTask != null ? ` · 单任务 ${formatTokenPrice(row.indexCostPerTask)}` : null}
          </p>
        ) : null}
        {derived ? <p className="text-sm leading-6 text-muted-foreground">由本行算出：{derived}</p> : null}
      </div>
    </details>
  );
}

function indexText(value: number | null): string {
  return value == null ? "—" : formatIndex(value);
}

function compareSort(a: ModelRow, b: ModelRow, key: SortKey, dir: "asc" | "desc"): number {
  const left = sortValue(a, key);
  const right = sortValue(b, key);
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  const delta = left - right;
  return dir === "asc" ? delta : -delta;
}

function sortValue(row: ModelRow, key: SortKey): number | null {
  if (key === "coding") return row.coding;
  if (key === "agentic") return row.agentic;
  return row[key];
}
