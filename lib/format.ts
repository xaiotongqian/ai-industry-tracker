import type { Listing, MoneyPlaceholder } from "@/data/types";
import { SAMPLE_AS_OF } from "@/data/types";

export function formatUsd(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000_000_000) {
    const value = abs / 1_000_000_000_000;
    const digits = Number.isInteger(value) ? 0 : 1;
    return `${sign}$${value.toFixed(digits)}T`;
  }
  if (abs >= 1_000_000_000) {
    const value = abs / 1_000_000_000;
    const digits = Number.isInteger(value) ? 0 : 1;
    return `${sign}$${value.toFixed(digits)}B`;
  }
  if (abs >= 1_000_000) {
    const value = abs / 1_000_000;
    const digits = Number.isInteger(value) ? 0 : 1;
    return `${sign}$${value.toFixed(digits)}M`;
  }
  return `${sign}$${abs.toLocaleString("en-US")}`;
}

export function formatTokenPrice(usdPerMillion: number): string {
  const abs = Math.abs(usdPerMillion);
  if (abs !== 0 && abs < 0.01) return `$${usdPerMillion.toFixed(4)}`;
  if (abs !== 0 && abs < 0.1) {
    return `$${usdPerMillion.toFixed(3).replace(/0+$/, "")}`;
  }
  return `$${usdPerMillion.toFixed(2)}`;
}

export function formatIndex(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function formatSeconds(value: number): string {
  if (value >= 10) return `${Math.round(value)} 秒`;
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${text} 秒`;
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  if (!year || !month || !day) return isoDate;
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function relativeLabel(iso: string, asOf: string = SAMPLE_AS_OF): string {
  const deltaMs = Date.parse(asOf) - Date.parse(iso);
  if (Number.isNaN(deltaMs)) return formatDate(iso);
  if (deltaMs < 0) return formatDate(iso);
  const hours = Math.floor(deltaMs / 3_600_000);
  if (hours < 1) return "不到 1 小时";
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

/** Scientific notation for Epoch FLOP estimates. */
export function formatFlop(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "未知";
  const exp = Math.floor(Math.log10(value));
  const sig = value / 10 ** exp;
  const rounded = Number(sig.toFixed(1));
  const digits = Number.isInteger(rounded) ? 0 : 1;
  return `${rounded.toFixed(digits)}×10^${exp}`;
}

export function listingLabel(listing: Listing): string {
  switch (listing) {
    case "public":
      return "上市";
    case "subsidiary":
      return "隶属集团";
    case "private":
      return "未上市";
  }
}

const SEASON_LABEL: Record<string, string> = {
  winter: "冬季",
  spring: "春季",
  summer: "夏季",
  fall: "秋季",
};

/** YC batches are "Season YYYY". Anything else is returned unchanged. */
export function formatBatch(batch: string): string {
  const match = /^(Winter|Spring|Summer|Fall)\s+(\d{4})$/i.exec(batch.trim());
  if (!match) return batch;
  const season = SEASON_LABEL[match[1].toLowerCase()];
  return season ? `${match[2]} ${season}` : batch;
}

/** YC publishes Early and Growth. Other tokens stay as written. */
export function formatStage(stage: string): string {
  if (stage === "Early") return "早期";
  if (stage === "Growth") return "成长";
  return stage;
}

export function moneySortValue(value: MoneyPlaceholder): number | null {
  return value.status === "mock" || value.status === "reported" ? value.usd : null;
}
