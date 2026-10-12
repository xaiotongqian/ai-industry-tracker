import { cacheLife } from "next/cache";
import { companies as editorial } from "@/data/companies";
import { SAMPLE_AS_OF, type CategoryId, type Company, type Loaded } from "@/data/types";
import { fetchText } from "@/lib/ingest/http";
import { lookupExact, rememberCompany } from "@/lib/ingest/match";
import {
  clip,
  hostname,
  nameKeys,
  parseReportedValuation,
  safeHttpUrl,
  slugify,
} from "@/lib/ingest/text";

const FUTUREX_URL = "https://futurex.capital/api/public/ai-companies";
const YC_URL = "https://yc-oss.github.io/api/companies/all.json";
const TARGET = 200;

const SECTOR: Record<string, CategoryId> = {
  "foundation-models": "foundation",
  "ai-chips": "silicon",
  "ai-hardware": "silicon",
  "ai-agents": "agents",
  "ai-coding": "agents",
  "ai-search": "agents",
  "ai-enterprise": "vertical",
  "ai-healthcare": "vertical",
  "ai-finance-legal": "vertical",
  "ai-image-creative": "vertical",
  "ai-video": "vertical",
  robotics: "vertical",
  "autonomous-driving": "vertical",
  "ai-biotech": "vertical",
  "ai-education": "vertical",
};

const COUNTRY: Record<string, string> = {
  US: "美国",
  CN: "中国",
  UK: "英国",
  CA: "加拿大",
  FR: "法国",
  NO: "挪威",
  DE: "德国",
  HK: "中国香港",
  IL: "以色列",
  SG: "新加坡",
  JP: "日本",
  KR: "韩国",
  IN: "印度",
  AU: "澳大利亚",
  SE: "瑞典",
  NL: "荷兰",
  CH: "瑞士",
  AE: "阿联酋",
  TW: "中国台湾",
};

type FuturexCompany = {
  nameZh?: string;
  nameEn?: string;
  sectorSlug?: string;
  country?: string;
  founded?: string | null;
  reportedValuation?: string | null;
  isPubliclyListed?: boolean;
  website?: string;
  tagline?: string;
  keyProducts?: string;
};

type YcCompany = {
  name?: string;
  slug?: string;
  website?: string | null;
  one_liner?: string | null;
  all_locations?: string | null;
  launched_at?: number | null;
  tags?: string[];
  top_company?: boolean;
  status?: string;
  industry?: string;
  subindustry?: string;
};

const YC_TAGS = new Set(["AI", "Generative AI", "Machine Learning"]);

export async function loadCompanies(): Promise<Loaded<Company>> {
  "use cache";
  cacheLife("weekly");

  try {
    return await loadCompaniesUncached();
  } catch {
    return demoCompanies("公开名单这一轮没有拿到，地图仍是编辑样本。");
  }
}

async function loadCompaniesUncached(): Promise<Loaded<Company>> {
  const merged = editorial.map((company) => ({ ...company }));
  const used = new Set(merged.map((company) => company.slug));
  const exact = new Map<string, string>();
  for (const company of merged) rememberCompany(company, exact);

  let futurexOk = false;
  let futurexAdded = 0;
  let futurexUpdated = 0;
  try {
    const payload = JSON.parse(await fetchText(FUTUREX_URL, 15_000)) as {
      companies?: FuturexCompany[];
    };
    if (Array.isArray(payload.companies)) {
      futurexOk = true;
      for (const row of payload.companies) {
        const result = applyFuturex(row, merged, used, exact);
        if (result === "added") futurexAdded += 1;
        if (result === "updated") futurexUpdated += 1;
      }
    }
  } catch {
    futurexOk = false;
  }

  let ycAdded = 0;
  if (merged.length < TARGET) {
    try {
      const payload = JSON.parse(await fetchText(YC_URL, 25_000)) as unknown;
      if (Array.isArray(payload)) {
        const candidates = (payload as YcCompany[])
          .filter(ycEligible)
          .sort((a, b) => {
            if (Boolean(a.top_company) !== Boolean(b.top_company)) {
              return a.top_company ? -1 : 1;
            }
            return (b.launched_at ?? 0) - (a.launched_at ?? 0);
          });
        for (const row of candidates) {
          if (merged.length >= TARGET) break;
          if (addYc(row, merged, used, exact)) ycAdded += 1;
        }
      }
    } catch {
      // YC is only a top-up. A failed download keeps the FutureX merge.
    }
  }

  if (!futurexOk && ycAdded === 0) {
    return demoCompanies("FutureX 和 YC 公开名单这一轮都没有拿到，地图仍是编辑样本。");
  }

  const parts = [
    `共 ${merged.length} 家。`,
    futurexOk
      ? `FutureX 新写入 ${futurexAdded} 家，并更新了 ${futurexUpdated} 家已有机构的公开估值。`
      : "FutureX 这一轮没拿到，已有机构的估值仍是示意。",
    ycAdded > 0
      ? `YC 公开名单补了 ${ycAdded} 家，分类是纬图归的，融资和估值未接入。`
      : merged.length < TARGET
        ? `还没有补到 ${TARGET} 家。`
        : "没有再用 YC 补位。",
    "FutureX 数据按 CC BY 4.0 使用，署名：FutureX Capital 天际资本。",
  ];

  return {
    items: merged,
    origin: "live",
    sourceName: futurexOk ? "FutureX Capital" : "YC 公开名单",
    sourceHref: futurexOk
      ? "https://futurex.capital/data"
      : "https://yc-oss.github.io/api/companies/all.json",
    fetchedAt: new Date().toISOString(),
    note: parts.join(""),
  };
}

