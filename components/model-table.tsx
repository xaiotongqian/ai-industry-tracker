"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ModelRow } from "@/data/types";
import { formatTokenPrice } from "@/lib/format";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

type SortKey = "quality" | "speed" | "price";

const columns: { key: SortKey; label: string; hint: string }[] = [
  { key: "quality", label: "质量", hint: "越高越好" },
  { key: "speed", label: "速度", hint: "tok/s" },
  { key: "price", label: "价格", hint: "美元 / 百万 token" },
];

export function ModelTable({
  models,
  priceHint = "美元 / 百万 token",
}: {
  models: ModelRow[];
  priceHint?: string;
}) {
  const [key, setKey] = useState<SortKey>("quality");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

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
    copy.sort((a, b) => {
      const delta = a[key] - b[key];
      return dir === "asc" ? delta : -delta;
    });
    return copy;
  }, [key, dir, models]);

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm leading-6 text-muted-foreground">
        点击表头排序。质量默认从高到低；第一次点价格会从低到高。
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
            <ModelTitle row={row} />
            <dl className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="质量" value={formatQuality(row.quality)} />
              <Metric label="速度" value={String(row.speed)} />
              <Metric label="价格" value={formatTokenPrice(row.price)} />
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <caption className="sr-only">模型基准占位表，含质量、速度和价格</caption>
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
                    aria-sort={
                      active ? (dir === "asc" ? "ascending" : "descending") : "none"
                    }
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
              <tr key={row.id} className="border-b border-border">
                <th scope="row" className="py-6 pr-4 text-lg font-medium tracking-tight">
                  {row.name}
                </th>
                <td className="px-4 py-6 text-sm text-muted-foreground">
                  <OrgLink row={row} />
                </td>
                <td className="px-4 py-6">
                  <div className="flex items-center gap-3">
                    <span className="w-10 tabular-nums">{formatQuality(row.quality)}</span>
                    <span className="relative h-[2px] w-24 bg-foreground/15" aria-hidden>
                      <span
                        className="absolute inset-y-0 left-0 bg-foreground"
                        style={{ width: `${Math.max(0, Math.min(100, row.quality))}%` }}
                      />
                    </span>
                  </div>
                </td>
                <td className="px-4 py-6 tabular-nums">{row.speed}</td>
                <td className="px-4 py-6 tabular-nums">{formatTokenPrice(row.price)}</td>
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

function ModelTitle({ row }: { row: ModelRow }) {
  return (
    <div>
      <p className="text-xl font-medium tracking-tight">{row.name}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        <OrgLink row={row} />
      </p>
    </div>
  );
}

function OrgLink({ row }: { row: ModelRow }) {
  if (!row.companySlug) return row.organization;
  return (
    <Link
      href={`/companies/${row.companySlug}`}
      className={cn("underline-offset-4 hover:underline", focusRing, hoverFade)}
    >
      {row.organization}
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 tabular-nums">{value}</dd>
    </div>
  );
}

function formatQuality(quality: number) {
  return Number.isInteger(quality) ? String(quality) : quality.toFixed(1);
}
