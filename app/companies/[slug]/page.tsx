import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyNote } from "@/components/empty-note";
import { Money } from "@/components/money";
import { PageFrame } from "@/components/page-frame";
import { SectionIndex } from "@/components/section-index";
import { getCategory } from "@/data/categories";
import { loadCompanies } from "@/lib/ingest/companies";
import { loadFunding } from "@/lib/ingest/funding";
import { loadModels } from "@/lib/ingest/models";
import { loadNews } from "@/lib/ingest/news";
import { formatDate, listingLabel, relativeLabel } from "@/lib/format";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const { items } = await loadCompanies();
  return items.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/companies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { items } = await loadCompanies();
  const company = items.find((item) => item.slug === slug);
  if (!company) {
    return { title: "未找到机构" };
  }
  return {
    title: company.name,
    description: company.blurb,
  };
}

export default async function CompanyPage({
  params,
}: PageProps<"/companies/[slug]">) {
  const { slug } = await params;
  const [companies, news, funding, models] = await Promise.all([
    loadCompanies(),
    loadNews(),
    loadFunding(),
    loadModels(),
  ]);
  const company = companies.items.find((item) => item.slug === slug);
  if (!company) notFound();

  const category = getCategory(company.category);
  const relatedNews = news.items.filter((item) => item.companySlug === company.slug);
  const relatedRounds = funding.items.filter((item) => item.companySlug === company.slug);
  const relatedModels = models.items.filter((item) => item.companySlug === company.slug);

  return (
    <PageFrame>
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
          {company.profileNote ? (
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              {company.profileNote}
            </p>
          ) : null}
          <SectionIndex current="company" />
        </header>

        <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-border pt-10 sm:grid-cols-4">
          <Stat label="成立" value={company.founded == null ? "未知" : `${company.founded}`} />
          <Stat label="总部" value={company.hq} />
          <Stat label="上市状态" value={listingLabel(company.listing)} />
          <div>
            <dt className="text-sm text-muted-foreground">累计融资</dt>
            <dd className="mt-2 text-2xl font-medium tracking-tight">
              <Money value={company.funding} />
            </dd>
          </div>
        </dl>

        <section className="mt-16 grid gap-12 border-t border-border pt-12 sm:grid-cols-2">
          <div>
            <h2 className="text-sm text-muted-foreground">估值</h2>
            <p className="mt-3 text-4xl font-semibold tracking-tight">
              <Money value={company.valuation} />
            </p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              {valuationNote(company.valuation.status)}
            </p>
          </div>
          <div>
            <h2 className="text-sm text-muted-foreground">外链</h2>
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer noopener"
                className={cn(
                  "mt-3 inline-block text-lg text-link underline-offset-4 hover:underline",
                  focusRing,
                )}
              >
                {company.domain}
              </a>
            ) : (
              <p className="mt-3 text-lg">{company.domain}</p>
            )}
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              {company.website
                ? "官网来自公开名单。没有标成链接的域名仍只是展示。"
                : "域名只作展示，这一轮不跳转。"}
            </p>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight">关联模型</h2>
            <Link
              href="/models"
              className={cn("text-sm text-link underline-offset-4 hover:underline", focusRing)}
            >
              全部基准
            </Link>
          </div>
          {relatedModels.length === 0 ? (
            <EmptyNote>暂无关联模型。</EmptyNote>
          ) : (
            <ul className="border-t border-border">
              {relatedModels.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border py-5"
                >
                  <span className="text-lg font-medium tracking-tight">{row.name}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    质量 {Number.isInteger(row.quality) ? row.quality : row.quality.toFixed(1)} ·{" "}
                    {Math.round(row.speed)} tok/s · ${row.price.toFixed(2)}/M
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-20">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight">融资条目</h2>
            <Link
              href="/funding"
              className={cn("text-sm text-link underline-offset-4 hover:underline", focusRing)}
            >
              全部融资
            </Link>
          </div>
          {relatedRounds.length === 0 ? (
            <EmptyNote>暂无融资条目。</EmptyNote>
          ) : (
            <ul className="border-t border-border">
              {relatedRounds.map((round) => (
                <li
                  key={round.id}
                  className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border py-5"
                >
                  <span>
                    <span className="text-lg font-medium tracking-tight">{round.round}</span>
                    <span className="ml-3 text-sm text-muted-foreground">
                      {formatDate(round.announcedOn)}
                    </span>
                  </span>
                  <Money value={round.amount} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-20">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight">相关动态</h2>
            <Link
              href="/"
              className={cn("text-sm text-link underline-offset-4 hover:underline", focusRing)}
            >
              回到动态
            </Link>
          </div>
          {relatedNews.length === 0 ? (
            <EmptyNote>暂无关联动态。提及该机构的条目会出现在这里。</EmptyNote>
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
      </article>
    </PageFrame>
  );
}

function valuationNote(status: "mock" | "reported" | "undisclosed" | "pending"): string {
  switch (status) {
    case "mock":
      return "示意数字不是报价。";
    case "reported":
      return "取自 FutureX Capital 公开数据集里的报道口径，不是AI纵横测算。";
    case "pending":
      return "公开报道没有换成美元，原文写在数字旁边。";
    case "undisclosed":
      return "公开数据集里没有可引用的估值。";
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-2xl font-medium tracking-tight">{value}</dd>
    </div>
  );
}