function demoCompanies(note: string): Loaded<Company> {
  return {
    items: editorial.map((company) => ({ ...company })),
    origin: "demo",
    sourceName: "纬图示意样本",
    fetchedAt: SAMPLE_AS_OF,
    note,
  };
}

function applyFuturex(
  row: FuturexCompany,
  merged: Company[],
  used: Set<string>,
  exact: Map<string, string>,
): "added" | "updated" | "skipped" {
  const nameZh = (row.nameZh ?? "").trim();
  const nameEn = (row.nameEn ?? "").trim();
  if (!nameZh && !nameEn) return "skipped";
  const money = parseReportedValuation(row.reportedValuation);
  const existingSlug =
    lookupExact(nameEn, exact) ??
    lookupExact(nameZh, exact) ??
    lookupExact(hostStem(row.website), exact);
  if (existingSlug) {
    const target = merged.find((company) => company.slug === existingSlug);
    if (!target) return "skipped";
    let updated = false;
    if (money.status === "reported" || money.status === "pending") {
      target.valuation = money;
      updated = true;
    }
    const website = safeHttpUrl(row.website);
    if (website && !target.website) {
      target.website = website;
      updated = true;
    }
    return updated ? "updated" : "skipped";
  }

  const slug = uniqueSlug(slugify(nameEn || nameZh), used);
  const website = safeHttpUrl(row.website);
  const company: Company = {
    slug,
    name: nameZh || nameEn,
    nameEn: nameEn || nameZh,
    category: SECTOR[row.sectorSlug ?? ""] ?? "vertical",
    blurb: futurexBlurb(row),
    founded: parseYear(row.founded),
    hq: COUNTRY[row.country ?? ""] ?? (row.country?.trim() || "未标注"),
    listing: row.isPubliclyListed ? "public" : "private",
    domain: hostname(website) || "未标注",
    website: website ?? undefined,
    profileNote:
      "来自 FutureX Capital 公开数据集（CC BY 4.0）。赛道映射到纬图的六类，累计融资没有公开总额。",
    funding: { status: "undisclosed" },
    valuation: money,
  };
  merged.push(company);
  used.add(slug);
  rememberCompany(company, exact);
  const stem = hostStem(row.website);
  if (stem) {
    for (const key of nameKeys(stem)) {
      if (!exact.has(key)) exact.set(key, slug);
    }
  }
  return "added";
}

function addYc(
  row: YcCompany,
  merged: Company[],
  used: Set<string>,
  exact: Map<string, string>,
): boolean {
  const name = (row.name ?? "").trim();
  if (!name) return false;
  if (lookupExact(name, exact) || lookupExact(hostStem(row.website), exact)) return false;
  const slug = uniqueSlug(slugify(row.slug || name), used);
  const website = safeHttpUrl(row.website);
  const location = (row.all_locations ?? "").split(";")[0]?.trim();
  const company: Company = {
    slug,
    name,
    nameEn: name,
    category: ycCategory(row),
    blurb: clip((row.one_liner ?? "").trim(), 140) || "YC 公开名单没有一句话简介。",
    founded: yearFromUnix(row.launched_at),
    hq: location || "未标注",
    listing: row.status === "Public" ? "public" : "private",
    domain: hostname(website) || "未标注",
    website: website ?? undefined,
    profileNote: "来自 YC 公开公司名单。分类是纬图按标签归的，融资和估值没有接入。",
    funding: { status: "undisclosed" },
    valuation: { status: "undisclosed" },
  };
  merged.push(company);
  used.add(slug);
  rememberCompany(company, exact);
  return true;
}

function ycEligible(row: YcCompany): boolean {
  if (row.status !== "Active" && row.status !== "Public") return false;
  return (row.tags ?? []).some((tag) => YC_TAGS.has(tag));
}

function ycCategory(row: YcCompany): CategoryId {
  const tags = (row.tags ?? []).join(" ").toLowerCase();
  const industry = `${row.industry ?? ""} ${row.subindustry ?? ""}`.toLowerCase();
  const line = (row.one_liner ?? "").toLowerCase();
  const blob = `${tags} ${industry} ${line}`;
  if (/semiconductor|gpu|chip/.test(blob)) return "silicon";
  if (/robot/.test(tags)) return "vertical";
  if (/health|bio|fintech|legal|educat|video|image/.test(blob)) return "vertical";
  if (/infrastructure|developer tools|devtools/.test(industry)) return "infra";
  if (/agent/.test(blob)) return "agents";
  if (/generative ai/.test(tags) && /model|llm|foundation/.test(line)) return "foundation";
  if (/machine learning|generative ai/.test(tags)) return "agents";
  return "vertical";
}

function futurexBlurb(row: FuturexCompany): string {
  const tagline = (row.tagline ?? "").trim();
  const products = (row.keyProducts ?? "").trim();
  if (tagline && products) return clip(`${tagline} 主要产品：${products}`, 140);
  return tagline || products || "FutureX 公开名单中的机构。";
}

function parseYear(value: string | null | undefined): number | null {
  if (!value || !/^\d{4}$/.test(value)) return null;
  const year = Number(value);
  if (year < 1950 || year > 2027) return null;
  return year;
}

function yearFromUnix(seconds: number | null | undefined): number | null {
  if (!seconds) return null;
  const year = new Date(seconds * 1000).getUTCFullYear();
  if (year < 1950 || year > 2027) return null;
  return year;
}

function hostStem(website: string | null | undefined): string {
  const host = hostname(website);
  const parts = host.split(".").filter(Boolean);
  if (parts.length < 2) return "";
  return parts.slice(0, -1).join(" ");
}

function uniqueSlug(base: string, used: Set<string>): string {
  const root = base || "org";
  if (!used.has(root)) return root;
  let index = 2;
  while (used.has(`${root}-${index}`)) index += 1;
  return `${root}-${index}`;
}
