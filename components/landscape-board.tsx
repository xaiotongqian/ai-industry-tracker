"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Money } from "@/components/money";
import { categories } from "@/data/categories";
import type { CategoryId, Company, DataOrigin } from "@/data/types";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Filter = CategoryId | "all";

export function LandscapeBoard({
  companies,
  origin,
}: {
  companies: Company[];
  origin: DataOrigin;
}) {
  const [category, setCategory] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const filtered = useMemo(() => {
    const needle = trimmed.toLowerCase();
    return companies.filter((company) => {
      if (category !== "all" && company.category !== category) return false;
      if (!needle) return true;
      const haystack = `${company.name} ${company.nameEn} ${company.blurb} ${company.hq}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [category, trimmed, companies]);

  const grouped = category === "all" && trimmed.length === 0;

  return (
    <div>
      <div className="mb-14 flex flex-col gap-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <form
            role="search"
            className="w-full max-w-md"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="org-search" className="text-sm text-muted-foreground">
              搜索机构
            </label>
            <input
              id="org-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="名称、城市或一句话"
              autoComplete="off"
              className={cn(
                "mt-2 h-12 w-full rounded-xl bg-white px-4 text-base outline-none ring-1 ring-black/10 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground/25",
              )}
            />
          </form>
          <p className="text-sm text-muted-foreground">
            显示 {filtered.length} / {companies.length}
            <span className="mx-2" aria-hidden>
              ·
            </span>
            {origin === "demo" ? "样本 · 目标 200+ · 示意" : "公开名单"}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-1 gap-y-2" role="group" aria-label="机构类别">
          <FilterButton
            active={category === "all"}
            onClick={() => setCategory("all")}
            label={`全部 ${companies.length}`}
          />
          {categories.map((item) => {
            const count = companies.filter(
              (company) => company.category === item.id,
            ).length;
            return (
              <FilterButton
                key={item.id}
                active={category === item.id}
                onClick={() => setCategory(item.id)}
                label={`${item.label} ${count}`}
              />
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16">
          <p className="text-3xl font-semibold tracking-tight">没有匹配的机构</p>
          <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
            试试别的类别，或清空搜索。完整地图接上之后，这里仍用同一套筛选。
          </p>
          <button
            type="button"
            className={cn(
              "mt-8 inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm text-background motion-safe:transition-opacity motion-safe:duration-200 hover:opacity-80",
              focusRing,
            )}
            onClick={() => {
              setCategory("all");
              setQuery("");
            }}
          >
            清空条件
          </button>
        </div>
      ) : grouped ? (
        <div className="space-y-16">
          {categories.map((item) => {
            const rows = filtered.filter((company) => company.category === item.id);
            if (rows.length === 0) return null;
            return (
              <section key={item.id} className="border-t border-border pt-10">
                <header className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-3xl font-semibold tracking-tight">{item.label}</h2>
                  <p className="text-sm text-muted-foreground">
                    {item.en} · {rows.length}
                  </p>
                </header>
                <p className="mb-6 max-w-xl text-sm leading-6 text-muted-foreground">
                  {item.blurb}
                </p>
                <ul className="grid md:grid-cols-2 md:gap-x-16">
                  {rows.map((company) => (
                    <li key={company.slug}>
                      <CompanyRow company={company} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className="border-t border-border">
          {filtered.map((company) => (
            <li key={company.slug}>
              <CompanyRow company={company} showCategory />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterButton({
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

function CompanyRow({
  company,
  showCategory = false,
}: {
  company: Company;
  showCategory?: boolean;
}) {
  const category = categories.find((item) => item.id === company.category);
  return (
    <Link
      href={`/companies/${company.slug}`}
      className={cn(
        "grid gap-1 border-b border-border py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-x-8",
        focusRing,
        hoverFade,
      )}
    >
      <span className="min-w-0">
        <span className="block text-lg font-medium tracking-tight">{company.name}</span>
        <span className="mt-1 block truncate text-sm text-muted-foreground">
          {showCategory && category ? `${category.label} · ` : ""}
          {company.name !== company.nameEn ? `${company.nameEn} · ` : ""}
          {company.blurb}
        </span>
      </span>
      <span className="text-sm text-muted-foreground sm:text-right">
        <Money value={company.valuation} />
      </span>
    </Link>
  );
}
