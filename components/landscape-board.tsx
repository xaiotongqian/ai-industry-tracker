"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Money } from "@/components/money";
import { categories } from "@/data/categories";
import type { CategoryId, Listing } from "@/data/types";
import type { BoardCompany } from "@/lib/company-stats";
import { listingLabel } from "@/lib/format";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

type CategoryFilter = CategoryId | "all";
type ListingFilter = Listing | "all";
type ValueFilter = "all" | "reported" | "mock" | "open";

export function LandscapeBoard({ companies }: { companies: BoardCompany[] }) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [listing, setListing] = useState<ListingFilter>("all");
  const [valuation, setValuation] = useState<ValueFilter>("all");
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const view = useMemo(() => {
    const needle = trimmed.toLowerCase();
    const count = (filters: Filters) =>
      companies.filter((company) => passes(company, needle, filters)).length;
    return {
      filtered: companies.filter((company) =>
        passes(company, needle, { category, listing, valuation }),
      ),
      all: count({ category: "all", listing, valuation }),
      category: (id: CategoryId) => count({ category: id, listing, valuation }),
      listing: (id: ListingFilter) => count({ category, listing: id, valuation }),
      valuation: (id: ValueFilter) => count({ category, listing, valuation: id }),
    };
  }, [category, listing, valuation, trimmed, companies]);
  const filtered = view.filtered;

  const grouped =
    category === "all" && listing === "all" && valuation === "all" && trimmed.length === 0;

  function reset() {
    setCategory("all");
    setListing("all");
    setValuation("all");
    setQuery("");
  }

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
              placeholder="名称、城市、产品或代码"
              autoComplete="off"
              className="mt-2 h-12 w-full rounded-xl bg-white px-4 text-base outline-none ring-1 ring-black/10 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground/25"
            />
          </form>
          <p className="text-sm text-muted-foreground">
            显示 {filtered.length} / {companies.length}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-1 gap-y-2" role="group" aria-label="机构类别">
          <FilterButton
            active={category === "all"}
            onClick={() => setCategory("all")}
            label={`全部 ${view.all}`}
          />
          {categories.map((item) => (
            <FilterButton
              key={item.id}
              active={category === item.id}
              onClick={() => setCategory(item.id)}
              label={`${item.label} ${view.category(item.id)}`}
            />
          ))}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10 sm:gap-y-3">
          <FilterGroup label="上市">
            <FilterButton
              active={listing === "all"}
              onClick={() => setListing("all")}
              label="不限"
            />
            <FilterButton
              active={listing === "public"}
              onClick={() => setListing("public")}
              label={`上市 ${view.listing("public")}`}
            />
            <FilterButton
              active={listing === "private"}
              onClick={() => setListing("private")}
              label={`未上市 ${view.listing("private")}`}
            />
            <FilterButton
              active={listing === "subsidiary"}
              onClick={() => setListing("subsidiary")}
              label={`隶属 ${view.listing("subsidiary")}`}
            />
          </FilterGroup>
          <FilterGroup label="估值">
            <FilterButton
              active={valuation === "all"}
              onClick={() => setValuation("all")}
              label="不限"
            />
            <FilterButton
              active={valuation === "reported"}
              onClick={() => setValuation("reported")}
              label={`报道 ${view.valuation("reported")}`}
            />
            <FilterButton
              active={valuation === "mock"}
              onClick={() => setValuation("mock")}
              label={`示意 ${view.valuation("mock")}`}
            />
            <FilterButton
              active={valuation === "open"}
              onClick={() => setValuation("open")}
              label={`未给出 ${view.valuation("open")}`}
            />
          </FilterGroup>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16">
          <p className="text-3xl font-semibold tracking-tight">没有匹配的机构</p>
          <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
            试试别的类别、上市状态或估值，或清空条件。
          </p>
          <button
            type="button"
            className={cn(
              "mt-8 inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm text-background motion-safe:transition-opacity motion-safe:duration-200 hover:opacity-80",
              focusRing,
            )}
            onClick={reset}
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
                <p className="mb-6 max-w-xl text-sm leading-6 text-muted-foreground">{item.blurb}</p>
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
        <ul className="grid border-t border-border md:grid-cols-2 md:gap-x-16">
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

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2" role="group" aria-label={label}>
      <span className="mr-2 text-sm text-muted-foreground">{label}</span>
      {children}
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
  company: BoardCompany;
  showCategory?: boolean;
}) {
  const category = categories.find((item) => item.id === company.category);
  const kicker = [
    showCategory && category ? category.label : null,
    company.name !== company.nameEn ? company.nameEn : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
  const tagline =
    company.tagline && company.tagline !== company.blurb ? company.tagline : null;
  const products =
    company.products &&
    company.products !== company.blurb &&
    company.products !== company.tagline
      ? company.products
      : null;
  const meta = [
    company.hq || null,
    company.founded == null ? "成立年份未标注" : String(company.founded),
    listingLabel(company.listing),
    company.ticker ?? null,
    !company.website && company.domain && company.domain !== "未标注" ? company.domain : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" · ");

  return (
    <article className="border-b border-border py-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="min-w-0 text-lg font-medium tracking-tight">
          <Link href={`/companies/${company.slug}`} className={cn(focusRing, hoverFade)}>
            {company.name}
          </Link>
        </p>
      </div>
      {kicker ? <p className="mt-1 text-sm text-muted-foreground">{kicker}</p> : null}
      <p className="mt-3 text-sm leading-6">{company.blurb}</p>
      {tagline ? (
        <p className="mt-1 text-sm leading-6 text-muted-foreground">标语 · {tagline}</p>
      ) : null}
      {products ? (
        <p className="mt-1 text-sm leading-6 text-muted-foreground">产品 · {products}</p>
      ) : null}
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{meta}</p>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">估值</dt>
          <dd className="mt-1 text-sm">
            <Money value={company.valuation} />
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">累计融资</dt>
          <dd className="mt-1 text-sm">
            <Money value={company.funding} />
          </dd>
        </div>
      </dl>
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link
          href={`/companies/${company.slug}`}
          className={cn(
            "inline-flex min-h-11 items-center text-link underline-offset-4 hover:underline",
            focusRing,
          )}
        >
          档案
        </Link>
        {company.website ? (
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(
              "inline-flex min-h-11 items-center text-link underline-offset-4 hover:underline",
              focusRing,
            )}
          >
            官网
          </a>
        ) : null}
      </p>
    </article>
  );
}

function haystack(company: BoardCompany): string {
  return [company.name, company.nameEn, company.blurb, company.tagline, company.products, company.hq, company.ticker, company.domain]
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .toLowerCase();
}

type Filters = {
  category: CategoryFilter;
  listing: ListingFilter;
  valuation: ValueFilter;
};

function passes(company: BoardCompany, needle: string, filters: Filters): boolean {
  if (filters.category !== "all" && company.category !== filters.category) return false;
  if (filters.listing !== "all" && company.listing !== filters.listing) return false;
  if (!matchesValuation(company, filters.valuation)) return false;
  if (!needle) return true;
  return haystack(company).includes(needle);
}

function matchesValuation(company: BoardCompany, filter: ValueFilter): boolean {
  if (filter === "all") return true;
  if (filter === "reported") return company.valuation.status === "reported";
  if (filter === "mock") return company.valuation.status === "mock";
  return company.valuation.status === "undisclosed" || company.valuation.status === "pending";
}
