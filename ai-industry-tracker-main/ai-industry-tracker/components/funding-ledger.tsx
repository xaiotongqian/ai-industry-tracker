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
      <ol className="divide-y border border-border bg-card">
        {rounds.map((round) => {
          const company = round.companySlug ? bySlug.get(round.companySlug) : undefined;
          const name = company?.name ?? round.companyName ?? "未知机构";
          return (
            <li
              key={round.id}
              className="grid gap-2 px-4 py-4 sm:grid-cols-[9.5rem_minmax(0,1fr)_auto] sm:items-start sm:gap-4"
            >
              <time
                dateTime={round.announcedOn}
                className="font-mono text-xs text-muted-foreground"
              >
                {formatDate(round.announcedOn)}
              </time>
              <div>
                <h2 className="font-serif text-xl leading-snug">
                  {company ? (
                    <Link href={`/companies/${company.slug}`} className="hover:text-primary">
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {round.round}
                  {company && company.name !== company.nameEn ? ` · ${company.nameEn}` : ""}
                </p>
                <p className="mt-1 text-sm leading-6">
                  {origin === "demo" ? "投资人（示意）" : "投资人"}：
                  {round.investors.length > 0 ? round.investors.join("、") : "未披露"}
                  {round.sourceUrl ? (
                    <>
                      {" · "}
                      <a
                        href={round.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-primary hover:underline"
                      >
                        来源
                      </a>
                    </>
                  ) : null}
                </p>
              </div>
              <p className="font-mono text-lg sm:text-right">
                <Money value={round.amount} />
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
