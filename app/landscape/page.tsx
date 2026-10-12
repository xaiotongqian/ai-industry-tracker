import type { Metadata } from "next";
import { LandscapeBoard } from "@/components/landscape-board";
import { PageIntro } from "@/components/page-intro";
import { companies } from "@/data/companies";

export const metadata: Metadata = {
  title: "产业地图",
  description: "按类别排列的 AI 产业地图占位样本，计划每周更新。",
};

export default function LandscapePage() {
  return (
    <>
      <PageIntro
        index="04  /  产业地图"
        title="产业地图"
        cadence="weekly"
        lede={`每周更新。版式按矩阵分栏：基础模型、基础设施、智能体、垂直应用、数据与评测、芯片与算力。现在放了 ${companies.length} 家占位样本，完整地图计划覆盖 200 家以上。估值与并购以后读 FutureX。`}
      />
      <LandscapeBoard />
    </>
  );
}
