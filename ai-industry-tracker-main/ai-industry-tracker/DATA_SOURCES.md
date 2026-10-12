# 数据源

拉取代码在 `lib/ingest/`。每一路都包在 `use cache` 里，失败就回退 `data/` 里的示意数组，页面标「示意数据 · Demo」。不发明 API key，也不把钥匙写进仓库。

缓存档位在 `next.config.ts`：

| 档位 | 用在 | stale / revalidate / expire |
| --- | --- | --- |
| `news` | 首页动态 | 1 小时 / 1 小时 / 1 天 |
| `funding` | 融资 | 1 天 / 1 天 / 7 天 |
| `weekly` | 模型、地图、机构、趋势 | 7 天 / 7 天 / 30 天 |

某一轮失败会被缓存到下一次 revalidate，不会在同一次渲染里反复打源。

## 首页动态 — 公开 RSS

The 500 Feed（https://www.the500feed.com/）没有发现可用的 RSS、Atom 或 JSON（`/rss`、`/feed`、`/api/feed` 均为 404）。首页改为并行读取这些公开订阅：

| 来源 | 地址 |
| --- | --- |
| TechCrunch AI | `https://techcrunch.com/category/artificial-intelligence/feed/` |
| The Verge AI | `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml` |
| MIT Technology Review AI | `https://www.technologyreview.com/topic/artificial-intelligence/feed/` |
| OpenAI News | `https://openai.com/news/rss.xml` |
| Google AI | `https://blog.google/technology/ai/rss/` |
| Hugging Face Blog | `https://huggingface.co/blog/feed.xml` |

做法：解析 RSS 2.0 和 Atom，只保留标题、短摘要（去掉 HTML，截到约 180 字）、时间和原文链接。按链接去重，取得最新 18 条。标题里能对上地图里的机构名时填 `companySlug`，对不上就留空，标题仍然链到原文。

限制：不是 The 500 的 500 路打分。摘要是订阅源给的导语，不是全文。分类（模型 / 资本 / 芯片等）是关键词归类。

失败：六路都空时回退 `data/news.ts`。

## 算力与趋势 — Epoch AI

- 地址：`https://epoch.ai/data/notable_ai_models.csv`
- 说明页：`https://epoch.ai/data/ai-models`
- 许可：Creative Commons Attribution。请署名 Epoch AI。

做法：读 notable 模型 CSV，写成四句以内的 `TrendNote`：有发表日期的条数、2026 年条数、最近一条的机构和模型名、2024 年以来训练算力估计的最大值。算力用表里的 FLOP 数，科学计数，空值不当作零。不另做「翻倍速度」之类的外推。

限制：没有公开 RSS。CSV 大约每天同步，页面按周拉。最近的模型经常还没有算力估计。

失败：回退 `data/trends.ts`。

Epoch 这张表没有质量、速度、价格，所以不拿来填模型页。

## 模型 — Artificial Analysis

- 文档：`https://artificialanalysis.ai/data-api/docs`
- 免费列表：`GET https://artificialanalysis.ai/api/v2/language/models/free`
- 请求头：`x-api-key`
- 环境变量：`ARTIFICIAL_ANALYSIS_API_KEY`

没有钥匙时不发请求。不设假钥匙。有钥匙时读取 Intelligence Index、输出 token/s 中位数、输入 token 的美元 / 百万，留下指数最高的 24 行。免费档不提供混合价格，所以价格列在实时状态下标明是输入价。

限制：官方接口必须有 key。本仓库默认走示意表。

失败或没有钥匙：回退 `data/models.ts`，三列都标示意，不把别的源的价格和示意质量拼在同一行。

## 融资 — AI Funding Tracker

先请求文档里的公开接口：

`GET https://aifunding.me/api/v1/rounds?limit=30`

此环境对该域名返回 403，没有匿名可读的 JSON。失败后改用 Data Cube 融资页（https://www.datacubeai.space/funding）链出的公开 JSON：

`GET https://api-production-3ee5.up.railway.app/api/deals?deal_type=funding&limit=30`

只取 `deal_type=funding`。美元且 `amountValue` 为正数时记为 `reported`。其他币种保留原文，状态 `pending`，不换算。没有金额则 `undisclosed`。`hasEvidence === false` 的金额不采用。不转载 `content` / `evidence` 摘录，只保留结构化字段，并链到 `sourceUrl`。

机构名能对上地图才填 `companySlug`，对不上仍列出，但不新造一家机构。

限制：Data Cube 的主机写在它自己的页面里，不是 aifunding.me 的域名，接口形态可能变。条目是对方从报道里抽出的，页面提示核对来源。最近 30 笔不是全市场。

失败：两路都空时回退 `data/funding.ts`。示意投资人仍标「示意」。

## 产业地图与机构档案 — FutureX，不足则 YC

### FutureX Capital

- 地址：`https://futurex.capital/api/public/ai-companies`
- 说明：`https://futurex.capital/data`
- 许可：CC BY 4.0。署名：FutureX Capital 天际资本 — https://futurex.capital

约 120 家公司。字段用到：中英文名、赛道、国家、成立年、`reportedValuation`、是否上市、官网、tagline、主要产品。

估值只在能确定是美元整数倍（`$350M`、`$1.5B`、`$1.8T`）时写成 `reported`。`$10B+` 写成「不低于」，港币和人民币不换算，`N/A` 和「数十亿」这种含糊说法保持未披露。已有编辑样本若对上名字，只替换估值和官网，不改写中文简介和类别。对不上的按赛道映射进六类后追加。

没有单独的轮次接口。累计融资对新增公司保持未披露，不把估值当成融资额。

### YC 公开名单（补到约 200 家）

- 地址：`https://yc-oss.github.io/api/companies/all.json`

FutureX 加上 40 家编辑样本仍不足 200 时，从这份 JSON 里取标签含 `AI`、`Generative AI` 或 `Machine Learning`，且状态为 Active 或 Public 的公司，优先 `top_company`，补到 200 家为止。简介用 one-liner。融资和估值保持未披露。类别是纬图按标签归的，档案页会写明。

编辑样本里的 slug（例如 `deepseek`）始终保留，机构页不会因为合并而改地址。

失败：FutureX 和 YC 都失败时，地图只剩 `data/companies.ts`，并标示意。只失败一路时，另一路仍然上屏。

## 还没接上的

- The 500 Feed：无公开订阅。
- Artificial Analysis：无 key 则不请求。
- aifunding.me：当前 403。
- FutureX 的融资事件全文：公开 JSON 只有公司数据集，没有轮次数组。
