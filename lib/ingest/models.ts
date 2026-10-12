import { cacheLife } from "next/cache";
import { models as demoModels } from "@/data/models";
import { SAMPLE_AS_OF, type Loaded, type ModelRow } from "@/data/types";
import { fetchText } from "@/lib/ingest/http";
import { loadCompanies } from "@/lib/ingest/companies";
import { buildNameIndex } from "@/lib/ingest/match";

const AA_URL = "https://artificialanalysis.ai/api/v2/language/models/free";

type AaModel = {
  slug?: string;
  name?: string;
  model_creator?: { name?: string };
  evaluations?: { artificial_analysis_intelligence_index?: number };
  pricing?: { price_1m_input_tokens?: number };
  performance?: { median_output_tokens_per_second?: number };
};

export async function loadModels(): Promise<Loaded<ModelRow>> {
  "use cache";
  cacheLife("weekly");

  const key = process.env.ARTIFICIAL_ANALYSIS_API_KEY?.trim();
  if (!key) {
    return demoModelsSet(
      "Artificial Analysis 免费接口需要 API key，仓库不存放钥匙。未设置 ARTIFICIAL_ANALYSIS_API_KEY，质量、速度和价格仍是示意。",
    );
  }

  try {
    const companies = await loadCompanies();
    const index = buildNameIndex(companies.items);
    const rows = await fetchArtificialAnalysis(key, index);
    if (!rows || rows.length === 0) {
      return demoModelsSet("Artificial Analysis 这一轮没有返回可用的模型行，表仍是示意。");
    }
    return {
      items: rows,
      origin: "live",
      sourceName: "Artificial Analysis",
      sourceHref: "https://artificialanalysis.ai/data-api/docs",
      fetchedAt: new Date().toISOString(),
      note: "质量是 Intelligence Index 原值，速度是输出 token/s 的中位数，价格是输入 token 的美元 / 百万。免费档没有混合价格。表上保留指数最高的 24 个。",
    };
  } catch {
    return demoModelsSet("Artificial Analysis 请求失败，表仍是示意。");
  }
}

function demoModelsSet(note: string): Loaded<ModelRow> {
  return {
    items: demoModels,
    origin: "demo",
    sourceName: "纬图示意表",
    sourceHref: "https://artificialanalysis.ai/data-api/docs",
    fetchedAt: SAMPLE_AS_OF,
    note,
  };
}

async function fetchArtificialAnalysis(
  key: string,
  index: ReturnType<typeof buildNameIndex>,
): Promise<ModelRow[] | null> {
  const byId = new Map<string, ModelRow>();
  for (let page = 1; page <= 3; page++) {
    const payload = JSON.parse(
      await fetchText(`${AA_URL}?page=${page}`, 15_000, { "x-api-key": key }),
    ) as {
      data?: AaModel[];
      pagination?: { has_more?: boolean };
    };
    if (!Array.isArray(payload.data)) return byId.size > 0 ? rank(byId) : null;
    for (const item of payload.data) {
      const row = mapModel(item, index);
      if (!row) continue;
      const previous = byId.get(row.id);
      if (!previous || row.quality > previous.quality) byId.set(row.id, row);
    }
    if (!payload.pagination?.has_more) break;
  }
  return rank(byId);
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
  return {
    id: `aa-${slug}`,
    name,
    organization,
    companySlug: index.exact(organization),
    quality,
    speed: Math.round(speed),
    price,
  };
}

function finite(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
