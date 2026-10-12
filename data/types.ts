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

export type Company = {
  slug: string;
  name: string;
  nameEn: string;
  category: CategoryId;
  blurb: string;
  founded: number | null;
  hq: string;
  listing: Listing;
  /** Display only. Do not treat as a verified URL. */
  domain: string;
  /** Set only when a public source gave an http(s) URL. */
  website?: string;
  /** Why this profile is thin: seeded from a public list, not the editorial set. */
  profileNote?: string;
  funding: MoneyPlaceholder;
  valuation: MoneyPlaceholder;
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

export type ModelRow = {
  id: string;
  name: string;
  organization: string;
  /** Null when the lab is not on the map yet. */
  companySlug: string | null;
  /** 0–100 index. Demo rows are fixtures; live rows use the source index as published. */
  quality: number;
  /** Tokens per second. */
  speed: number;
  /** USD per million tokens. */
  price: number;
};

export type FundingRound = {
  id: string;
  companySlug: string | null;
  /** Spelling from the source. The ledger falls back to the map name. */
  companyName?: string;
  round: string;
  amount: MoneyPlaceholder;
  announcedOn: string;
  investors: string[];
  sourceUrl?: string;
  sourceName?: string;
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
