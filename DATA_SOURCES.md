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

没有钥匙时不发请求。不设假钥匙。有钥匙时只读取免费档响应里实际有的字段：

- 质量：`evaluations.artificial_analysis_intelligence_index`
- 编码：`artificial_analysis_coding_index`
- 智能体：`artificial_analysis_agentic_index`
- 六项能力指数：金融会计、战略运营、法律、医疗、工程、经济
- 速度：`performance.median_output_tokens_per_second`（取整到 token/s）
- 时延：首 token、首个回答 token、端到端的中位数（秒）
- 价格：输入、输出、缓存命中、缓存写入的美元 / 百万 token。价格列是输入价
- 发布日：`release_date`
- 评测费用：`artificial_analysis_intelligence_index_cost` 的总费用和单任务费用
- 机构：`model_creator.name`，能对上地图才填 `companySlug`

响应里的 `intelligence_index_version` 写进页面说明。某个指数或价格缺失就留空，不补数。表上保留同时具备质量、速度和输入价、且质量最高的 24 行。本表名次、顶尖档（质量不低于最高分 3 分）和「高于 / 低于中位」由这 24 行算出，不是接口字段。

免费档响应没有、因此页面不展示：数学指数、开放度、多语言指数、单题分数（MMLU、GPQA 等）、混合价格、性能分位数、上下文长度、参数量、模态和供应商明细。

限制：官方接口必须有 key。本仓库默认走示意表。

失败或没有钥匙：回退 `data/models.ts`。示意行带上编码、智能体、能力指数、输出价和时延，只为把版面填满，整表标示意。发布日、缓存价和评测费用在示意行里留空，避免写成假日期或假费用。不把别的源的价格和示意质量拼在同一行。

## 融资 — AI Funding Tracker

先请求文档里的公开接口：

`GET https://aifunding.me/api/v1/rounds?limit=30`

匿名请求有时返回 403。失败后改用 Data Cube 融资页（https://www.datacubeai.space/funding）链出的公开 JSON：

`GET https://api-production-3ee5.up.railway.app/api/deals?deal_type=funding&limit=30`

只取 `deal_type=funding`。美元且 `amountValue` 为正数时记为 `reported`。其他币种保留原文，状态 `pending`，不换算。没有金额则 `undisclosed`。`hasEvidence === false` 或 `status === "legacy_unverified"` 的金额不采用，行上标「未经证据门」。`ai_extracted` 且 `hasEvidence === true` 标「证据已核」。不转载 `content` / `evidence` 摘录，只保留结构化字段，并链到 `sourceUrl`。

另外用到、且源里实际有的字段：

- 轮次：`stage`（aifunding）或 `round` / `roundCategory`（Data Cube）。已知英文轮次写成中文标签，认不出的保留原文。
- 投资人：名字。aifunding 的 `isLead === true` 才标领投。Data Cube 不区分领投。
- 估值：aifunding 的美元 `valuation` 按原值格式化；其他币种写成「未换算」。Data Cube 的 `valuationRaw` 按原文显示（`$1B+`、人民币都不换算）。`Undisclosed` 不当成估值。估值不计入美元合计。
- 金额原文：Data Cube 的 `amountRaw`，只在金额已被采用为美元时附在详情里。
- 公司页：aifunding 的 `companyProfileUrl`。Data Cube 没有这个字段。
- 条数：响应里的 `meta.total` 或 `total` 写在概览上，说明源里还有更多。页面仍只渲染最近 30 笔。
- 周次：`weekId` 和公布日不同才显示。

机构名能对上地图才填 `companySlug`，对不上仍列出，但不新造一家机构。概览里的合计、最大一轮和「已入地图」都只按这 30 笔计算。

公开接口给不出、因此页面不展示：投资人各自的出资金额、可转载的证据原文、可靠的行业分类（当前这批 `industry` 为空）、非美元兑美元的汇率、并购（已用 `deal_type=funding` 排除）、以及这 30 笔以外的轮次正文。aifunding.me 被 403 挡住时，也没有它文档里的领投标记、美元估值数字和公司页链接。

限制：Data Cube 的主机写在它自己的页面里，不是 aifunding.me 的域名，接口形态可能变。条目是对方从报道里抽出的，页面提示核对来源。最近 30 笔不是全市场。

失败：两路都空时回退 `data/funding.ts`。示意投资人仍标「示意」。示意账本里另有一笔未入地图、一笔未换算，用来把筛选和状态填上，金额旁仍是示意。

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

FutureX 加上 40 家编辑样本仍不足 200 时，从这份 JSON 里取标签含 `AI`、`Generative AI` 或 `Machine Learning`，且状态为 Active 或 Public 的公司，优先 `top_company`，补到 200 家为止。简介用 one-liner。融资和估值保持未披露。类别是AI纵横按标签归的，档案页会写明。

编辑样本里的 slug（例如 `deepseek`）始终保留，机构页不会因为合并而改地址。

失败：FutureX 和 YC 都失败时，地图只剩 `data/companies.ts`，并标示意。只失败一路时，另一路仍然上屏。

## 还没接上的

- The 500 Feed：无公开订阅。
- Artificial Analysis：无 key 则不请求。
- aifunding.me：当前 403。
- FutureX 的融资事件全文：公开 JSON 只有公司数据集，没有轮次数组。
