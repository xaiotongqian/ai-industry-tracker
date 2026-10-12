import type { Listing, MoneyPlaceholder } from "@/data/types";
import { SAMPLE_AS_OF } from "@/data/types";

export function formatUsd(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
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
  return `$${usdPerMillion.toFixed(2)}`;
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  if (!year || !month || !day) return isoDate;
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function relativeLabel(iso: string): string {
  const deltaMs = Date.parse(SAMPLE_AS_OF) - Date.parse(iso);
  const hours = Math.floor(deltaMs / 3_600_000);
  if (hours < 1) return "不到 1 小时";
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
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

export function moneySortValue(value: MoneyPlaceholder): number | null {
  return value.status === "mock" ? value.usd : null;
}
