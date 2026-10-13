import { cacheLife } from "next/cache";
import { rounds as demoRounds } from "@/data/funding";
import {
  SAMPLE_AS_OF,
  type Company,
  type FundingEvidence,
  type FundingPayload,
  type FundingRound,
  type MoneyPlaceholder,
} from "@/data/types";
import { loadCompanies } from "@/lib/ingest/companies";
import { fetchText } from "@/lib/ingest/http";
import { buildNameIndex } from "@/lib/ingest/match";
import { safeHttpUrl } from "@/lib/ingest/text";
import { formatUsd } from "@/lib/format";

const AI_FUNDING_URL = "https://aifunding.me/api/v1/rounds?limit=30";
const DATA_CUBE_URL =
  "https://api-production-3ee5.up.railway.app/api/deals?deal_type=funding&limit=30";

type AiFundingInvestor = { name?: string; isLead?: boolean };

type AiFundingRow = {
  companySlug?: string;
  companyName?: string;
  amount?: number | null;
  currency?: string | null;
  valuation?: number | null;
  stage?: string | null;
  date?: string | null;
  investors?: AiFundingInvestor[];
  companyProfileUrl?: string | null;
};

type CubeDeal = {
  id?: number;
  company?: string;
  round?: string | null;
  roundCategory?: string | null;
  amountRaw?: string | null;
  amountValue?: number | null;
  currency?: string | null;
  investors?: unknown;
  announcedDate?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  hasEvidence?: boolean;
  status?: string | null;
  valuationRaw?: string | null;
  weekId?: string | null;
};

type FetchedRounds = {
  rounds: FundingRound[];
  sourceTotal: number | null;
};

export async function loadFunding(): Promise<FundingPayload> {
  "use cache";
  cacheLife("funding");

  try {
    const companies = await loadCompanies();
    const fromTracker = await fetchAiFunding(companies.items);
    if (fromTracker && fromTracker.rounds.length > 0) {
      return {
        items: byDate(fromTracker.rounds),
        origin: "live",
        sourceName: "AI Funding Tracker",
        sourceHref: "https://aifunding.me/api-docs",
        fetchedAt: new Date().toISOString(),
        sourceTotal: fromTracker.sourceTotal,
        note: "来自 aifunding.me 的公开轮次。美元金额和美元估值按原值显示，其他币种不换算。领投只在源标明时写出。",
      };
    }
    const fromCube = await fetchDataCube(companies.items);
    if (fromCube && fromCube.rounds.length > 0) {
      return {
        items: byDate(fromCube.rounds),
        origin: "live",
        sourceName: "AI Funding Tracker",
        sourceHref: "https://www.datacubeai.space/funding",
        fetchedAt: new Date().toISOString(),
        sourceTotal: fromCube.sourceTotal,
        note: "aifunding.me 这一轮没有匿名可读的数据。列表改用 Data Cube 融资页公开的 JSON：最近的融资，不含并购。美元金额才计入合计，估值按原文显示。证据摘录不转载。",
      };
    }
  } catch {
    // Fall through to the fixture ledger.
  }
  return demoFunding("公开融资接口这一轮没有拿到，下面仍是示意轮次。其中含未入地图和未换算的例子。");
}

function demoFunding(note: string): FundingPayload {
  return {
    items: byDate(demoRounds),
    origin: "demo",
    sourceName: "AI纵横示意轮次",
    fetchedAt: SAMPLE_AS_OF,
    sourceTotal: null,
    note,
  };
}

async function fetchAiFunding(companies: Company[]): Promise<FetchedRounds | null> {
  try {
    const payload = JSON.parse(await fetchText(AI_FUNDING_URL, 8_000)) as {
      data?: AiFundingRow[];
      meta?: { total?: number };
    };
    if (!Array.isArray(payload.data)) return null;
    const slugs = new Set(companies.map((company) => company.slug));
    const index = buildNameIndex(companies);
    const rounds: FundingRound[] = [];
    for (const row of payload.data) {
      const announcedOn = dateOnly(row.date);
      const companyName = (row.companyName ?? "").trim();
      if (!announcedOn || !companyName) continue;
      const companySlug =
        (row.companySlug && slugs.has(row.companySlug) ? row.companySlug : null) ??
        index.exact(companyName);
      const investors = trackerInvestors(row.investors);
      const profileUrl = safeHttpUrl(row.companyProfileUrl);
      rounds.push({
        id: `af-${announcedOn}-${companySlug ?? companyName}-${rounds.length}`,
        companySlug,
        companyName,
        round: roundLabel(row.stage),
        amount: usdAmount(row.amount, row.currency, null),
        valuationLabel: valuationFromNumber(row.valuation, row.currency),
        announcedOn,
        investors: investors.investors,
        leadInvestors: investors.leadInvestors,
        profileUrl: profileUrl ?? undefined,
      });
    }
    return { rounds, sourceTotal: finiteTotal(payload.meta?.total) };
  } catch {
    return null;
  }
}

