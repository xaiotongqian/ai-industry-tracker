import type { DataSource } from "@/data/types";

/**
 * Planned inputs. Nothing here is fetched.
 * Keep this list aligned with the README section "数据源以后怎么接".
 */
export const sources: DataSource[] = [
  {
    id: "epoch",
    name: "Epoch AI",
    covers: "技术与算力趋势",
    cadence: "weekly",
    usedOn: "首页侧栏",
    module: "data/trends.ts",
    plugIn:
      "把 Epoch 的公开趋势笔记整理成 TrendNote 数组，替换 data/trends.ts。首页侧栏只读这个模块，不直接请求 Epoch。",
  },
  {
    id: "artificial-analysis",
    name: "Artificial Analysis",
    covers: "模型质量、速度、价格",
    cadence: "weekly",
    usedOn: "模型",
    module: "data/models.ts",
    plugIn:
      "把基准结果映射为 ModelRow（name、organization、quality、speed、price）。质量用 0–100 的指数，速度用 tok/s，价格用美元 / 百万 token。每周替换 data/models.ts。",
  },
  {
    id: "the-500",
    name: "The 500 Feed",
    covers: "多源 AI 新闻",
    cadence: "hourly",
    usedOn: "首页动态、机构页相关动态",
    module: "data/news.ts",
    plugIn:
      "把 500+ 来源的条目整理成 NewsItem，并尽量填上 companySlug，机构页才能串起相关动态。标题、摘要、时间和原文链接替换 data/news.ts，按小时刷新。",
  },
  {
    id: "funding-tracker",
    name: "AI Funding Tracker",
    covers: "融资轮次",
    cadence: "daily",
    usedOn: "融资、机构页",
    module: "data/funding.ts",
    plugIn:
      "把每日轮次映射为 FundingRound。金额未知时用 status: undisclosed，不要填猜测数字。投资人用源里的原名。替换 data/funding.ts。",
  },
  {
    id: "futurex",
    name: "FutureX",
    covers: "约 120 家公司的估值与并购",
    cadence: "weekly",
    usedOn: "产业地图、机构档案",
    module: "data/companies.ts",
    plugIn:
      "用 FutureX 的估值、融资和并购状态填 Company.funding / Company.valuation。分类（基础模型、基础设施、智能体、垂直应用等）仍可手写维护。地图样本从约 40 家扩到 200+ 时，沿用同一 Company 形状和 /companies/[slug]。",
  },
];
