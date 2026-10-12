import type { Company } from "@/data/types";
import { nameKeys, norm } from "@/lib/ingest/text";

const GENERIC = new Set([
  "writer",
  "scale",
  "character",
  "together",
  "lambda",
  "data",
  "core",
  "fire",
  "open",
  "ai",
]);

const SHORT_OK = new Set(["xai", "amd", "meta"]);

const ALIASES: Record<string, string[]> = {
  deepmind: ["DeepMind", "Google DeepMind"],
  alibaba: ["Alibaba", "Alibaba Cloud", "阿里云", "阿里巴巴"],
  bytedance: ["ByteDance", "字节跳动"],
  zhipu: ["Zhipu", "Zhipu AI", "智谱"],
  moonshot: ["Moonshot", "Moonshot AI", "月之暗面"],
  meta: ["Meta AI", "Meta Platforms"],
  huggingface: ["HuggingFace"],
  wandb: ["W&B", "Weights and Biases"],
  siliconflow: ["SiliconFlow", "硅基流动"],
  xai: ["x.ai"],
  character: ["Character AI"],
  scale: ["Scale AI"],
  deepseek: ["深度求索"],
  nvidia: ["Nvidia"],
};

export type NameIndex = {
  exact(name: string): string | null;
  mention(text: string): string | null;
};

export function labelsFor(company: Company): string[] {
  return unique([company.name, company.nameEn, ...(ALIASES[company.slug] ?? [])]);
}

export function buildNameIndex(companies: readonly Company[]): NameIndex {
  const exact = new Map<string, string>();
  const mentions: { slug: string; raw: string; re: RegExp | null }[] = [];
  const seenMention = new Set<string>();

  for (const company of companies) {
    for (const label of labelsFor(company)) {
      for (const key of nameKeys(label)) {
        if (!exact.has(key)) exact.set(key, company.slug);
      }
      const mentionKey = label.toLowerCase();
      if (seenMention.has(mentionKey) || isGenericMention(label)) continue;
      seenMention.add(mentionKey);
      mentions.push({ slug: company.slug, raw: label, re: mentionRegex(label) });
    }
  }
  mentions.sort((a, b) => b.raw.length - a.raw.length);

  return {
    exact(name: string) {
      for (const key of nameKeys(name)) {
        const slug = exact.get(key);
        if (slug) return slug;
      }
      return null;
    },
    mention(text: string) {
      for (const item of mentions) {
        if (item.re) {
          if (item.re.test(text)) return item.slug;
        } else if (item.raw && text.includes(item.raw)) {
          return item.slug;
        }
      }
      return null;
    },
  };
}

export function rememberCompany(company: Company, exact: Map<string, string>) {
  for (const label of labelsFor(company)) {
    for (const key of nameKeys(label)) {
      if (!exact.has(key)) exact.set(key, company.slug);
    }
  }
}

export function lookupExact(name: string, exact: Map<string, string>): string | null {
  for (const key of nameKeys(name)) {
    const slug = exact.get(key);
    if (slug) return slug;
  }
  return null;
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function isGenericMention(label: string): boolean {
  const key = norm(label);
  if (GENERIC.has(key)) return true;
  if (!/[\u4e00-\u9fff]/.test(label) && label.length < 3 && !SHORT_OK.has(label.toLowerCase())) {
    return true;
  }
  return false;
}

function mentionRegex(label: string): RegExp | null {
  if (/[\u4e00-\u9fff]/.test(label)) return null;
  if (label.length < 3 && !SHORT_OK.has(label.toLowerCase())) return null;
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^A-Za-z0-9])${escaped}(?=$|[^A-Za-z0-9])`, "i");
}
