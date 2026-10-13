import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyNote } from "@/components/empty-note";
import { Money } from "@/components/money";
import { SectionIndex } from "@/components/section-index";
import { getCategory } from "@/data/categories";
import type { Company, FundingRound, Loaded, ModelRow, NewsItem } from "@/data/types";
import {
  formatBatch,
  formatDate,
  formatIndex,
  formatSeconds,
  formatStage,
  formatTokenPrice,
  listingLabel,
  relativeLabel,
} from "@/lib/format";
import { investorBrief } from "@/lib/funding-stats";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function CompanyDossier({
  company,
  peers,
  news,
  funding,
  models,
}: {
  company: Company;
  peers: Company[];
  news: Loaded<NewsItem>;
  funding: Loaded<FundingRound>;
  models: Loaded<ModelRow>;
}) {
  const category = getCategory(company.category);
  const relatedNews = news.items.filter((item) => item.companySlug === company.slug);
  const relatedRounds = funding.items.filter((item) => item.companySlug === company.slug);
  const relatedModels = models.items.filter((item) => item.companySlug === company.slug);
  const facts = identityFacts(company);
  const tagline = company.tagline && company.tagline !== company.blurb ? company.tagline : null;
  const products =
    company.products && company.products !== company.blurb && company.products !== company.tagline
      ? company.products
      : null;

  return (
    <article>
      <Breadcrumbs
        items={[
          { href: "/", label: "动态" },
          { href: "/landscape", label: "产业地图" },
          { label: company.name },
        ]}
      />

      <header className="mt-12">
        <p className="text-sm text-muted-foreground">
          {category.label}
          <span aria-hidden> · </span>
          {category.en}
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
          {company.name}
        </h1>
        {company.name !== company.nameEn ? (
          <p className="mt-3 text-xl text-muted-foreground">{company.nameEn}</p>
        ) : null}
        <p className="mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">{company.blurb}</p>
        {tagline ? (
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            公开标语 · {tagline}
          </p>
        ) : null}
        {products ? (
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            主要产品 · {products}
          </p>
        ) : null}
        {company.profileNote ? (
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            {company.profileNote}
          </p>
        ) : null}
        <SectionIndex current="company" />
      </header>

      <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-border pt-10 sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-sm text-muted-foreground">{fact.label}</dt>
            <dd className="mt-2 text-2xl font-medium tracking-tight text-balance break-words">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
      {company.teamSize != null ? (
        <p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground">
          团队人数来自公开名单，不是重新统计。
        </p>
      ) : null}
      {company.tags && company.tags.length > 0 ? (
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          标签 · {company.tags.slice(0, 8).join("、")}
          {company.tags.length > 8 ? " 等" : ""}
        </p>
      ) : null}

      <section className="mt-16 grid gap-12 border-t border-border pt-12 sm:grid-cols-3">
        <div>
          <h2 className="text-sm text-muted-foreground">估值</h2>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-balance">
            <Money value={company.valuation} />
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            {valuationNote(company)}
          </p>
        </div>
        <div>
          <h2 className="text-sm text-muted-foreground">累计融资</h2>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-balance">
            <Money value={company.funding} />
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            {fundingNote(company)}
          </p>
        </div>
        <div>
          <h2 className="text-sm text-muted-foreground">外链</h2>
          <div className="mt-3 flex flex-col items-start gap-3">
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer noopener"
                className={cn(
                  "inline-flex min-h-11 items-center text-lg text-link underline-offset-4 hover:underline",
                  focusRing,
                )}
              >
                {company.domain}
              </a>
            ) : (
              <p className="text-lg">{company.domain}</p>
            )}
            {company.profileUrl ? (
              <a
                href={company.profileUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={cn(
                  "inline-flex min-h-11 items-center text-lg text-link underline-offset-4 hover:underline",
                  focusRing,
                )}
              >
                YC 公司页
              </a>
            ) : null}
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">{linkNote(company)}</p>
        </div>
      </section>

      {company.listSource === "yc" ? (
        <section className="mt-20">
          <h2 className="text-3xl font-semibold tracking-tight">名单介绍</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {company.description ? "原文照录，没有译成中文。" : "YC 名单没有更长的介绍，这里不另写。"}
          </p>
          {company.description ? <ListDescription text={company.description} /> : null}
        </section>
      ) : null}

      <section className="mt-20">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight">关联模型</h2>
          <Link
            href="/models"
            className={cn(
              "inline-flex min-h-11 items-center text-sm text-link underline-offset-4 hover:underline",
              focusRing,
            )}
          >
            全部基准
          </Link>
        </div>
        {relatedModels.length === 0 ? (
          <EmptyNote>{emptyModels(company)}</EmptyNote>
        ) : (
          <>
            {models.origin === "demo" ? (
              <p className="mb-4 text-sm text-muted-foreground">以下刻度为示意，不是测量。</p>
            ) : null}
            <ul className="border-t border-border">
              {relatedModels.map((row) => {
                const secondary = modelSecondary(row);
                return (
                  <li key={row.id} className="border-b border-border py-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <span className="text-lg font-medium tracking-tight">{row.name}</span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {modelPrimary(row)}
                      </span>
                    </div>
                    {secondary ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{secondary}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <section className="mt-20">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight">融资条目</h2>
          <Link
            href="/funding"
            className={cn(
              "inline-flex min-h-11 items-center text-sm text-link underline-offset-4 hover:underline",
              focusRing,
            )}
          >
            全部融资
          </Link>
        </div>
        {relatedRounds.length === 0 ? (
          <EmptyNote>{emptyRounds(company)}</EmptyNote>
        ) : (
          <>
            {company.funding.status === "mock" ? (
              <p className="mb-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                累计融资仍是示意。下面的单笔来自融资栏目，两边没有加总。
              </p>
            ) : null}
            {company.funding.status === "undisclosed" ? (
              <p className="mb-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                单笔没有加总成累计融资。
              </p>
            ) : null}
            <ul className="border-t border-border">
            {relatedRounds.map((round) => (
              <li key={round.id} className="border-b border-border py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span>
                    <span className="text-lg font-medium tracking-tight">{round.round}</span>
                    <span className="ml-3 text-sm text-muted-foreground">
                      {formatDate(round.announcedOn)}
                    </span>
                  </span>
                  <Money value={round.amount} />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {investorBrief(round, funding.origin)}
                  {round.sourceUrl ? (
                    <>
                      <span aria-hidden> · </span>
                      <a
                        href={round.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={cn("text-link underline-offset-4 hover:underline", focusRing)}
                      >
                        {round.sourceName || "来源"}
                      </a>
                    </>
                  ) : round.profileUrl ? (
                    <>
                      <span aria-hidden> · </span>
                      <a
                        href={round.profileUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={cn("text-link underline-offset-4 hover:underline", focusRing)}
                      >
                        源站公司页
                      </a>
                    </>
                  ) : null}
                </p>
              </li>
            ))}
            </ul>
          </>
        )}
      </section>

      <section className="mt-20">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight">相关动态</h2>
          <Link
            href="/"
            className={cn(
              "inline-flex min-h-11 items-center text-sm text-link underline-offset-4 hover:underline",
              focusRing,
            )}
          >
            回到动态
          </Link>
        </div>
        {relatedNews.length === 0 ? (
          <EmptyNote>这一轮动态的标题没有提到这家机构。</EmptyNote>
        ) : (
          <ul className="border-t border-border">
            {relatedNews.map((item) => (
              <li key={item.id} className="border-b border-border py-6">
                <h3 className="text-xl font-medium tracking-tight">
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={cn(focusRing, hoverFade)}
                    >
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.wire} · {item.desk} · {relativeLabel(item.publishedAt, news.fetchedAt)}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {peers.length > 0 ? (
        <section className="mt-20">
          <h2 className="text-3xl font-semibold tracking-tight">同类别</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {category.label}里的其他机构，按地图顺序。
          </p>
          <ul className="mt-6 border-t border-border">
            {peers.map((peer) => (
              <li key={peer.slug} className="border-b border-border py-5">
                <Link
                  href={`/companies/${peer.slug}`}
                  className={cn("text-lg font-medium tracking-tight", focusRing, hoverFade)}
                >
                  {peer.name}
                </Link>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{peer.blurb}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

function identityFacts(company: Company): { label: string; value: string }[] {
  const facts: { label: string; value: string }[] = [
    { label: "成立", value: company.founded == null ? "未标注" : String(company.founded) },
    { label: "总部", value: company.hq || "未标注" },
    { label: "上市状态", value: listingLabel(company.listing) },
  ];
  if (company.ticker) facts.push({ label: "代码", value: company.ticker });
  if (company.sectorLabel) facts.push({ label: "来源分类", value: company.sectorLabel });
  if (company.batch) facts.push({ label: "批次", value: formatBatch(company.batch) });
  if (company.stage) facts.push({ label: "阶段", value: formatStage(company.stage) });
  if (company.teamSize != null) facts.push({ label: "团队人数", value: String(company.teamSize) });
  return facts;
}

function ListDescription({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const body = paragraphs.length > 0 ? paragraphs : [text];
  const short = body.length === 1 && body[0].length <= 480;
  if (short) {
    return <p className="mt-6 max-w-2xl text-base leading-7">{body[0]}</p>;
  }
  return (
    <details className="group mt-6 max-w-2xl">
      <summary
        className={cn(
          "cursor-pointer list-none text-sm text-link [&::-webkit-details-marker]:hidden",
          focusRing,
        )}
      >
        <span className="inline-flex min-h-11 items-center group-open:hidden">展开名单介绍</span>
        <span className="hidden min-h-11 items-center group-open:inline-flex">收起名单介绍</span>
      </summary>
      <div className="mt-4 space-y-4">
        {body.map((paragraph, index) => (
          <p key={index} className="text-base leading-7">
            {paragraph}
          </p>
        ))}
      </div>
    </details>
  );
}

function modelPrimary(row: ModelRow): string {
  return [`质量 ${formatIndex(row.quality)}`, `${Math.round(row.speed)} tok/s`, `${formatTokenPrice(row.price)}/M`].join(
    " · ",
  );
}

function modelSecondary(row: ModelRow): string | null {
  const parts = [
    row.coding != null ? `编码 ${formatIndex(row.coding)}` : null,
    row.agentic != null ? `智能体 ${formatIndex(row.agentic)}` : null,
    row.outputPrice != null ? `输出 ${formatTokenPrice(row.outputPrice)}` : null,
    row.releaseDate ? formatDate(row.releaseDate) : null,
    row.timeToFirstToken != null ? `首 token ${formatSeconds(row.timeToFirstToken)}` : null,
  ].filter((part): part is string => part != null);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function valuationNote(company: Company): string {
  switch (company.valuation.status) {
    case "mock":
      return "示意数字不是报价。";
    case "reported":
      return "取自 FutureX Capital 公开数据集里的报道口径，不是AI纵横测算。";
    case "pending":
      return "没有可用的美元数字，说明留在上面。";
    case "undisclosed":
      if (company.listSource === "yc") return "YC 公开名单没有估值。";
      if (company.listSource === "futurex") return "公开数据集里没有可引用的估值。";
      return "没有可引用的估值。";
  }
}

function fundingNote(company: Company): string {
  switch (company.funding.status) {
    case "mock":
      return "示意数字不是报价。";
    case "reported":
      return "取自公开报道的美元金额，不是AI纵横测算。";
    case "pending":
      return "没有可用的美元数字，说明留在上面。";
    case "undisclosed":
      if (company.listSource === "yc") return "YC 公开名单没有融资总额。";
      if (company.listSource === "futurex") {
        return "FutureX 数据集没有累计融资，不把估值当成融资额。";
      }
      return "没有可引用的累计融资。";
  }
}

function linkNote(company: Company): string {
  if (company.website && company.profileUrl) {
    return "官网和 YC 公司页都来自公开名单。";
  }
  if (company.website) return "官网来自公开名单。没有标成链接的域名仍只是展示。";
  if (company.profileUrl) return "没有单独的官网链接。YC 公司页来自公开名单。";
  return "域名只作展示，这一轮不跳转。";
}

function emptyModels(company: Company): string {
  if (company.listSource === "yc") {
    return "基准表里没有这家机构。YC 名单本身也不提供模型指数。";
  }
  return "基准表里没有标到这家机构的模型。";
}

function emptyRounds(company: Company): string {
  if (company.funding.status === "undisclosed") {
    if (company.listSource === "yc") return "没有对上的单笔轮次。YC 名单也没有累计融资。";
    if (company.listSource === "futurex") return "没有对上的单笔轮次。FutureX 也没有累计融资。";
    return "没有对上的单笔轮次，累计融资也没有公开总额。";
  }
  if (company.funding.status === "pending") return "没有对上的单笔轮次。累计融资仍停在待接入。";
  return "没有对上的单笔轮次。上面的累计数字不是逐笔列表。";
}
