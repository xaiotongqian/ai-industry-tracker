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
  plainText,
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
  ticker?: string;
  sectorEn?: string;
};

type YcCompany = {
  name?: string;
  slug?: string;
  website?: string | null;
  one_liner?: string | null;
  long_description?: string | null;
  all_locations?: string | null;
  launched_at?: number | null;
  tags?: string[];
  top_company?: boolean;
  status?: string;
  industry?: string;
  subindustry?: string;
  team_size?: number | null;
  batch?: string | null;
  stage?: string | null;
  url?: string | null;
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
      ? `FutureX 新写入 ${futurexAdded} 家，并给 ${futurexUpdated} 家已有机构补了公开估值、官网、标语或产品（不改简介和类别）。`
      : "FutureX 这一轮没拿到，已有机构的估值仍是示意。",
    ycAdded > 0
      ? `YC 公开名单补了 ${ycAdded} 家。分类是AI纵横归的，介绍用名单原文，融资和估值未接入。`
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
    sourceName: "AI纵横示意样本",
    fetchedAt: SAMPLE_AS_OF,
    note,
  };
}

function isProductLine(nameZh: string, nameEn: string, companies: Company[]): boolean {
  const labels = [nameZh, nameEn].filter(Boolean).map((label) => label.toLowerCase());
  for (const company of companies) {
    for (const base of [company.name, company.nameEn]) {
      if (base.length < 4) continue;
      const prefix = `${base.toLowerCase()} `;
      if (labels.some((label) => label.startsWith(prefix))) return true;
    }
  }
  return false;
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
  if (!existingSlug && isProductLine(nameZh, nameEn, merged)) return "skipped";
  if (existingSlug) {
    const target = merged.find((company) => company.slug === existingSlug);
    if (!target) return "skipped";
    const updated = attachFuturex(target, row, money);
    return updated ? "updated" : "skipped";
  }

  const slug = uniqueSlug(slugify(nameEn || nameZh), used);
  const website = safeHttpUrl(row.website);
  const tagline = cleanLine(row.tagline);
  const products = cleanLine(row.keyProducts);
  const company: Company = {
    slug,
    name: nameZh || nameEn,
    nameEn: nameEn || nameZh,
    category: SECTOR[row.sectorSlug ?? ""] ?? "vertical",
    blurb: clip(tagline || products || "FutureX 公开名单中的机构。", 140),
    tagline: tagline || undefined,
    products: products || undefined,
    founded: parseYear(row.founded),
    hq: COUNTRY[row.country ?? ""] ?? (row.country?.trim() || "未标注"),
    listing: row.isPubliclyListed ? "public" : "private",
    domain: hostname(website) || "未标注",
    website: website ?? undefined,
    profileNote:
      "来自 FutureX Capital 公开数据集（CC BY 4.0）。赛道映射到AI纵横的六类。累计融资没有公开总额，不把估值写成融资。",
    funding: { status: "undisclosed" },
    valuation: money,
    ticker: cleanTicker(row.ticker),
    sectorLabel: cleanLine(row.sectorEn, 80) || undefined,
    listSource: "futurex",
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
  const profileUrl = safeHttpUrl(row.url);
  const location = (row.all_locations ?? "").split(";")[0]?.trim();
  const oneLiner = cleanLine(row.one_liner, 180);
  const description = cleanDescription(row.long_description, oneLiner);
  const company: Company = {
    slug,
    name,
    nameEn: name,
    category: ycCategory(row),
    blurb: clip(oneLiner, 140) || "YC 公开名单没有一句话简介。",
    description,
    founded: yearFromUnix(row.launched_at),
    hq: location || "未标注",
    listing: row.status === "Public" ? "public" : "private",
    domain: hostname(website) || "未标注",
    website: website ?? undefined,
    profileUrl: profileUrl ?? undefined,
    profileNote:
      "来自 YC 公开公司名单。分类是AI纵横按标签归的。融资和估值没有接入，介绍只用名单原文。",
    funding: { status: "undisclosed" },
    valuation: { status: "undisclosed" },
    sectorLabel: ycSector(row),
    batch: cleanLine(row.batch, 40) || undefined,
    stage: cleanLine(row.stage, 40) || undefined,
    teamSize: positiveCount(row.team_size),
    tags: cleanTags(row.tags),
    listSource: "yc",
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

function attachFuturex(
  target: Company,
  row: FuturexCompany,
  money: Company["valuation"],
): boolean {
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
  if (assignEmpty(target, "tagline", cleanLine(row.tagline))) updated = true;
  if (assignEmpty(target, "products", cleanLine(row.keyProducts))) updated = true;
  const ticker = cleanTicker(row.ticker);
  if (ticker && assignEmpty(target, "ticker", ticker)) updated = true;
  if (assignEmpty(target, "sectorLabel", cleanLine(row.sectorEn, 80))) updated = true;
  return updated;
}

function assignEmpty(
  target: Company,
  key: "tagline" | "products" | "ticker" | "sectorLabel",
  value: string,
): boolean {
  if (!value || target[key]) return false;
  target[key] = value;
  return true;
}

function ycSector(row: YcCompany): string | undefined {
  const industry = cleanLine(row.industry, 80);
  const sub = cleanLine((row.subindustry ?? "").split("->").pop(), 80);
  if (industry && sub && sub.toLowerCase() !== industry.toLowerCase()) {
    return `${industry} · ${sub}`;
  }
  return industry || sub || undefined;
}

function cleanLine(value: string | null | undefined, max = 180): string {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? clip(text, max) : text;
}

function cleanTicker(value: string | null | undefined): string | undefined {
  const text = (value ?? "").trim();
  if (!text || text.length > 24 || /\s/.test(text)) return undefined;
  return text;
}

function cleanDescription(
  value: string | null | undefined,
  oneLiner: string,
): string | undefined {
  let text = (value ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return undefined;
  if (/[<>]/.test(text)) text = plainText(text);
  if (!text || text === oneLiner) return undefined;
  return text;
}

function positiveCount(value: number | null | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return undefined;
  if (value > 100_000) return undefined;
  return Math.round(value);
}

function cleanTags(tags: string[] | undefined): string[] | undefined {
  if (!tags) return undefined;
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of tags) {
    const text = tag.replace(/\s+/g, " ").trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    result.push(text);
    if (result.length >= 12) break;
  }
  return result.length > 0 ? result : undefined;
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
