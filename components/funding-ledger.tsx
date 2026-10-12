import Link from "next/link";
import { Money } from "@/components/money";
import { disclosedFundingTotal } from "@/data/funding";
import type { Company, DataOrigin, FundingRound } from "@/data/types";
import { formatDate, formatUsd } from "@/lib/format";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

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
      <p className="text-sm text-muted-foreground">
        {origin === "demo" ? "示意金额合计" : "已披露美元合计"}
      </p>
      <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
        {formatUsd(total)}
      </p>
      {hidden > 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {hidden} 笔未计入（未披露或未换算）
        </p>
      ) : null}
      <ol className="mt-12 border-t border-border">
        {rounds.map((round) => {
          const company = round.companySlug ? bySlug.get(round.companySlug) : undefined;
          const name = company?.name ?? round.companyName ?? "未知机构";
          const investors =
            round.investors.length > 0 ? round.investors.join("、") : "未披露";
          return (
            <li key={round.id} className="border-b border-border py-7">
              <div className="flex items-baseline justify-between gap-6">
                <h2 className="min-w-0 text-2xl font-medium tracking-tight">
                  {company ? (
                    <Link
                      href={`/companies/${company.slug}`}
                      className={cn(focusRing, hoverFade)}
                    >
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                </h2>
                <p className="shrink-0 text-xl tabular-nums">
                  <Money value={round.amount} />
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                <time dateTime={round.announcedOn}>{formatDate(round.announcedOn)}</time>
                <span aria-hidden> · </span>
                {round.round}
                {company && company.name !== company.nameEn ? ` · ${company.nameEn}` : ""}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {origin === "demo" ? "投资人（示意）" : "投资人"}：{investors}
                {round.sourceUrl ? (
                  <>
                    <span aria-hidden> · </span>
                    <a
                      href={round.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={cn(
                        "text-link underline-offset-4 hover:underline",
                        focusRing,
                      )}
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
