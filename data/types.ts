/** Fixture clock so relative times stay stable across builds. */
export const SAMPLE_AS_OF = "2026-10-12T06:00:00.000Z";

export type Cadence = "hourly" | "daily" | "weekly" | "editorial";

export const CADENCE_LABEL: Record<Cadence, string> = {
  hourly: "每小时更新",
  daily: "每日更新",
  weekly: "每周更新",
  editorial: "编辑观点",
};

export type CategoryId =
  | "foundation"
  | "infra"
  | "agents"
  | "vertical"
  | "data"
  | "silicon";

export type Listing = "private" | "public" | "subsidiary";

/**
 * `mock` is a fixture and must render with a 示意 mark.
 * `reported` is a USD figure copied from a public source, with no conversion.
 */
export type MoneyPlaceholder =
  | { status: "mock"; usd: number }
  | { status: "reported"; usd: number }
  | { status: "undisclosed" }
  | { status: "pending"; reason: string };

/** Set when the row was added from a public list. Editorial rows leave it unset. */
export type CompanyListSource = "futurex" | "yc";

export type Company = {
  slug: string;
  name: string;
  nameEn: string;
  category: CategoryId;
  blurb: string;
  /** Short line from a public list, kept apart from the editorial blurb. */
  tagline?: string;
  /** Named products from a public list. */
  products?: string;
  /** Longer text copied from a public list. Never written for the row. */
  description?: string;
  founded: number | null;
  hq: string;
  listing: Listing;
  /** Display only. Do not treat as a verified URL. */
  domain: string;
  /** Set only when a public source gave an http(s) URL. */
  website?: string;
  /** Public profile page other than the company site, such as a YC URL. */
  profileUrl?: string;
  /** Why this profile is thin: seeded from a public list, not the editorial set. */
  profileNote?: string;
  funding: MoneyPlaceholder;
  valuation: MoneyPlaceholder;
  /** Exchange symbol copied from a public list. */
  ticker?: string;
  /** Sector or industry label from a public list, not the six-way category. */
  sectorLabel?: string;
  /** YC batch as published, for example "Winter 2024". */
  batch?: string;
  /** YC stage token as published, for example "Early". */
  stage?: string;
  /** Headcount from a public list. Absent when missing or not positive. */
  teamSize?: number;
  /** Labels copied from a public list. */
  tags?: string[];
  listSource?: CompanyListSource;
};

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  /** Mock wire, not a scraped outlet. */
  wire: string;
  desk: string;
  publishedAt: string;
  /** Null when the headline does not name an organization on the map. */
  companySlug: string | null;
  /** Original article. Present on live items. */
  href?: string;
};

/**
 * Six Artificial Analysis capability indexes from the free language-model payload.
 * Null when that index was absent for the row.
 */
export type ModelCapabilities = {
  finance: number | null;
  strategy: number | null;
  legal: number | null;
  healthcare: number | null;
  engineering: number | null;
  economics: number | null;
};

export type ModelRow = {
  id: string;
  name: string;
  organization: string;
  /** Null when the lab is not on the map yet. */
  companySlug: string | null;
  /** Intelligence Index. Demo rows are fixtures; live rows use the published value. */
  quality: number;
  /** Coding Index. Null when the source omitted it. */
  coding: number | null;
  /** Agentic Index. Null when the source omitted it. */
  agentic: number | null;
  /** Median output tokens per second. */
  speed: number;
  /** USD per million input tokens. */
  price: number;
  /** USD per million output tokens. */
  outputPrice: number | null;
  /** USD per million cache-hit tokens. */
  cacheHitPrice: number | null;
  /** USD per million cache-write tokens. */
  cacheWritePrice: number | null;
  /** Median seconds to first token. */
  timeToFirstToken: number | null;
  /** Median seconds to first answer token. */
  timeToFirstAnswer: number | null;
  /** Median end-to-end response seconds. */
  endToEndSeconds: number | null;
  /** Published USD cost to run the Intelligence Index. */
  indexCost: number | null;
  /** Published USD cost per Intelligence Index task. */
  indexCostPerTask: number | null;
  /** ISO date (YYYY-MM-DD) when the source gave one. */
  releaseDate: string | null;
  capabilities: ModelCapabilities;
};

export type ModelsPayload = Loaded<ModelRow> & {
  /** Intelligence Index major.minor from the free response. Null on the demo fallback. */
  indexVersion: number | null;
};

/** Evidence gate from the source. Excerpt text is never stored. */
export type FundingEvidence = "gated" | "unverified";

export type FundingRound = {
  id: string;
  companySlug: string | null;
  /** Spelling from the source. The ledger falls back to the map name. */
  companyName?: string;
  round: string;
  /** Source bucket when it adds information beyond `round`. */
  roundCategory?: string;
  amount: MoneyPlaceholder;
  /** Source spelling of an adopted USD amount, when the payload included one. */
  amountLabel?: string;
  /** Valuation as published. Not converted and not included in the USD total. */
  valuationLabel?: string;
  announcedOn: string;
  investors: string[];
  /** Subset of `investors` the source marked as lead. Omitted when the source does not say. */
  leadInvestors?: string[];
  sourceUrl?: string;
  sourceName?: string;
  /** External company profile. Omitted when the source did not give one. */
  profileUrl?: string;
  evidence?: FundingEvidence;
  /** Source week key, when it differs from `announcedOn`. */
  weekId?: string;
};

export type TrendNote = {
  id: string;
  text: string;
  href?: string;
};

export type DataSource = {
  id: string;
  name: string;
  covers: string;
  cadence: Cadence;
  usedOn: string;
  module: string;
  plugIn: string;
  /** False when this slot still renders fixtures. */
  connected: boolean;
  /** Short status for the footer. Page banners use the live fetch result. */
  state: string;
};

export type DataOrigin = "live" | "demo";

export type Loaded<T> = {
  items: T[];
  origin: DataOrigin;
  sourceName: string;
  sourceHref?: string;
  fetchedAt: string;
  note: string;
};

export type FundingPayload = Loaded<FundingRound> & {
  /** Feed-wide count from the source response. Null on the demo fallback. */
  sourceTotal: number | null;
};
