"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ModelRow } from "@/data/types";
import { formatTokenPrice } from "@/lib/format";
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
      <p className="mb-3 text-xs text-muted-foreground">
        点击表头排序。质量默认从高到低；第一次点价格会从低到高。窄屏可左右滑动。
      </p>
      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="sr-only">
            模型基准占位表，含质量、速度和价格
          </caption>
          <thead>
            <tr className="border-b border-border bg-muted/60">
              <th scope="col" className="px-3 py-3 font-medium">
                模型
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                机构
              </th>
              {columns.map((column) => {
                const active = key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      active
                        ? dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className="px-3 py-3 font-medium"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(column.key)}
                      className={cn(
                        "inline-flex flex-col items-start gap-0.5 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        active && "text-primary",
                      )}
                    >
                      <span>
                        {column.label}
                        <span aria-hidden className="ml-1 font-mono text-[10px]">
                          {active ? (dir === "asc" ? "↑" : "↓") : ""}
                        </span>
                      </span>
                      <span className="font-normal text-[10px] tracking-normal text-muted-foreground">
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
              <ModelLine key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ModelLine({ row }: { row: ModelRow }) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <th scope="row" className="px-3 py-3 font-serif text-base font-medium">
        {row.name}
      </th>
      <td className="px-3 py-3">
        {row.companySlug ? (
          <Link
            href={`/companies/${row.companySlug}`}
            className="underline-offset-4 hover:text-primary hover:underline"
          >
            {row.organization}
          </Link>
        ) : (
          row.organization
        )}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-10 font-mono tabular-nums">
            {Number.isInteger(row.quality) ? row.quality : row.quality.toFixed(1)}
          </span>
          <span className="h-1.5 w-24 bg-muted" aria-hidden>
            <span
              className="block h-full bg-primary"
              style={{ width: `${Math.max(0, Math.min(100, row.quality))}%` }}
            />
          </span>
        </div>
      </td>
      <td className="px-3 py-3 font-mono tabular-nums">{row.speed}</td>
      <td className="px-3 py-3 font-mono tabular-nums">
        {formatTokenPrice(row.price)}
      </td>
    </tr>
  );
}
