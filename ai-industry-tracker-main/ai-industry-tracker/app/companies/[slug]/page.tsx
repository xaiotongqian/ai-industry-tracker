import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyNote } from "@/components/empty-note";
import { Money } from "@/components/money";
import { getCategory } from "@/data/categories";
import { companies, getCompany } from "@/data/companies";
import { roundsForCompany } from "@/data/funding";
import { modelsForCompany } from "@/data/models";
import { newsForCompany } from "@/data/news";
import { formatDate, listingLabel, relativeLabel } from "@/lib/format";

export function generateStaticParams() {
  return companies.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/companies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompany(slug);
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
  const company = getCompany(slug);
  if (!company) notFound();

  const category = getCategory(company.category);
  const relatedNews = newsForCompany(company.slug);
  const relatedRounds = roundsForCompany(company.slug);
  const relatedModels = modelsForCompany(company.slug);

  return (
    <article>
      <nav aria-label="面包屑" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-primary">
              首页动态
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/landscape" className="hover:text-primary">
              产业地图
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{company.name}</li>
        </ol>
      </nav>

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
      </header>

      <dl className="mt-6 grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
        <Stat label="成立" value={`${company.founded}`} />
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
            估值槽位预留给 FutureX，每周替换。示意数字不是报价。
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl">外链</h2>
          <p className="mt-2 font-mono text-sm">{company.domain}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            域名只作占位展示，这一轮不跳转。核对后再接成链接。
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
          <EmptyNote>暂无占位基准行。接入模型源后，点名这家机构的行会出现在这里。</EmptyNote>
        ) : (
          <ul className="divide-y border border-border bg-card">
            {relatedModels.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
              >
                <span className="font-serif text-lg">{row.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  质量 {row.quality} · {row.speed} tok/s · ${row.price.toFixed(2)}/M
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
          <EmptyNote>暂无占位融资。每日源接上后，轮次会列在这里。</EmptyNote>
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
          <Link href="/" className="text-sm text-primary hover:underline">
            回到首页动态
          </Link>
        </div>
        {relatedNews.length === 0 ? (
          <EmptyNote>
            暂无关联动态。接入资讯源后，提及该机构的条目会出现在这里。
          </EmptyNote>
        ) : (
          <ul className="divide-y border-y border-border">
            {relatedNews.map((item) => (
              <li key={item.id} className="py-4">
                <p className="font-mono text-xs text-muted-foreground">
                  {item.desk} · {relativeLabel(item.publishedAt)}
                </p>
                <h3 className="mt-1 font-serif text-xl">{item.title}</h3>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-4 py-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-lg">{value}</dd>
    </div>
  );
}
