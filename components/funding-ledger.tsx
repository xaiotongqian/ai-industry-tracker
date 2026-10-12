import Link from "next/link";
import { Money } from "@/components/money";
import { requireCompany } from "@/data/companies";
import { disclosedFundingTotal, rounds } from "@/data/funding";
import { formatDate, formatUsd } from "@/lib/format";

export function FundingLedger() {
  const total = disclosedFundingTotal(rounds);
  const hidden = rounds.filter((round) => round.amount.status !== "mock").length;

  return (
    <div>
      <p className="mb-4 font-mono text-sm text-muted-foreground">
        示意金额合计 {formatUsd(total)}
        {hidden > 0 ? ` · ${hidden} 笔未计入（未披露）` : null}
      </p>
      <ol className="divide-y border border-border bg-card">
        {rounds.map((round) => {
          const company = requireCompany(round.companySlug);
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
                  <Link
                    href={`/companies/${company.slug}`}
                    className="hover:text-primary"
                  >
                    {company.name}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {round.round}
                  {company.name !== company.nameEn ? ` · ${company.nameEn}` : ""}
                </p>
                <p className="mt-1 text-sm leading-6">
                  投资人（示意）：{round.investors.join("、")}
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
