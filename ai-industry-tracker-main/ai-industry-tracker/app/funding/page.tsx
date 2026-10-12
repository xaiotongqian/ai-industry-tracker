import type { Metadata } from "next";
import { DataMark } from "@/components/data-mark";
import { FundingLedger } from "@/components/funding-ledger";
import { PageIntro } from "@/components/page-intro";
import { loadCompanies } from "@/lib/ingest/companies";
import { loadFunding } from "@/lib/ingest/funding";

export const metadata: Metadata = {
  title: "融资",
  description: "AI 融资轮次，计划每日更新。",
};

export default async function FundingPage() {
  const [funding, companies] = await Promise.all([loadFunding(), loadCompanies()]);
  return (
    <>
      <PageIntro
        index="03  /  融资"
        title="融资"
        cadence="daily"
        lede="每日更新。只展示源里写明的金额。美元以外的币种不换算，没写金额的保持未披露。"
        mark={
          <DataMark
            origin={funding.origin}
            sourceName={funding.sourceName}
            sourceHref={funding.sourceHref}
            note={funding.note}
          />
        }
      />
      <FundingLedger
        rounds={funding.items}
        companies={companies.items}
        origin={funding.origin}
      />
    </>
  );
}
