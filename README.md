# 纬图

人工智能技术与产业聚合站（网页优先）。这一版是可运行的骨架：中文导航、五个栏目，以及放在 `data/` 里、可以整份替换的占位数据。

没有爬虫，没有 API key，也不请求下面列出的外部站点。

## 本地运行

需要 Node.js 20.9 或更高版本。

```bash
npm install
npm run dev
```

开发服务器在 [http://127.0.0.1:47231](http://127.0.0.1:47231)。

生产构建：

```bash
npm run build
npm start
```

`npm start` 使用 Next.js 默认端口 3000。

## 页面

| 路径 | 栏目 | 计划更新 | 这一版 |
| --- | --- | --- | --- |
| `/` | 首页动态 | 每小时 | 新闻卡片：头条、侧卡、列表。侧栏留了算力趋势槽位 |
| `/models` | 模型 | 每周 | 基准表：模型、机构、质量、速度、价格。表头可排序 |
| `/funding` | 融资 | 每日 | 轮次列表。未披露不填猜测金额 |
| `/landscape` | 产业地图 | 每周 | 40 家占位机构，按六类排成矩阵。可筛选、可搜索 |
| `/companies/[slug]` | 机构档案 | 随地图每周 | 名称、类别、融资与估值占位、相关模型 / 融资 / 动态 |

机构档案不在顶栏单独占一项，从首页动态、模型表、融资列表和产业地图点进去。未知 slug 会落到「地图上没有这家机构」。

界面上的「示意」「未接入」都是占位，不是事实数据。

## 目录

```text
app/                  路由（App Router）
  companies/[slug]/   机构档案
components/           页头、信息流、表格、地图
components/ui/        shadcn/ui（按钮、徽章）
data/                 占位数据，按源拆文件
lib/format.ts         金额、日期
```

数据模块：

| 文件 | 以后接入 |
| --- | --- |
| `data/news.ts` | The 500 Feed |
| `data/models.ts` | Artificial Analysis |
| `data/funding.ts` | AI Funding Tracker |
| `data/companies.ts` | FutureX（分类可继续手写） |
| `data/trends.ts` | Epoch AI |
| `data/sources.ts` | 源清单本身，保持手写 |

页面只读这些模块的字段名。换数据时替换数组内容，不必改栏目结构。

## 计划中的更新节奏

节奏目前写在界面和 `data/types.ts` 的 `CADENCE_LABEL` 里，没有定时任务。

| 栏目 | 节奏 | 以后怎么刷 |
| --- | --- | --- |
| 首页动态 | 每小时 | 刷新 `data/news.ts` |
| 融资 | 每日 | 刷新 `data/funding.ts` |
| 模型 | 每周 | 刷新 `data/models.ts` |
| 产业地图与机构档案 | 每周 | 刷新 `data/companies.ts` 的融资、估值、名单 |
| 首页「算力与趋势」 | 每周 | 刷新 `data/trends.ts` |

金额未知时用 `{ status: "undisclosed" }`，上市或隶属集团、暂时没有独立口径时用 `{ status: "pending", reason }`。不要把猜测写进 `mock`。

## 数据源以后怎么接

### Epoch AI — 技术与算力趋势

- 用在：首页侧栏「算力与趋势」
- 文件：`data/trends.ts`（`TrendNote`: `id`, `text`）
- 做法：把 Epoch 的公开趋势整理成短句数组。页面不直接请求 Epoch。每周替换一次。

### Artificial Analysis — 模型基准

- 用在：`/models`，以及机构页的「关联模型」
- 文件：`data/models.ts`（`ModelRow`）
- 字段：`name`，`organization`，`companySlug`，`quality`（0–100 指数），`speed`（tok/s），`price`（美元 / 百万 token）
- 做法：每周把基准映射成这些列。机构必须已经在 `data/companies.ts` 里，否则模块加载时会报未知 slug。

### The 500 Feed — AI 新闻

- 用在：首页动态，以及机构页「相关动态」
- 文件：`data/news.ts`（`NewsItem`）
- 字段：`title`，`summary`，`wire`，`desk`，`publishedAt`，`companySlug`
- 做法：按小时替换条目。能对应上机构就填 `companySlug`，机构页用它筛选。原文链接可以以后再加字段，这一版故意不外链。

### AI Funding Tracker — 融资

- 用在：`/funding`，以及机构页「融资条目」
- 文件：`data/funding.ts`（`FundingRound`）
- 字段：`companySlug`，`round`，`amount`，`announcedOn`，`investors`
- 做法：每日替换。投资人用源里的名称。金额不明就标未披露。

### FutureX — 估值与并购

- 用在：产业地图和 `/companies/[slug]`
- 文件：`data/companies.ts`（`Company`）
- 字段：`slug`，`name`，`nameEn`，`category`，`blurb`，`founded`，`hq`，`listing`，`domain`，`funding`，`valuation`
- 做法：每周用 FutureX 填写融资、估值和并购/上市状态。类别（基础模型、基础设施、智能体、垂直应用、数据与评测、芯片与算力）可以继续手写。样本从 40 家扩到 200+ 时，沿用同一个 `Company` 和 `generateStaticParams`。

## 技术栈

Next.js（App Router）+ TypeScript + Tailwind CSS + shadcn/ui。数据是仓库内的 TypeScript 模块，构建时可以静态生成机构页。