async function fetchDataCube(companies: Company[]): Promise<FetchedRounds | null> {
  try {
    const payload = JSON.parse(await fetchText(DATA_CUBE_URL, 15_000)) as {
      total?: number;
      deals?: CubeDeal[];
    };
    if (!Array.isArray(payload.deals)) return null;
    const index = buildNameIndex(companies);
    const rounds: FundingRound[] = [];
    for (const deal of payload.deals) {
      const companyName = (deal.company ?? "").trim();
      const announcedOn = dateOnly(deal.announcedDate);
      if (!companyName || !announcedOn || deal.id == null) continue;
      const sourceUrl = safeHttpUrl(deal.sourceUrl);
      const round = roundLabel(deal.round || deal.roundCategory);
      const category = roundLabel(deal.roundCategory);
      const unverified = deal.status === "legacy_unverified" || deal.hasEvidence === false;
      const amount = unverified
        ? { status: "undisclosed" as const }
        : usdAmount(deal.amountValue, deal.currency, deal.amountRaw);
      const amountLabel =
        amount.status === "reported" ? shortText(deal.amountRaw) : undefined;
      const weekId = shortText(deal.weekId, 32);
      rounds.push({
        id: `dc-${deal.id}`,
        companySlug: index.exact(companyName),
        companyName,
        round,
        roundCategory: category !== round && category !== "轮次未披露" ? category : undefined,
        amount,
        amountLabel,
        valuationLabel: cleanValuation(deal.valuationRaw),
        announcedOn,
        investors: investorNames(deal.investors),
        sourceUrl: sourceUrl ?? undefined,
        sourceName: shortText(deal.sourceName),
        evidence: evidenceOf(deal, unverified),
        weekId: weekId && weekId !== announcedOn ? weekId : undefined,
      });
    }
    return { rounds, sourceTotal: finiteTotal(payload.total) };
  } catch {
    return null;
  }
}

function evidenceOf(deal: CubeDeal, unverified: boolean): FundingEvidence | undefined {
  if (unverified) return "unverified";
  if (deal.hasEvidence === true) return "gated";
  return undefined;
}

function usdAmount(
  amount: number | null | undefined,
  currency: string | null | undefined,
  raw: string | null | undefined,
): MoneyPlaceholder {
  const code = (currency ?? "").trim().toUpperCase();
  const rawText = (raw ?? "").trim();
  if (typeof amount === "number" && Number.isFinite(amount) && amount > 0 && code === "USD") {
    return { status: "reported", usd: Math.round(amount) };
  }
  if (!code && rawText.startsWith("$") && typeof amount === "number" && amount > 0) {
    return { status: "reported", usd: Math.round(amount) };
  }
  if (code && code !== "USD" && (rawText || (typeof amount === "number" && amount > 0))) {
    const label = rawText || `${amount} ${code}`;
    return { status: "pending", reason: `公开报道 ${label}（${code}，未换算）` };
  }
  return { status: "undisclosed" };
}

function valuationFromNumber(
  amount: number | null | undefined,
  currency: string | null | undefined,
): string | undefined {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return undefined;
  const code = (currency ?? "").trim().toUpperCase();
  if (code === "USD") return formatUsd(Math.round(amount));
  if (!code) return undefined;
  return `${amount.toLocaleString("en-US")} ${code}（未换算）`;
}

function cleanValuation(raw: string | null | undefined): string | undefined {
  const text = shortText(raw);
  if (!text) return undefined;
  if (/^(undisclosed|unknown|n\/a|na|none|not disclosed|null|未披露|—|--|-)$/i.test(text)) {
    return undefined;
  }
  return text;
}

function investorNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const names: string[] = [];
  for (const item of value) {
    if (typeof item === "string" && isNamedInvestor(item)) pushUnique(names, item.trim());
    else if (item && typeof item === "object" && "name" in item) {
      const name = (item as { name?: unknown }).name;
      if (typeof name === "string" && isNamedInvestor(name)) pushUnique(names, name.trim());
    }
  }
  return names;
}

function trackerInvestors(rows: AiFundingInvestor[] | undefined): {
  investors: string[];
  leadInvestors?: string[];
} {
  const investors: string[] = [];
  const leads: string[] = [];
  for (const row of rows ?? []) {
    const name = row.name?.trim() ?? "";
    if (!isNamedInvestor(name)) continue;
    pushUnique(investors, name);
    if (row.isLead === true) pushUnique(leads, name);
  }
  return { investors, leadInvestors: leads.length > 0 ? leads : undefined };
}

function pushUnique(names: string[], name: string) {
  if (!names.some((item) => item.toLowerCase() === name.toLowerCase())) names.push(name);
}

function isNamedInvestor(value: string): boolean {
  const name = value.trim();
  if (!name) return false;
  return !/^(undisclosed|unknown|n\/a|na|none|not disclosed|未披露)$/i.test(name);
}

function roundLabel(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "轮次未披露";
  const key = raw.toLowerCase().replace(/\s+/g, " ");
  const mapped: Record<string, string> = {
    "pre-seed": "Pre-Seed",
    preseed: "Pre-Seed",
    seed: "种子轮",
    "seed and series a": "种子轮与 A 轮",
    angel: "天使轮",
    "series a": "A 轮",
    "series b": "B 轮",
    "series c": "C 轮",
    "series d": "D 轮",
    "series e": "E 轮",
    "series f": "F 轮",
    "series g": "G 轮",
    "series a extension": "A 轮延伸",
    "series b extension": "B 轮延伸",
    "series c extension": "C 轮延伸",
    "series unknown": "轮次未披露",
    undisclosed: "轮次未披露",
    unknown: "轮次未披露",
    "nicht angegeben": "轮次未披露",
    growth: "成长期",
    "late stage": "后期轮",
    "late/pe": "后期",
    early: "早期",
    "series c+": "C 轮及以后",
    fund: "基金",
    debt: "债务融资",
    strategic: "战略融资",
  };
  return mapped[key] ?? raw;
}

function dateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function finiteTotal(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
}

function shortText(value: string | null | undefined, max = 80): string | undefined {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (!text || text.length > max) return undefined;
  return text;
}

function byDate(items: readonly FundingRound[]): FundingRound[] {
  return [...items].sort(
    (a, b) => b.announcedOn.localeCompare(a.announcedOn) || a.id.localeCompare(b.id),
  );
}
