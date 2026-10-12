import type { Metadata } from "next";
import { DataMark } from "@/components/data-mark";
import { ModelTable } from "@/components/model-table";
import { PageIntro } from "@/components/page-intro";
import { loadModels } from "@/lib/ingest/models";

export const metadata: Metadata = {
  title: "模型",
  description: "模型质量、速度与价格对照，计划每周更新。",
};

export default async function ModelsPage() {
  const models = await loadModels();
  return (
    <>
      <PageIntro
        section="models"
        title="模型基准"
        cadence="weekly"
        lede="每周更新。列保持为模型、机构、质量、速度、价格。有基准接口时替换这三列，没有时保留示意刻度。"
        mark={
          <DataMark
            origin={models.origin}
            sourceName={models.sourceName}
            sourceHref={models.sourceHref}
            note={models.note}
          />
        }
      />
      <ModelTable
        models={models.items}
        priceHint={
          models.origin === "live" ? "输入美元 / 百万 token" : "美元 / 百万 token"
        }
      />
    </>
  );
}
