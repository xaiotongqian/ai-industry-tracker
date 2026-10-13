import type { Metadata } from "next";
import { DataMark } from "@/components/data-mark";
import { FundingLedger } from "@/components/funding-ledger";
import { FundingSummary } from "@/components/funding-summary";
import { PageFrame } from "@/components/page-frame";
import { PageIntro } from "@/components/page-intro";
import { loadCompanies } from "@/lib/ingest/companies";
import { loadFunding } from "@/lib/ingest/funding";

export const metadata: Metadata = {
  title: "融资",
  description: "AI 融资轮次：已披露美元、未换算币种和来源。计划每日更新。",
};

export default async function FundingPage() {
  const [funding, companies] = await Promise.all([loadFunding(), loadCompanies()]);
  const companyRefs = companies.items.map((company) => ({
    slug: company.slug,
    name: company.name,
    nameEn: company.nameEn,
  }));
  return (
    <PageFrame>
      <PageIntro
        section="funding"
        title="融资"
        cadence="daily"
        lede="每日更新。金额、估值和投资人按源里写明的来。美元以外不换算。点开一行，可以看到估值原文和证据标记。"
        mark={
          <DataMark
            origin={funding.origin}
            sourceName={funding.sourceName}
            sourceHref={funding.sourceHref}
            note={funding.note}
          />
        }
      />
      <FundingSummary
        rounds={funding.items}
        companies={companyRefs}
        origin={funding.origin}
        fetchedAt={funding.fetchedAt}
        sourceTotal={funding.sourceTotal}
      />
      <FundingLedger rounds={funding.items} companies={companyRefs} origin={funding.origin} />
    </PageFrame>
  );
}
