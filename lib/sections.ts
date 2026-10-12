import type { Cadence } from "@/data/types";

export type SectionId = "news" | "models" | "funding" | "landscape";

export type Section = {
  id: SectionId;
  href: "/" | "/models" | "/funding" | "/landscape";
  /** Short label used in the global nav. */
  label: string;
  index: string;
  cadence: Cadence;
  /** One line for the homepage card and the mobile menu. */
  summary: string;
  unit: string;
  match: (path: string) => boolean;
};

export const sections: Section[] = [
  {
    id: "news",
    href: "/",
    label: "动态",
    index: "01",
    cadence: "hourly",
    summary: "公开来源的行业头条。",
    unit: "条",
    match: (path) => path === "/",
  },
  {
    id: "models",
    href: "/models",
    label: "模型",
    index: "02",
    cadence: "weekly",
    summary: "质量、速度与价格对照。",
    unit: "个",
    match: (path) => path.startsWith("/models"),
  },
  {
    id: "funding",
    href: "/funding",
    label: "融资",
    index: "03",
    cadence: "daily",
    summary: "只列源里写明的金额。",
    unit: "轮",
    match: (path) => path.startsWith("/funding"),
  },
  {
    id: "landscape",
    href: "/landscape",
    label: "产业地图",
    index: "04",
    cadence: "weekly",
    summary: "按类别进入机构档案。",
    unit: "家",
    match: (path) => path.startsWith("/landscape") || path.startsWith("/companies"),
  },
];

export function getSection(id: SectionId): Section {
  const section = sections.find((item) => item.id === id);
  if (!section) {
    throw new Error(`Unknown section: ${id}`);
  }
  return section;
}
