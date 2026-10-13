import { requireCompany } from "@/data/companies";
import type { ModelCapabilities, ModelRow } from "@/data/types";

/**
 * Illustrative rows only. Indices, speed, latency, and prices are not measurements.
 * Release date, cache prices, and evaluation cost stay empty so the demo does not invent them.
 */
function caps(
  finance: number,
  strategy: number,
  legal: number,
  healthcare: number,
  engineering: number,
  economics: number,
): ModelCapabilities {
  return { finance, strategy, legal, healthcare, engineering, economics };
}

function fixture(
  row: Pick<
    ModelRow,
    | "id"
    | "name"
    | "organization"
    | "companySlug"
    | "quality"
    | "coding"
    | "agentic"
    | "speed"
    | "price"
    | "outputPrice"
    | "timeToFirstToken"
    | "endToEndSeconds"
    | "capabilities"
  >,
): ModelRow {
  return {
    releaseDate: null,
    timeToFirstAnswer: null,
    indexCost: null,
    indexCostPerTask: null,
    cacheHitPrice: null,
    cacheWritePrice: null,
    ...row,
  };
}

export const models: ModelRow[] = [
  fixture({
    id: "claude-flagship",
    name: "Claude 系列旗舰",
    organization: "Anthropic",
    companySlug: "anthropic",
    quality: 93,
    coding: 90,
    agentic: 88,
    speed: 46,
    price: 15,
    outputPrice: 75,
    timeToFirstToken: 1.2,
    endToEndSeconds: 8.4,
    capabilities: caps(71, 74, 80, 68, 77, 70),
  }),
  fixture({
    id: "gpt-flagship",
    name: "GPT 系列旗舰",
    organization: "OpenAI",
    companySlug: "openai",
    quality: 92,
    coding: 88,
    agentic: 86,
    speed: 68,
    price: 10,
    outputPrice: 40,
    timeToFirstToken: 0.8,
    endToEndSeconds: 6.1,
    capabilities: caps(76, 73, 70, 66, 75, 72),
  }),
  fixture({
    id: "gemini-flagship",
    name: "Gemini 系列旗舰",
    organization: "Google DeepMind",
    companySlug: "deepmind",
    quality: 91,
    coding: 86,
    agentic: 84,
    speed: 88,
    price: 6.5,
    outputPrice: 18,
    timeToFirstToken: 0.5,
    endToEndSeconds: 4.2,
    capabilities: caps(69, 72, 64, 71, 80, 68),
  }),
  fixture({
    id: "deepseek-reasoner",
    name: "DeepSeek 推理",
    organization: "深度求索",
    companySlug: "deepseek",
    quality: 89,
    coding: 87,
    agentic: 80,
    speed: 74,
    price: 0.6,
    outputPrice: 2.2,
    timeToFirstToken: 0.9,
    endToEndSeconds: 5.5,
    capabilities: caps(62, 60, 58, 55, 78, 61),
  }),
  fixture({
    id: "grok-flagship",
    name: "Grok 系列旗舰",
    organization: "xAI",
    companySlug: "xai",
    quality: 86,
    coding: 80,
    agentic: 79,
    speed: 120,
    price: 5,
    outputPrice: 15,
    timeToFirstToken: 0.4,
    endToEndSeconds: 3.1,
    capabilities: caps(58, 64, 55, 52, 70, 60),
  }),
  fixture({
    id: "llama-flagship",
    name: "Llama 开源旗舰",
    organization: "Meta",
    companySlug: "meta",
    quality: 84,
    coding: 78,
    agentic: 74,
    speed: 96,
    price: 0.2,
    outputPrice: 0.2,
    timeToFirstToken: 0.3,
    endToEndSeconds: 2.4,
    capabilities: caps(54, 56, 50, 48, 66, 52),
  }),
  fixture({
    id: "qwen-flagship",
    name: "Qwen 系列旗舰",
    organization: "阿里云",
    companySlug: "alibaba",
    quality: 83,
    coding: 81,
    agentic: 76,
    speed: 90,
    price: 0.8,
    outputPrice: 2.4,
    timeToFirstToken: 0.6,
    endToEndSeconds: 3.8,
    capabilities: caps(60, 58, 57, 54, 72, 59),
  }),
  fixture({
    id: "mistral-flagship",
    name: "Mistral 商用旗舰",
    organization: "Mistral",
    companySlug: "mistral",
    quality: 82,
    coding: 79,
    agentic: 73,
    speed: 102,
    price: 2.5,
    outputPrice: 7.5,
    timeToFirstToken: 0.4,
    endToEndSeconds: 2.8,
    capabilities: caps(55, 57, 52, 49, 68, 54),
  }),
  fixture({
    id: "doubao-flagship",
    name: "豆包系列旗舰",
    organization: "字节跳动",
    companySlug: "bytedance",
    quality: 80,
    coding: 76,
    agentic: 75,
    speed: 110,
    price: 0.4,
    outputPrice: 1.6,
    timeToFirstToken: 0.5,
    endToEndSeconds: 3,
    capabilities: caps(52, 54, 48, 50, 63, 51),
  }),
  fixture({
    id: "kimi-long",
    name: "Kimi 长上下文",
    organization: "月之暗面",
    companySlug: "moonshot",
    quality: 79,
    coding: 74,
    agentic: 77,
    speed: 70,
    price: 1.2,
    outputPrice: 4,
    timeToFirstToken: 0.7,
    endToEndSeconds: 4.6,
    capabilities: caps(57, 55, 60, 51, 58, 56),
  }),
  fixture({
    id: "glm-flagship",
    name: "GLM 系列旗舰",
    organization: "智谱",
    companySlug: "zhipu",
    quality: 78,
    coding: 75,
    agentic: 72,
    speed: 85,
    price: 1,
    outputPrice: 3,
    timeToFirstToken: 0.6,
    endToEndSeconds: 3.6,
    capabilities: caps(53, 52, 49, 50, 61, 50),
  }),
  fixture({
    id: "command-series",
    name: "Command 系列",
    organization: "Cohere",
    companySlug: "cohere",
    quality: 74,
    coding: 70,
    agentic: 68,
    speed: 98,
    price: 2,
    outputPrice: 6,
    timeToFirstToken: 0.5,
    endToEndSeconds: 2.9,
    capabilities: caps(50, 51, 48, 44, 55, 49),
  }),
];

for (const row of models) {
  if (row.companySlug) requireCompany(row.companySlug);
}

export function modelsForCompany(slug: string): ModelRow[] {
  return models.filter((row) => row.companySlug === slug);
}
