# AI纵横

人工智能技术与产业聚合站（网页优先）。中文导航、六个栏目。`lib/ingest/` 按栏目节奏拉取公开 RSS 和 JSON，失败时回退到 `data/` 里的示意数据。页面上「示意数据 · Demo」就是回退，不是事实。洞察和关于不走拉取。

没有内置 API key。Artificial Analysis 只有在环境变量 `ARTIFICIAL_ANALYSIS_API_KEY` 存在时才会请求。各源的端点、缓存和限制见 [DATA_SOURCES.md](./DATA_SOURCES.md)。

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
| `/` | 首页动态 | 每小时 | 公开 RSS 合成的头条、侧卡、列表。侧栏算力趋势读 Epoch CSV |
| `/models` | 模型 | 每周 | 质量、编码、智能体、速度与价格。没有 key 时仍是示意 |
| `/funding` | 融资 | 每日 | 公开轮次。美元以外不换算，未披露不填猜测金额 |
| `/landscape` | 产业地图 | 每周 | FutureX 公开公司，不足 200 家时用 YC 名单补位 |
| `/companies/[slug]` | 机构档案 | 随地图每周 | 名称、类别、估值、相关模型 / 融资 / 动态 |
| `/insights` | 洞察 | 编辑刊出 | 静态短文：发展态势、行业影响、投资视角。署名「AI纵横 观点」 |
| `/insights/[slug]` | 洞察正文 | 随洞察 | 单篇分析。投资视角含非投资建议声明 |
| `/about` | 关于 | 站点作者 | 刘永武（Will Liu）。简历事实、论文链接、邮箱与 ORCID |

机构档案不在顶栏单独占一项，从首页动态、模型表、融资列表和产业地图点进去。未知 slug 会落到「地图上没有这家机构」。洞察的未知 slug 会落到「没有这篇洞察」。

洞察是编辑写定的静态文章，放在 `data/insights.ts`，不经过 `lib/ingest/`，也不假装实时生成。投资视角声明不构成投资建议、证券推荐或收益承诺。关于页的经历、论文与奖项来自站点作者简历；公开联系方式是邮箱和 ORCID。

界面上的「示意数据 · Demo」表示这一栏目前是占位，不是事实数据。没有这行标记、金额旁也没有「示意」的数字，来自公开源。

## 目录

```text
app/                  路由（App Router）
  companies/[slug]/   机构档案
  insights/           洞察列表与正文
  about/              站点作者
components/           页头、信息流、表格、地图
components/ui/        shadcn/ui（按钮、徽章）
data/                 示意回退与洞察、作者介绍
lib/ingest/           拉取、缓存、归一化
lib/format.ts         金额、日期
```

拉取在 `lib/ingest/`，示意回退仍在 `data/`：

| 拉取 | 回退 |
| --- | --- |
| `lib/ingest/news.ts` | `data/news.ts` |
| `lib/ingest/models.ts` | `data/models.ts` |
| `lib/ingest/funding.ts` | `data/funding.ts` |
| `lib/ingest/companies.ts` | `data/companies.ts` |
| `lib/ingest/trends.ts` | `data/trends.ts` |

页面读的是拉取结果的字段名。换源时改 `lib/ingest/`，不必改栏目结构。

## 更新节奏

节奏写在 `next.config.ts` 的 `cacheLife` 和界面的 `CADENCE_LABEL` 里。没有单独的定时任务，靠 Next.js 的 `use cache` 在过期后重新拉取。

| 栏目 | 配置名 | 服务器重新拉取 |
| --- | --- | --- |
| 首页动态 | `news` | 1 小时 |
| 融资 | `funding` | 1 天 |
| 模型、产业地图、机构档案、算力趋势 | `weekly` | 7 天 |

金额未知时用 `{ status: "undisclosed" }`。公开报道但不是美元、或带「以上」时用 `{ status: "pending", reason }`。从源里抄来的美元用 `{ status: "reported", usd }`，界面不标示意。只有占位数字才用 `{ status: "mock", usd }`。

各源怎么接、哪里会失败，见 [DATA_SOURCES.md](./DATA_SOURCES.md)。

## 技术栈

Next.js（App Router，Cache Components）+ TypeScript + Tailwind CSS + shadcn/ui。机构页在构建时按当次拉到的名单静态生成。
