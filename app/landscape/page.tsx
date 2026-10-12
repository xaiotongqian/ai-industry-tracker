import type { Metadata } from "next";
import { DataMark } from "@/components/data-mark";
import { LandscapeBoard } from "@/components/landscape-board";
import { PageFrame } from "@/components/page-frame";
import { PageIntro } from "@/components/page-intro";
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
        lede={`每周更新。按基础模型、基础设施、智能体、垂直应用、数据与评测、芯片与算力分栏。当前 ${companies.items.length} 家，可筛选、可搜索。`}
        mark={
          <DataMark
            origin={companies.origin}
            sourceName={companies.sourceName}
            sourceHref={companies.sourceHref}
            note={companies.note}
          />
        }
      />
      <LandscapeBoard companies={companies.items} origin={companies.origin} />
    </PageFrame>
  );
}
