"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/money";
import { categories } from "@/data/categories";
import { companies } from "@/data/companies";
import type { CategoryId, Company } from "@/data/types";

type Filter = CategoryId | "all";

export function LandscapeBoard() {
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
  }, [category, trimmed]);

  const grouped = category === "all" && trimmed.length === 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <form
            role="search"
            className="w-full sm:max-w-xs"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="org-search" className="text-xs text-muted-foreground">
              搜索机构
            </label>
            <input
              id="org-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="名称、城市或一句话"
              autoComplete="off"
              className="mt-1 h-9 w-full border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </form>
          <p className="font-mono text-xs text-muted-foreground">
            显示 {filtered.length} / {companies.length}
            <span className="ml-2 text-cinnabar">样本 · 目标 200+</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="机构类别">
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
        <div className="border border-dashed border-border bg-card/70 px-4 py-10 text-center">
          <p className="font-serif text-2xl">没有匹配的机构</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            试试别的类别，或清空搜索。完整地图接上之后，这里仍用同一套筛选。
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => {
              setCategory("all");
              setQuery("");
            }}
          >
            清空条件
          </Button>
        </div>
      ) : grouped ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((item) => {
            const rows = filtered.filter((company) => company.category === item.id);
            return (
              <section key={item.id} className="border border-border bg-card">
                <header className="border-b border-border px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-serif text-xl">{item.label}</h2>
                    <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
                      {item.en} · {rows.length}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.blurb}
                  </p>
                </header>
                <ul className="divide-y divide-border">
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
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((company) => (
            <li key={company.slug}>
              <CompanyCard company={company} />
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
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

function CompanyRow({ company }: { company: Company }) {
  return (
    <Link
      href={`/companies/${company.slug}`}
      className="block px-4 py-3 transition-colors hover:bg-muted/70"
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-serif text-lg leading-tight">{company.name}</span>
        <span className="shrink-0 text-xs">
          <Money value={company.valuation} />
        </span>
      </span>
      {company.name !== company.nameEn ? (
        <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
          {company.nameEn}
        </span>
      ) : null}
      <span className="mt-1 block text-sm leading-6 text-muted-foreground">
        {company.blurb}
      </span>
    </Link>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const category = categories.find((item) => item.id === company.category);
  return (
    <Link
      href={`/companies/${company.slug}`}
      className="flex h-full flex-col border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <span className="font-mono text-[11px] tracking-[0.14em] text-primary">
        {category?.label}
      </span>
      <span className="mt-2 font-serif text-2xl leading-tight">{company.name}</span>
      {company.name !== company.nameEn ? (
        <span className="mt-1 text-sm text-muted-foreground">{company.nameEn}</span>
      ) : null}
      <span className="mt-3 text-sm leading-6 text-muted-foreground">
        {company.blurb}
      </span>
      <span className="mt-4 text-sm">
        估值 <Money value={company.valuation} />
      </span>
    </Link>
  );
}
