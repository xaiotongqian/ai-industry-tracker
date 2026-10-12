import { requireCompany } from "@/data/companies";
import type { ModelRow } from "@/data/types";

/**
 * Illustrative rows only. Quality, speed, and price are not measurements.
 * Replace this module with Artificial Analysis mappings later.
 */
export const models: ModelRow[] = [
  {
    id: "claude-flagship",
    name: "Claude 系列旗舰",
    organization: "Anthropic",
    companySlug: "anthropic",
    quality: 93,
    speed: 46,
    price: 15,
  },
  {
    id: "gpt-flagship",
    name: "GPT 系列旗舰",
    organization: "OpenAI",
    companySlug: "openai",
    quality: 92,
    speed: 68,
    price: 10,
  },
  {
    id: "gemini-flagship",
    name: "Gemini 系列旗舰",
    organization: "Google DeepMind",
    companySlug: "deepmind",
    quality: 91,
    speed: 88,
    price: 6.5,
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek 推理",
    organization: "深度求索",
    companySlug: "deepseek",
    quality: 89,
    speed: 74,
    price: 0.6,
  },
  {
    id: "grok-flagship",
    name: "Grok 系列旗舰",
    organization: "xAI",
    companySlug: "xai",
    quality: 86,
    speed: 120,
    price: 5,
  },
  {
    id: "llama-flagship",
    name: "Llama 开源旗舰",
    organization: "Meta",
    companySlug: "meta",
    quality: 84,
    speed: 96,
    price: 0.2,
  },
  {
    id: "qwen-flagship",
    name: "Qwen 系列旗舰",
    organization: "阿里云",
    companySlug: "alibaba",
    quality: 83,
    speed: 90,
    price: 0.8,
  },
  {
    id: "mistral-flagship",
    name: "Mistral 商用旗舰",
    organization: "Mistral",
    companySlug: "mistral",
    quality: 82,
    speed: 102,
    price: 2.5,
  },
  {
    id: "doubao-flagship",
    name: "豆包系列旗舰",
    organization: "字节跳动",
    companySlug: "bytedance",
    quality: 80,
    speed: 110,
    price: 0.4,
  },
  {
    id: "kimi-long",
    name: "Kimi 长上下文",
    organization: "月之暗面",
    companySlug: "moonshot",
    quality: 79,
    speed: 70,
    price: 1.2,
  },
  {
    id: "glm-flagship",
    name: "GLM 系列旗舰",
    organization: "智谱",
    companySlug: "zhipu",
    quality: 78,
    speed: 85,
    price: 1,
  },
  {
    id: "command-series",
    name: "Command 系列",
    organization: "Cohere",
    companySlug: "cohere",
    quality: 74,
    speed: 98,
    price: 2,
  },
];

for (const row of models) {
  requireCompany(row.companySlug);
}

export function modelsForCompany(slug: string): ModelRow[] {
  return models.filter((row) => row.companySlug === slug);
}
