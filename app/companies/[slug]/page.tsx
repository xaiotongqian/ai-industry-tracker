import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyNote } from "@/components/empty-note";
import { Money } from "@/components/money";
import { SectionIndex } from "@/components/section-index";
import { getCategory } from "@/data/categories";
import { loadCompanies } from "@/lib/ingest/companies";
import { loadFunding } from "@/lib/ingest/funding";
import { loadModels } from "@/lib/ingest/models";
import { loadNews } from "@/lib/ingest/news";
import { formatDate, listingLabel, relativeLabel } from "@/lib/format";

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
    <article>
      <Breadcrumbs
        className="mb-6"
        items={[
          { href: "/", label: "动态" },
          { href: "/landscape", label: "产业地图" },
          { label: company.name },
        ]}
      />

      <header className="border-b border-foreground/80 pb-6">
        <p className="font-mono text-[11px] tracking-[0.18em] text-primary">
          {category.label} · {category.en}
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
          {company.name}
        </h1>
        {company.name !== company.nameEn ? (
          <p className="mt-2 text-lg text-muted-foreground">{company.nameEn}</p>
        ) : null}
        <p className="mt-4 max-w-2xl text-base leading-7">{company.blurb}</p>
        {company.profileNote ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {company.profileNote}
          </p>
        ) : null}
        <SectionIndex current="company" />
      </header>

      <dl className="mt-6 grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
        <Stat label="成立" value={company.founded == null ? "未知" : `${company.founded}`} />
        <Stat label="总部" value={company.hq} />
        <Stat label="上市状态" value={listingLabel(company.listing)} />
        <div className="bg-card px-4 py-4">
          <dt className="text-xs text-muted-foreground">累计融资</dt>
          <dd className="mt-1 text-lg">
            <Money value={company.funding} />
          </dd>
        </div>
      </dl>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">估值</h2>
          <p className="mt-2 text-2xl">
            <Money value={company.valuation} />
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {valuationNote(company.valuation.status)}
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl">外链</h2>
          {company.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 inline-block font-mono text-sm text-primary hover:underline"
            >
              {company.domain}
            </a>
          ) : (
            <p className="mt-2 font-mono text-sm">{company.domain}</p>
          )}
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {company.website
              ? "官网来自公开名单。没有标成链接的域名仍只是展示。"
              : "域名只作展示，这一轮不跳转。"}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-2xl">关联模型</h2>
          <Link href="/models" className="text-sm text-primary hover:underline">
            全部基准
          </Link>
        </div>
        {relatedModels.length === 0 ? (
          <EmptyNote>暂无关联模型。</EmptyNote>
        ) : (
          <ul className="divide-y border border-border bg-card">
            {relatedModels.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
              >
                <span className="font-serif text-lg">{row.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  质量 {Number.isInteger(row.quality) ? row.quality : row.quality.toFixed(1)} ·{" "}
                  {Math.round(row.speed)} tok/s · ${row.price.toFixed(2)}/M
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-2xl">融资条目</h2>
          <Link href="/funding" className="text-sm text-primary hover:underline">
            全部融资
          </Link>
        </div>
        {relatedRounds.length === 0 ? (
          <EmptyNote>暂无融资条目。</EmptyNote>
        ) : (
          <ul className="divide-y border border-border bg-card">
            {relatedRounds.map((round) => (
              <li
                key={round.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
              >
                <span>
                  <span className="font-serif text-lg">{round.round}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {formatDate(round.announcedOn)}
                  </span>
                </span>
                <Money value={round.amount} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-2xl">相关动态</h2>
          <Link
            href="/"
            className="text-sm text-primary hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            回到动态
          </Link>
        </div>
        {relatedNews.length === 0 ? (
          <EmptyNote>
            暂无关联动态。提及该机构的条目会出现在这里。
          </EmptyNote>
        ) : (
          <ul className="divide-y border-y border-border">
            {relatedNews.map((item) => (
              <li key={item.id} className="py-4">
                <p className="font-mono text-xs text-muted-foreground">
                  {item.wire} · {item.desk} · {relativeLabel(item.publishedAt, news.fetchedAt)}
                </p>
                <h3 className="mt-1 font-serif text-xl">
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="hover:text-primary"
                    >
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {item.summary}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}

function valuationNote(status: "mock" | "reported" | "undisclosed" | "pending"): string {
  switch (status) {
    case "mock":
      return "示意数字不是报价。";
    case "reported":
      return "取自 FutureX Capital 公开数据集里的报道口径，不是纬图测算。";
    case "pending":
      return "公开报道没有换成美元，原文写在数字旁边。";
    case "undisclosed":
      return "公开数据集里没有可引用的估值。";
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-4 py-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-lg">{value}</dd>
    </div>
  );
}
