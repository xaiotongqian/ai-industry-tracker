import type { Metadata } from "next";
import { FundingLedger } from "@/components/funding-ledger";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "融资",
  description: "AI 融资轮次占位列表，计划每日更新。",
};

export default function FundingPage() {
  return (
    <>
      <PageIntro
        index="03  /  融资"
        title="融资"
        cadence="daily"
        lede="每日更新。轮次、金额和投资人都是占位。未披露不会被填成猜测数字。接入 AI Funding Tracker 后替换 data/funding.ts，机构名仍链到档案页。"
      />
      <FundingLedger />
    </>
  );
}
