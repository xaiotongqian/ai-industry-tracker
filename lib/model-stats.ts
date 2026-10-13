import type { ModelRow } from "@/data/types";

/** Quality points below the table maximum that still count as the top tier. */
export const TOP_TIER_GAP = 3;

export type ModelGlance = {
  count: number;
  top: ModelRow | null;
  fastest: ModelRow | null;
  cheapestTopTier: ModelRow | null;
  topTierCount: number;
  medianPrice: number | null;
  rankById: Map<string, number>;
};

export function glanceAt(models: ModelRow[]): ModelGlance {
  if (models.length === 0) {
    return {
      count: 0,
      top: null,
      fastest: null,
      cheapestTopTier: null,
      topTierCount: 0,
      medianPrice: null,
      rankById: new Map(),
    };
  }

  const byQuality = [...models].sort(compareQuality);
  const rankById = new Map(byQuality.map((row, index) => [row.id, index + 1]));
  const top = byQuality[0];
  const floor = top.quality - TOP_TIER_GAP;
  const topTier = byQuality.filter((row) => row.quality >= floor);
  const cheapestTopTier = [...topTier].sort(comparePrice)[0] ?? null;
  const fastest = [...models].sort(compareSpeed)[0] ?? null;

  return {
    count: models.length,
    top,
    fastest,
    cheapestTopTier,
    topTierCount: topTier.length,
    medianPrice: median(models.map((row) => row.price)),
    rankById,
  };
}

/** A note derived from this table only. Null when the row sits near the middle. */
export function priceRelation(row: ModelRow, glance: ModelGlance): string | null {
  if (glance.cheapestTopTier?.id === row.id && glance.topTierCount > 1) {
    return "顶尖档里输入价最低";
  }
  const medianPrice = glance.medianPrice;
  if (medianPrice == null || medianPrice <= 0) return null;
  const ratio = row.price / medianPrice;
  if (ratio <= 0.5) return "输入价低于本表中位";
  if (ratio >= 2) return "输入价高于本表中位";
  return null;
}

/** Derived from this row's own input and output prices. */
export function outputMultipleNote(price: number, outputPrice: number | null): string | null {
  if (outputPrice == null || price <= 0) return null;
  const ratio = outputPrice / price;
  if (ratio < 1.5 && ratio > 2 / 3) return null;
  const rounded = ratio >= 10 ? Math.round(ratio) : Math.round(ratio * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `输出价约为输入的 ${text} 倍`;
}

function compareQuality(a: ModelRow, b: ModelRow): number {
  return b.quality - a.quality || b.speed - a.speed || a.name.localeCompare(b.name, "zh");
}

function comparePrice(a: ModelRow, b: ModelRow): number {
  return a.price - b.price || b.quality - a.quality || a.name.localeCompare(b.name, "zh");
}

function compareSpeed(a: ModelRow, b: ModelRow): number {
  return b.speed - a.speed || b.quality - a.quality || a.name.localeCompare(b.name, "zh");
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    const left = sorted[mid - 1];
    const right = sorted[mid];
    if (left == null || right == null) return null;
    return (left + right) / 2;
  }
  return sorted[mid] ?? null;
}
