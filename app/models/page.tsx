import type { Metadata } from "next";
import { ModelTable } from "@/components/model-table";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "模型",
  description: "模型质量、速度与价格的占位对照表，计划每周更新。",
};

export default function ModelsPage() {
  return (
    <>
      <PageIntro
        index="02  /  模型"
        title="模型基准"
        cadence="weekly"
        lede="每周更新。质量、速度和价格都是示意刻度，不是任何公开榜的实测。接入 Artificial Analysis 后，这张表改读它的基准，列保持为模型、机构、质量、速度、价格。"
      />
      <ModelTable />
    </>
  );
}
