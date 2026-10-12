import type { Metadata } from "next";
import { NewsFeed } from "@/components/news-feed";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: { absolute: "首页动态 · 纬图" },
  description: "AI 行业动态占位信息流，计划每小时更新。",
};

export default function HomePage() {
  return (
    <>
      <PageIntro
        index="01  /  首页"
        title="首页动态"
        cadence="hourly"
        lede="每小时更新。下面是纬图通讯的占位稿，用来预览信息流：头条、侧卡和列表。接入 The 500 Feed 之后，标题、摘要和时间整表替换，版式不动。"
      />
      <NewsFeed />
    </>
  );
}
