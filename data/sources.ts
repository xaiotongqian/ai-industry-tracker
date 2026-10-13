import type { DataSource } from "@/data/types";

/**
 * Source slots. Live fetchers live in lib/ingest. `connected` describes the
 * pipeline, not whether the latest request succeeded — pages show that.
 */
export const sources: DataSource[] = [
  {
    id: "epoch",
    name: "Epoch AI",
    covers: "技术与算力趋势",
    cadence: "weekly",
    usedOn: "首页侧栏",
    module: "lib/ingest/trends.ts",
    plugIn:
      "读取 https://epoch.ai/data/notable_ai_models.csv ，只把条数、最近模型和训练算力估计写成 TrendNote。失败时回退 data/trends.ts。",
    connected: true,
    state: "已接入 · 公开 CSV",
  },
  {
    id: "artificial-analysis",
    name: "Artificial Analysis",
    covers: "模型指数、速度与价格",
    cadence: "weekly",
    usedOn: "模型",
    module: "lib/ingest/models.ts",
    plugIn:
      "设置 ARTIFICIAL_ANALYSIS_API_KEY 后请求 /api/v2/language/models/free，读取 Intelligence、Coding、Agentic、六项能力指数、中位速度与时延、输入输出价格和发布日。没有钥匙时不发请求，回退 data/models.ts 的示意行。",
    connected: false,
    state: "示意回退 · 需要 API key",
  },
  {
    id: "the-500",
    name: "The 500 Feed",
    covers: "多源 AI 新闻",
    cadence: "hourly",
    usedOn: "首页动态、机构页相关动态",
    module: "lib/ingest/news.ts",
    plugIn:
      "the500feed.com 没有公开 RSS 或 JSON。首页改为聚合 TechCrunch、The Verge、MIT Technology Review、OpenAI、Google AI、Hugging Face 的公开订阅，失败时回退 data/news.ts。",
    connected: false,
    state: "无公开订阅 · 首页用其他 RSS",
  },
  {
    id: "funding-tracker",
    name: "AI Funding Tracker",
    covers: "融资轮次",
    cadence: "daily",
    usedOn: "融资、机构页",
    module: "lib/ingest/funding.ts",
    plugIn:
      "先试 aifunding.me 的公开接口；不通则用 Data Cube 融资页链出的 /api/deals。美元金额才计入合计，估值不换算，证据摘录不转载。失败时回退 data/funding.ts。",
    connected: true,
    state: "已接入 · 公开 JSON",
  },
  {
    id: "futurex",
    name: "FutureX",
    covers: "公司名单与公开估值",
    cadence: "weekly",
    usedOn: "产业地图、机构档案",
    module: "lib/ingest/companies.ts",
    plugIn:
      "读取 futurex.capital/api/public/ai-companies（名称、赛道、估值、上市、代码、标语、产品、官网），和编辑样本合并。不足 200 家时用 YC 公开名单补位，并带上原文介绍、批次、阶段和团队人数。失败时只留 data/companies.ts。",
    connected: true,
    state: "已接入 · 公开 JSON",
  },
];
