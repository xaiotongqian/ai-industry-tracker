/** Fixture clock so relative times stay stable across builds. */
export const SAMPLE_AS_OF = "2026-10-12T06:00:00.000Z";

export type Cadence = "hourly" | "daily" | "weekly";

export const CADENCE_LABEL: Record<Cadence, string> = {
  hourly: "每小时更新",
  daily: "每日更新",
  weekly: "每周更新",
};

export type CategoryId =
  | "foundation"
  | "infra"
  | "agents"
  | "vertical"
  | "data"
  | "silicon";

export type Listing = "private" | "public" | "subsidiary";

/** Money fields are fixtures. `mock` must render with a 示意 mark. */
export type MoneyPlaceholder =
  | { status: "mock"; usd: number }
  | { status: "undisclosed" }
  | { status: "pending"; reason: string };

export type Company = {
  slug: string;
  name: string;
  nameEn: string;
  category: CategoryId;
  blurb: string;
  founded: number;
  hq: string;
  listing: Listing;
  /** Display only. Do not treat as a verified URL. */
  domain: string;
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
  companySlug: string;
};

export type ModelRow = {
  id: string;
  name: string;
  organization: string;
  companySlug: string;
  /** 0–100 illustrative index, not a published benchmark. */
  quality: number;
  /** Illustrative tokens per second. */
  speed: number;
  /** Illustrative USD per million tokens. */
  price: number;
};

export type FundingRound = {
  id: string;
  companySlug: string;
  round: string;
  amount: MoneyPlaceholder;
  announcedOn: string;
  investors: string[];
};

export type TrendNote = {
  id: string;
  text: string;
};

export type DataSource = {
  id: string;
  name: string;
  covers: string;
  cadence: Cadence;
  usedOn: string;
  module: string;
  plugIn: string;
};
