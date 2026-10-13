import type { Insight, InsightPillar } from "@/data/insights";

/** Han characters per minute used for the editorial estimate. Latin words count as one each. */
export const INSIGHT_CHARS_PER_MINUTE = 400;

export type InsightMeasure = {
  paragraphs: number;
  sections: number;
  minutes: number;
};

export type InsightGlance = {
  count: number;
  byPillar: Record<InsightPillar, number>;
  latest: string | null;
};

export function glanceAtInsights(items: readonly Insight[]): InsightGlance {
  const byPillar: Record<InsightPillar, number> = {
    trend: 0,
    industry: 0,
    investing: 0,
  };
  let latest: string | null = null;
  for (const item of items) {
    byPillar[item.pillar] += 1;
    if (latest == null || item.publishedOn > latest) latest = item.publishedOn;
  }
  return { count: items.length, byPillar, latest };
}

export function measureInsight(insight: Insight): InsightMeasure {
  const paragraphs = insight.blocks.reduce((count, block) => count + block.paragraphs.length, 0);
  const chars = countableChars(readingSource(insight));
  return {
    paragraphs,
    sections: insight.blocks.length,
    minutes: Math.max(1, Math.round(chars / INSIGHT_CHARS_PER_MINUTE)),
  };
}

export function measureLabel(measure: InsightMeasure): string {
  const parts = [`约 ${measure.minutes} 分钟`, `正文 ${measure.paragraphs} 段`];
  if (measure.sections >= 2) parts.push(`${measure.sections} 节`);
  return parts.join(" · ");
}

export function byPublishedDesc(a: Insight, b: Insight): number {
  return b.publishedOn.localeCompare(a.publishedOn) || a.slug.localeCompare(b.slug);
}

/** Body text with inline links reduced to their labels. */
export function articlePlain(insight: Insight): string {
  return stripLinks(
    [insight.lede, ...insight.blocks.flatMap((block) => block.paragraphs)].join("\n"),
  );
}

function readingSource(insight: Insight): string {
  return [
    insight.lede,
    ...insight.blocks.flatMap((block) => [block.heading, ...block.paragraphs]),
  ].join("\n");
}

function stripLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function countableChars(text: string): number {
  const plain = stripLinks(text);
  const han = plain.match(/\p{Script=Han}/gu)?.length ?? 0;
  const words = plain.match(/[A-Za-z0-9]+/g)?.length ?? 0;
  return han + words;
}
