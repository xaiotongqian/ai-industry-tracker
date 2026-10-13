import { disclosedFundingTotal } from "@/data/funding";
import type { DataOrigin, FundingRound } from "@/data/types";
import { moneySortValue } from "@/lib/format";

export type FundingCompanyRef = {
  slug: string;
  name: string;
  nameEn: string;
};

export type FundingGlance = {
  count: number;
  mappedCount: number;
  excludedCount: number;
  totalUsd: number;
  summable: boolean;
  largest: FundingRound | null;
  latest: FundingRound | null;
};

export function glanceAtFunding(
  rounds: readonly FundingRound[],
  companies: readonly { slug: string }[],
): FundingGlance {
  const slugs = new Set(companies.map((company) => company.slug));
  let largest: FundingRound | null = null;
  let latest: FundingRound | null = null;
  let mappedCount = 0;
  let summableCount = 0;

  for (const round of rounds) {
    if (round.companySlug && slugs.has(round.companySlug)) mappedCount += 1;
    const usd = moneySortValue(round.amount);
    if (usd != null) {
      summableCount += 1;
      const best = largest ? moneySortValue(largest.amount) : null;
      const newerTie = usd === best && round.announcedOn > (largest?.announcedOn ?? "");
      if (best == null || usd > best || newerTie) largest = round;
    }
    if (!latest || round.announcedOn > latest.announcedOn) latest = round;
  }

  return {
    count: rounds.length,
    mappedCount,
    excludedCount: rounds.length - summableCount,
    totalUsd: disclosedFundingTotal(rounds),
    summable: summableCount > 0,
    largest,
    latest,
  };
}

export function companyLabel(
  round: FundingRound,
  bySlug: ReadonlyMap<string, { name: string }>,
): string {
  const mapped = round.companySlug ? bySlug.get(round.companySlug) : undefined;
  return mapped?.name || round.companyName?.trim() || "未知机构";
}

export function onMap(round: FundingRound, bySlug: ReadonlyMap<string, unknown>): boolean {
  return Boolean(round.companySlug && bySlug.has(round.companySlug));
}

export function investorBrief(round: FundingRound, origin: DataOrigin): string {
  const leads = round.leadInvestors ?? [];
  const leadSet = new Set(leads);
  const rest = round.investors.filter((name) => !leadSet.has(name));
  const parts: string[] = [];
  if (leads.length > 0) parts.push(`领投 ${joinInvestors(leads)}`);
  if (rest.length > 0) {
    parts.push(`${leads.length > 0 ? "跟投" : "投资人"} ${joinInvestors(rest)}`);
  }
  if (parts.length === 0) parts.push("投资人未披露");
  const text = parts.join(" · ");
  return origin === "demo" ? `示意 · ${text}` : text;
}

/** Full investor line when the brief had to shorten a list. */
export function investorDetail(round: FundingRound): string | null {
  const leads = round.leadInvestors ?? [];
  const leadSet = new Set(leads);
  const rest = round.investors.filter((name) => !leadSet.has(name));
  if (leads.length <= 4 && rest.length <= 4) return null;
  const parts: string[] = [];
  if (leads.length > 0) parts.push(`领投 ${leads.join("、")}`);
  if (rest.length > 0) parts.push(`${leads.length > 0 ? "跟投" : "投资人"} ${rest.join("、")}`);
  return parts.join(" · ");
}

function joinInvestors(names: string[]): string {
  if (names.length <= 4) return names.join("、");
  return `${names.slice(0, 3).join("、")} 等 ${names.length} 家`;
}
