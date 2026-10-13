"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyNote } from "@/components/empty-note";
import { Money } from "@/components/money";
import type { DataOrigin, FundingRound, MoneyPlaceholder } from "@/data/types";
import { formatDate, moneySortValue } from "@/lib/format";
import {
  investorBrief,
  investorDetail,
  onMap,
  type FundingCompanyRef,
} from "@/lib/funding-stats";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

type ScopeFilter = "all" | "mapped" | "unmapped";
type AmountFilter = "all" | "summable" | "pending" | "undisclosed";

const scopeOptions: { id: ScopeFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "mapped", label: "已入地图" },
  { id: "unmapped", label: "未入地图" },
];

export function FundingLedger({
  rounds,
  companies,
  origin,
}: {
  rounds: FundingRound[];
  companies: FundingCompanyRef[];
  origin: DataOrigin;
}) {
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [amount, setAmount] = useState<AmountFilter>("all");
  const bySlug = useMemo(
    () => new Map(companies.map((company) => [company.slug, company])),
    [companies],
  );
  const amountOptions = useMemo(
    () => [
      { id: "all" as const, label: "全部金额" },
      { id: "summable" as const, label: origin === "demo" ? "示意金额" : "已披露美元" },
      { id: "pending" as const, label: "未换算" },
      { id: "undisclosed" as const, label: "未披露" },
    ],
    [origin],
  );

  const filtered = useMemo(() => {
    const next = rounds.filter((round) => {
      const mapped = onMap(round, bySlug);
      if (scope === "mapped" && !mapped) return false;
      if (scope === "unmapped" && mapped) return false;
      if (amount === "summable" && moneySortValue(round.amount) == null) return false;
      if (amount === "pending" && round.amount.status !== "pending") return false;
      if (amount === "undisclosed" && round.amount.status !== "undisclosed") return false;
      return true;
    });
    next.sort(
      (a, b) => b.announcedOn.localeCompare(a.announcedOn) || a.id.localeCompare(b.id),
    );
    return next;
  }, [amount, bySlug, rounds, scope]);

  const groups = useMemo(() => groupByMonth(filtered), [filtered]);
  const filtering = scope !== "all" || amount !== "all";

  if (rounds.length === 0) {
    return <EmptyNote>这一轮没有轮次。</EmptyNote>;
  }

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm leading-6 text-muted-foreground">
        可按是否已入地图、以及金额状态筛选。日期新的在前。
      </p>
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="按地图筛选">
        {scopeOptions.map((option) => (
          <FilterButton
            key={option.id}
            active={scope === option.id}
            label={option.label}
            onClick={() => setScope(option.id)}
          />
        ))}
      </div>
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="按金额筛选">
        {amountOptions.map((option) => (
          <FilterButton
            key={option.id}
            active={amount === option.id}
            label={option.label}
            onClick={() => setAmount(option.id)}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {filtering ? `显示 ${filtered.length} / ${rounds.length}` : `共 ${rounds.length} 笔`}
      </p>
      {filtering ? (
        <p className="mb-6 text-sm text-muted-foreground">
          显示 {filtered.length} / {rounds.length}
        </p>
      ) : null}
      {filtered.length === 0 ? (
        <EmptyNote>这个筛选下没有轮次。</EmptyNote>
      ) : (
        groups.map((group, index) => (
          <section key={group.key}>
            {groups.length > 1 ? (
              <p className={index === 0 ? "text-sm text-muted-foreground" : "pt-8 text-sm text-muted-foreground"}>
                {group.label}
              </p>
            ) : null}
            <ol className="border-t border-border">
              {group.items.map((round) => (
                <RoundRow key={round.id} round={round} company={bySlug.get(round.companySlug ?? "")} origin={origin} />
              ))}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}

function RoundRow({
  round,
  company,
  origin,
}: {
  round: FundingRound;
  company: FundingCompanyRef | undefined;
  origin: DataOrigin;
}) {
  const name = company?.name || round.companyName?.trim() || "未知机构";
  const english = company && company.name !== company.nameEn ? company.nameEn : null;
  const roundKnown = round.round !== "轮次未披露";

  return (
    <li className="border-b border-border py-7">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h2 className="text-2xl font-medium tracking-tight">
            {company ? (
              <Link href={`/companies/${company.slug}`} className={cn(focusRing, hoverFade)}>
                {name}
              </Link>
            ) : (
              name
            )}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            <time dateTime={round.announcedOn}>{formatDate(round.announcedOn)}</time>
            <span aria-hidden> · </span>
            <span className={roundKnown ? "text-foreground" : undefined}>{round.round}</span>
            {round.roundCategory ? (
              <>
                <span aria-hidden> · </span>
                {round.roundCategory}
              </>
            ) : null}
            {english ? (
              <>
                <span aria-hidden> · </span>
                {english}
              </>
            ) : null}
            {!company ? (
              <>
                <span aria-hidden> · </span>
                未入地图
              </>
            ) : null}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{investorBrief(round, origin)}</p>
          <ProfileLink url={round.profileUrl} />
          {round.amount.status === "pending" ? (
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{round.amount.reason}</p>
          ) : null}
          <SourceLine round={round} />
        </div>
        <AmountBlock amount={round.amount} origin={origin} />
      </div>
      <RoundDetails round={round} />
    </li>
  );
}

function AmountBlock({ amount, origin }: { amount: MoneyPlaceholder; origin: DataOrigin }) {
  return (
    <div className="shrink-0 text-right">
      {amount.status === "pending" ? (
        <p className="text-xl tracking-tight">未换算</p>
      ) : (
        <p className="text-xl">
          <Money value={amount} />
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{amountHint(amount, origin)}</p>
    </div>
  );
}

function amountHint(amount: MoneyPlaceholder, origin: DataOrigin): string {
  if (amount.status === "reported") return "已披露";
  if (amount.status === "mock") return "计入示意合计";
  return origin === "demo" ? "示意 · 不计入合计" : "不计入合计";
}

function ProfileLink({ url }: { url: string | undefined }) {
  if (!url) return null;
  return (
    <p className="mt-1 text-sm leading-6">
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className={cn("text-link underline-offset-4 hover:underline", focusRing)}
      >
        源站公司页
      </a>
    </p>
  );
}

function SourceLine({ round }: { round: FundingRound }) {
  if (!round.sourceUrl && !round.sourceName) return null;
  const label = round.sourceName || "来源";
  return (
    <p className="mt-1 text-sm leading-6 text-muted-foreground">
      {round.sourceUrl ? (
        <a
          href={round.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className={cn("text-link underline-offset-4 hover:underline", focusRing)}
        >
          {label}
        </a>
      ) : (
        label
      )}
    </p>
  );
}

function RoundDetails({ round }: { round: FundingRound }) {
  const investors = investorDetail(round);
  const evidence =
    round.evidence === "gated"
      ? "证据已核。金额采用通过证据门的结构化字段，摘录不转载。"
      : round.evidence === "unverified"
        ? "未经证据门。这一笔的金额不采用。"
        : null;
  if (!round.valuationLabel && !round.amountLabel && !evidence && !round.weekId && !investors) {
    return null;
  }

  return (
    <details className="group mt-3 max-w-xl">
      <summary
        className={cn(
          "cursor-pointer list-none text-sm text-link [&::-webkit-details-marker]:hidden",
          focusRing,
        )}
      >
        <span className="group-open:hidden">展开详情</span>
        <span className="hidden group-open:inline">收起详情</span>
      </summary>
      <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
        {round.amountLabel ? <p>金额原文 {round.amountLabel}。</p> : null}
        {round.valuationLabel ? (
          <p>估值原文 {round.valuationLabel}。不换算，不计入美元合计。</p>
        ) : null}
        {evidence ? <p>{evidence}</p> : null}
        {investors ? <p>{investors}</p> : null}
        {round.weekId ? <p>源内周次 {round.weekId}</p> : null}
      </div>
    </details>
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

function groupByMonth(rounds: readonly FundingRound[]) {
  const groups: { key: string; label: string; items: FundingRound[] }[] = [];
  for (const round of rounds) {
    const key = round.announcedOn.slice(0, 7);
    const last = groups[groups.length - 1];
    if (!last || last.key !== key) {
      groups.push({ key, label: monthLabel(key), items: [round] });
    } else {
      last.items.push(round);
    }
  }
  return groups;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  if (!year || !month) return key;
  return `${year}年${Number(month)}月`;
}
