import type { CategoryId } from "@/data/types";

export type Category = {
  id: CategoryId;
  label: string;
  en: string;
  blurb: string;
};

export const categories: Category[] = [
  {
    id: "foundation",
    label: "基础模型",
    en: "Foundation",
    blurb: "训练并发布通用模型的机构。",
  },
  {
    id: "infra",
    label: "基础设施",
    en: "Infra",
    blurb: "云、推理路由与机房容量。",
  },
  {
    id: "agents",
    label: "智能体",
    en: "Agents",
    blurb: "把模型接进可以交付的任务。",
  },
  {
    id: "vertical",
    label: "垂直应用",
    en: "Vertical",
    blurb: "扎进行业流程的产品公司。",
  },
  {
    id: "data",
    label: "数据与评测",
    en: "Data",
    blurb: "数据、实验跟踪与评测。",
  },
  {
    id: "silicon",
    label: "芯片与算力",
    en: "Silicon",
    blurb: "加速器，以及另一条供给。",
  },
];

export function getCategory(id: CategoryId): Category {
  const category = categories.find((item) => item.id === id);
  if (!category) {
    throw new Error(`Unknown category: ${id}`);
  }
  return category;
}
