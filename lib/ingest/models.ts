import { cacheLife } from "next/cache";
import { models as demoModels } from "@/data/models";
import { SAMPLE_AS_OF, type ModelRow, type ModelsPayload } from "@/data/types";
import { loadCompanies } from "@/lib/ingest/companies";
import { fetchText } from "@/lib/ingest/http";
import { buildNameIndex } from "@/lib/ingest/match";

const AA_URL = "https://artificialanalysis.ai/api/v2/language/models/free";

type AaModel = {
  slug?: string;
  name?: string;
  release_date?: string | null;
  model_creator?: { name?: string };
  evaluations?: {
    artificial_analysis_intelligence_index?: number;
    artificial_analysis_coding_index?: number;
    artificial_analysis_agentic_index?: number;
    artificial_analysis_finance_and_accounting_index?: number;
    artificial_analysis_strategy_and_ops_index?: number;
    artificial_analysis_legal_index?: number;
    artificial_analysis_healthcare_and_medical_index?: number;
    artificial_analysis_engineering_index?: number;
    artificial_analysis_economics_index?: number;
  };
  artificial_analysis_intelligence_index_cost?: {
    total_cost?: number;
    cost_per_task?: { total_cost?: number };
  };
  pricing?: {
    price_1m_input_tokens?: number;
    price_1m_output_tokens?: number;
    price_1m_cache_hit_tokens?: number;
    price_1m_cache_write_tokens?: number;
  };
  performance?: {
    median_output_tokens_per_second?: number;
    median_time_to_first_token_seconds?: number;
    median_time_to_first_answer_token_seconds?: number;
    median_end_to_end_response_time_seconds?: number;
  };
};

type AaPage = {
  intelligence_index_version?: number;
  data?: AaModel[];
  pagination?: { has_more?: boolean };
};

export async function loadModels(): Promise<ModelsPayload> {
  "use cache";
  cacheLife("weekly");

  const key = process.env.ARTIFICIAL_ANALYSIS_API_KEY?.trim();
  if (!key) {
    return demoModelsSet(
      "Artificial Analysis 免费接口需要 API key，仓库不存放钥匙。未设置 ARTIFICIAL_ANALYSIS_API_KEY，质量、编码、智能体、速度和价格仍是示意。",
    );
  }

  try {
    const companies = await loadCompanies();
    const index = buildNameIndex(companies.items);
    const fetched = await fetchArtificialAnalysis(key, index);
    if (!fetched || fetched.rows.length === 0) {
      return demoModelsSet("Artificial Analysis 这一轮没有返回可用的模型行，表仍是示意。");
    }
    return {
      items: fetched.rows,
      origin: "live",
      sourceName: "Artificial Analysis",
      sourceHref: "https://artificialanalysis.ai/data-api/docs",
      fetchedAt: new Date().toISOString(),
      indexVersion: fetched.indexVersion,
      note: liveNote(fetched.indexVersion),
    };
  } catch {
    return demoModelsSet("Artificial Analysis 请求失败，表仍是示意。");
  }
}

function demoModelsSet(note: string): ModelsPayload {
  return {
    items: demoModels,
    origin: "demo",
    sourceName: "AI纵横示意表",
    sourceHref: "https://artificialanalysis.ai/data-api/docs",
    fetchedAt: SAMPLE_AS_OF,
    indexVersion: null,
    note,
  };
}

function liveNote(version: number | null): string {
  const versionBit = version == null ? "" : `（v${version}）`;
  return `质量、编码、智能体和六项能力指数是免费接口原值${versionBit}。速度是输出 token/s 的中位数；价格列是输入美元 / 百万，输出价写在数字下方。免费档没有数学指数、单题分数、开放度和混合价格。表上保留质量最高的 24 个。名次、顶尖档和价格高低由这 24 行算出。`;
}

async function fetchArtificialAnalysis(
  key: string,
  index: ReturnType<typeof buildNameIndex>,
): Promise<{ rows: ModelRow[]; indexVersion: number | null } | null> {
  const byId = new Map<string, ModelRow>();
  let indexVersion: number | null = null;
  for (let page = 1; page <= 3; page++) {
    const payload = JSON.parse(
      await fetchText(`${AA_URL}?page=${page}`, 15_000, { "x-api-key": key }),
    ) as AaPage;
    if (indexVersion == null) indexVersion = finite(payload.intelligence_index_version);
    if (!Array.isArray(payload.data)) {
      return byId.size > 0 ? { rows: rank(byId), indexVersion } : null;
    }
    for (const item of payload.data) {
      const row = mapModel(item, index);
      if (!row) continue;
      const previous = byId.get(row.id);
      if (!previous || row.quality > previous.quality) byId.set(row.id, row);
    }
    if (!payload.pagination?.has_more) break;
  }
  return { rows: rank(byId), indexVersion };
}

function rank(byId: Map<string, ModelRow>): ModelRow[] {
  return [...byId.values()].sort((a, b) => b.quality - a.quality).slice(0, 24);
}

function mapModel(item: AaModel, index: ReturnType<typeof buildNameIndex>): ModelRow | null {
  const name = item.name?.trim();
  const slug = item.slug?.trim();
  const organization = item.model_creator?.name?.trim();
  const quality = finite(item.evaluations?.artificial_analysis_intelligence_index);
  const speed = finite(item.performance?.median_output_tokens_per_second);
  const price = finite(item.pricing?.price_1m_input_tokens);
  if (!name || !slug || !organization || quality == null || speed == null || price == null) {
    return null;
  }
  const evaluations = item.evaluations;
  return {
    id: `aa-${slug}`,
    name,
    organization,
    companySlug: index.exact(organization),
    quality,
    coding: finite(evaluations?.artificial_analysis_coding_index),
    agentic: finite(evaluations?.artificial_analysis_agentic_index),
    speed: Math.round(speed),
    price,
    outputPrice: finite(item.pricing?.price_1m_output_tokens),
    cacheHitPrice: finite(item.pricing?.price_1m_cache_hit_tokens),
    cacheWritePrice: finite(item.pricing?.price_1m_cache_write_tokens),
    timeToFirstToken: finite(item.performance?.median_time_to_first_token_seconds),
    timeToFirstAnswer: finite(item.performance?.median_time_to_first_answer_token_seconds),
    endToEndSeconds: finite(item.performance?.median_end_to_end_response_time_seconds),
    indexCost: finite(item.artificial_analysis_intelligence_index_cost?.total_cost),
    indexCostPerTask: finite(item.artificial_analysis_intelligence_index_cost?.cost_per_task?.total_cost),
    releaseDate: isoDate(item.release_date),
    capabilities: {
      finance: finite(evaluations?.artificial_analysis_finance_and_accounting_index),
      strategy: finite(evaluations?.artificial_analysis_strategy_and_ops_index),
      legal: finite(evaluations?.artificial_analysis_legal_index),
      healthcare: finite(evaluations?.artificial_analysis_healthcare_and_medical_index),
      engineering: finite(evaluations?.artificial_analysis_engineering_index),
      economics: finite(evaluations?.artificial_analysis_economics_index),
    },
  };
}

function finite(value: number | undefined | null): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  if (!match?.[1]) return null;
  const stamp = Date.parse(`${match[1]}T00:00:00Z`);
  return Number.isNaN(stamp) ? null : match[1];
}
