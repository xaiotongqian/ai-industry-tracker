import { cacheLife } from "next/cache";
import { rounds as demoRounds } from "@/data/funding";
import {
  SAMPLE_AS_OF,
  type Company,
  type FundingRound,
  type Loaded,
  type MoneyPlaceholder,
} from "@/data/types";
import { fetchText } from "@/lib/ingest/http";
import { loadCompanies } from "@/lib/ingest/companies";
import { buildNameIndex } from "@/lib/ingest/match";
import { safeHttpUrl } from "@/lib/ingest/text";

const AI_FUNDING_URL = "https://aifunding.me/api/v1/rounds?limit=30";
const DATA_CUBE_URL =
  "https://api-production-3ee5.up.railway.app/api/deals?deal_type=funding&limit=30";

type AiFundingRow = {
  companySlug?: string;
  companyName?: string;
  amount?: number | null;
  currency?: string | null;
  stage?: string | null;
  date?: string | null;
  investors?: { name?: string }[];
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
};

export async function loadFunding(): Promise<Loaded<FundingRound>> {
  "use cache";
  cacheLife("funding");

  try {
    const companies = await loadCompanies();
    const fromTracker = await fetchAiFunding(companies.items);
    if (fromTracker && fromTracker.length > 0) {
      return {
        items: fromTracker,
        origin: "live",
        sourceName: "AI Funding Tracker",
        sourceHref: "https://aifunding.me/api-docs",
        fetchedAt: new Date().toISOString(),
        note: "来自 aifunding.me 的公开轮次。金额只在币种为美元时直接显示，其他币种不换算。",
      };
    }
    const fromCube = await fetchDataCube(companies.items);
    if (fromCube && fromCube.length > 0) {
      return {
        items: fromCube,
        origin: "live",
        sourceName: "AI Funding Tracker",
        sourceHref: "https://www.datacubeai.space/funding",
        fetchedAt: new Date().toISOString(),
        note: "aifunding.me 没有匿名可读的数据（此环境为 403）。列表改用 Data Cube 融资页公开的 JSON：最近的融资，不含并购。美元金额才计入合计，证据摘录不转载。",
      };
    }
  } catch {
    // Fall through to the fixture ledger.
  }
  return demoFunding("公开融资接口这一轮没有拿到，下面仍是示意轮次。");
}

function demoFunding(note: string): Loaded<FundingRound> {
  return {
    items: demoRounds,
    origin: "demo",
    sourceName: "纬图示意轮次",
    fetchedAt: SAMPLE_AS_OF,
    note,
  };
}

async function fetchAiFunding(companies: Company[]): Promise<FundingRound[] | null> {
  try {
    const payload = JSON.parse(await fetchText(AI_FUNDING_URL, 8_000)) as {
      data?: AiFundingRow[];
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
      rounds.push({
        id: `af-${announcedOn}-${companySlug ?? companyName}`,
        companySlug,
        companyName,
        round: roundLabel(row.stage),
        amount: usdAmount(row.amount, row.currency, null),
        announcedOn,
        investors: (row.investors ?? [])
          .map((investor) => investor.name?.trim() ?? "")
          .filter(Boolean),
      });
    }
    return rounds;
  } catch {
    return null;
  }
}

async function fetchDataCube(companies: Company[]): Promise<FundingRound[] | null> {
  try {
    const payload = JSON.parse(await fetchText(DATA_CUBE_URL, 15_000)) as {
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
      rounds.push({
        id: `dc-${deal.id}`,
        companySlug: index.exact(companyName),
        companyName,
        round: roundLabel(deal.round || deal.roundCategory),
        amount:
          deal.hasEvidence === false
            ? { status: "undisclosed" }
            : usdAmount(deal.amountValue, deal.currency, deal.amountRaw),
        announcedOn,
        investors: investorNames(deal.investors),
        sourceUrl: sourceUrl ?? undefined,
        sourceName: deal.sourceName?.trim() || undefined,
      });
    }
    return rounds;
  } catch {
    return null;
  }
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

function investorNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const names: string[] = [];
  for (const item of value) {
    if (typeof item === "string" && item.trim()) names.push(item.trim());
    else if (item && typeof item === "object" && "name" in item) {
      const name = (item as { name?: unknown }).name;
      if (typeof name === "string" && name.trim()) names.push(name.trim());
    }
  }
  return names;
}

function roundLabel(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "轮次未披露";
  const mapped: Record<string, string> = {
    "pre-seed": "Pre-Seed",
    preseed: "Pre-Seed",
    seed: "种子轮",
    "series a": "A 轮",
    "series b": "B 轮",
    "series c": "C 轮",
    "series d": "D 轮",
    "series e": "E 轮",
    "series f": "F 轮",
    growth: "成长期",
    "late stage": "后期轮",
  };
  return mapped[raw.toLowerCase()] ?? raw;
}

function dateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}
