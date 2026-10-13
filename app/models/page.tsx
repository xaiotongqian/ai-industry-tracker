import type { Metadata } from "next";
import { DataMark } from "@/components/data-mark";
import { ModelSummary } from "@/components/model-summary";
import { ModelTable } from "@/components/model-table";
import { PageFrame } from "@/components/page-frame";
import { PageIntro } from "@/components/page-intro";
import { loadModels } from "@/lib/ingest/models";

export const metadata: Metadata = {
  title: "模型",
  description: "模型质量、编码、智能体、速度与价格对照，计划每周更新。",
};

export default async function ModelsPage() {
  const models = await loadModels();
  return (
    <PageFrame>
      <PageIntro
        section="models"
        title="模型基准"
        cadence="weekly"
        lede="每周更新。质量、编码和智能体分开看，速度和输入价格另列。点开一行，可以看到能力指数和时延。"
        mark={
          <DataMark
            origin={models.origin}
            sourceName={models.sourceName}
            sourceHref={models.sourceHref}
            note={models.note}
          />
        }
      />
      <ModelSummary
        models={models.items}
        origin={models.origin}
        fetchedAt={models.fetchedAt}
        indexVersion={models.indexVersion}
      />
      <ModelTable
        models={models.items}
        origin={models.origin}
        priceHint={models.origin === "live" ? "输入美元 / 百万 token" : "美元 / 百万 token"}
      />
    </PageFrame>
  );
}
