import Link from "next/link";
import { Money } from "@/components/money";
import { disclosedFundingTotal } from "@/data/funding";
import type { Company, DataOrigin, FundingRound } from "@/data/types";
import { formatDate, formatUsd } from "@/lib/format";

export function FundingLedger({
  rounds,
  companies,
  origin,
}: {
  rounds: FundingRound[];
  companies: Company[];
  origin: DataOrigin;
}) {
  const total = disclosedFundingTotal(rounds);
  const hidden = rounds.filter(
    (round) => round.amount.status !== "mock" && round.amount.status !== "reported",
  ).length;
  const bySlug = new Map(companies.map((company) => [company.slug, company]));

  return (
    <div>
      <p className="mb-4 font-mono text-sm text-muted-foreground">
        {origin === "demo" ? "示意金额合计" : "已披露美元合计"} {formatUsd(total)}
        {hidden > 0 ? ` · ${hidden} 笔未计入（未披露或未换算）` : null}
      </p>
      <ol className="border-t border-border">
        {rounds.map((round) => {
          const company = round.companySlug ? bySlug.get(round.companySlug) : undefined;
          const name = company?.name ?? round.companyName ?? "未知机构";
          const investors =
            round.investors.length > 0 ? round.investors.join("、") : "未披露";
          return (
            <li key={round.id} className="border-b border-border py-3">
              <p className="font-mono text-[11px] text-muted-foreground">
                <time dateTime={round.announcedOn}>{formatDate(round.announcedOn)}</time>
                <span aria-hidden> · </span>
                {round.round}
                {company && company.name !== company.nameEn ? ` · ${company.nameEn}` : ""}
              </p>
              <div className="mt-1 flex items-baseline justify-between gap-4">
                <h2 className="min-w-0 font-serif text-xl leading-snug">
                  {company ? (
                    <Link
                      href={`/companies/${company.slug}`}
                      className="hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                </h2>
                <p className="shrink-0 font-mono text-lg">
                  <Money value={round.amount} />
                </p>
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                  {origin === "demo" ? "投资人（示意）" : "投资人"}：{investors}
                  {round.sourceUrl ? (
                    <>
                      {" · "}
                      <a
                        href={round.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-primary hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                      >
                        来源
                      </a>
                    </>
                  ) : null}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
