import type { Cadence } from "@/data/types";

export type SectionId =
  | "news"
  | "models"
  | "funding"
  | "landscape"
  | "insights"
  | "about";

export type Section = {
  id: SectionId;
  href: "/" | "/models" | "/funding" | "/landscape" | "/insights" | "/about";
  /** Short label used in the global nav. */
  label: string;
  index: string;
  cadence: Cadence;
  /** Replaces the cadence label in the mobile menu. */
  menuNote?: string;
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
    summary: "质量、编码、速度与价格。",
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
  {
    id: "insights",
    href: "/insights",
    label: "洞察",
    index: "05",
    cadence: "editorial",
    summary: "编辑写定的分析。",
    unit: "篇",
    match: (path) => path.startsWith("/insights"),
  },
  {
    id: "about",
    href: "/about",
    label: "关于",
    index: "06",
    cadence: "editorial",
    menuNote: "站点作者",
    summary: "站点作者刘永武。",
    unit: "页",
    match: (path) => path === "/about" || path.startsWith("/about/"),
  },
];

export function getSection(id: SectionId): Section {
  const section = sections.find((item) => item.id === id);
  if (!section) {
    throw new Error(`Unknown section: ${id}`);
  }
  return section;
}
