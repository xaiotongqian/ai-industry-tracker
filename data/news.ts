import { requireCompany } from "@/data/companies";
import type { NewsItem } from "@/data/types";

/** Mock wire copy for the feed skeleton. Not scraped. */
export const news: NewsItem[] = [
  {
    id: "n-deepseek",
    title: "深度求索放出新一版推理模型，开源权重同步可下",
    summary:
      "占位稿。用来预览头条卡片：标题、摘要、栏目和相关机构可以点进档案。接入新闻源后整条替换。",
    wire: "纬图通讯",
    desk: "模型",
    publishedAt: "2026-10-12T04:00:00.000Z",
    companySlug: "deepseek",
  },
  {
    id: "n-anthropic",
    title: "Anthropic 把长任务助手拆成可审计的企业套件",
    summary: "占位稿。企业侧更关心任务有没有留下可核对的步骤，而不只是对话本身。",
    wire: "纬图通讯",
    desk: "应用",
    publishedAt: "2026-10-12T01:00:00.000Z",
    companySlug: "anthropic",
  },
  {
    id: "n-coreweave",
    title: "CoreWeave 扩了一座园区，推理与训练争抢同一批 GPU",
    summary: "占位稿。容量新闻以后会和算力趋势放在一起读。",
    wire: "纬图通讯",
    desk: "算力",
    publishedAt: "2026-10-11T21:00:00.000Z",
    companySlug: "coreweave",
  },
  {
    id: "n-moonshot",
    title: "月之暗面完成一轮示意融资，长上下文仍是产品主线",
    summary: "占位稿。金额在融资页单独列出，这里只保留叙事。",
    wire: "纬图通讯",
    desk: "资本",
    publishedAt: "2026-10-11T14:00:00.000Z",
    companySlug: "moonshot",
  },
  {
    id: "n-nvidia",
    title: "NVIDIA 更新推理加速路线，软件栈和芯片绑得更紧",
    summary: "占位稿。芯片栏目的条目，用来把首页和机构档案串起来。",
    wire: "纬图通讯",
    desk: "芯片",
    publishedAt: "2026-10-11T04:00:00.000Z",
    companySlug: "nvidia",
  },
  {
    id: "n-harvey",
    title: "Harvey 把律所试点从检索推进到计费实验",
    summary: "占位稿。垂直应用是否算成智能体，以后由地图分类决定，不由标题决定。",
    wire: "纬图通讯",
    desk: "应用",
    publishedAt: "2026-10-11T00:00:00.000Z",
    companySlug: "harvey",
  },
  {
    id: "n-mistral",
    title: "Mistral 提供欧洲数据驻留选项，政企采购在问部署地",
    summary: "占位稿。部署地会成为模型页和机构页都要引用的字段。",
    wire: "纬图通讯",
    desk: "模型",
    publishedAt: "2026-10-10T04:00:00.000Z",
    companySlug: "mistral",
  },
  {
    id: "n-siliconflow",
    title: "硅基流动上线多模型路由，主打国内推理性价比",
    summary: "占位稿。基础设施公司的动态，默认链到机构档案而不是外站。",
    wire: "纬图通讯",
    desk: "算力",
    publishedAt: "2026-10-09T23:00:00.000Z",
    companySlug: "siliconflow",
  },
  {
    id: "n-openai",
    title: "OpenAI 调整接口计价，长上下文被单独标价",
    summary: "占位稿。真实价格曲线以后走模型页，不写进新闻标题里冒充基准。",
    wire: "纬图通讯",
    desk: "模型",
    publishedAt: "2026-10-09T04:00:00.000Z",
    companySlug: "openai",
  },
  {
    id: "n-abridge",
    title: "Abridge 的临床记录进入更多医院信息系统",
    summary: "占位稿。垂直应用的交付对象是医院流程，不是通用聊天窗口。",
    wire: "纬图通讯",
    desk: "应用",
    publishedAt: "2026-10-08T04:00:00.000Z",
    companySlug: "abridge",
  },
  {
    id: "n-cerebras",
    title: "Cerebras 拿到新的云侧部署窗口",
    summary: "占位稿。晶圆级芯片的新闻用来填芯片栏目。",
    wire: "纬图通讯",
    desk: "芯片",
    publishedAt: "2026-10-07T04:00:00.000Z",
    companySlug: "cerebras",
  },
  {
    id: "n-scale",
    title: "Scale AI 的需求从标注转向评测集",
    summary: "占位稿。数据与评测类别在地图上单独成栏。",
    wire: "纬图通讯",
    desk: "数据",
    publishedAt: "2026-10-06T00:00:00.000Z",
    companySlug: "scale",
  },
];

for (const item of news) {
  if (!item.companySlug) {
    throw new Error(`News fixture ${item.id} needs a companySlug`);
  }
  requireCompany(item.companySlug);
}

export function newsForCompany(slug: string): NewsItem[] {
  return news.filter((item) => item.companySlug === slug);
}
