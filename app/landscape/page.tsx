import type { Metadata } from "next";
import { DataMark } from "@/components/data-mark";
import { LandscapeBoard } from "@/components/landscape-board";
import { LandscapeSummary } from "@/components/landscape-summary";
import { PageFrame } from "@/components/page-frame";
import { PageIntro } from "@/components/page-intro";
import { glanceAtCompanies, toBoardCompany } from "@/lib/company-stats";
import { loadCompanies } from "@/lib/ingest/companies";

export const metadata: Metadata = {
  title: "产业地图",
  description: "按类别排列的 AI 产业地图，计划每周更新。",
};

export default async function LandscapePage() {
  const companies = await loadCompanies();
  return (
    <PageFrame>
      <PageIntro
        section="landscape"
        title="产业地图"
        cadence="weekly"
        lede={`每周更新。先看规模，再按六类分栏。可以按类别、上市状态和估值筛选，也可以搜索。当前 ${companies.items.length} 家。`}
        mark={
          <DataMark
            origin={companies.origin}
            sourceName={companies.sourceName}
            sourceHref={companies.sourceHref}
            note={companies.note}
          />
        }
      />
      <LandscapeSummary
        glance={glanceAtCompanies(companies.items)}
        origin={companies.origin}
        fetchedAt={companies.fetchedAt}
      />
      <LandscapeBoard companies={companies.items.map(toBoardCompany)} />
    </PageFrame>
  );
}
