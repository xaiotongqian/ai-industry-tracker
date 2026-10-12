import { requireCompany } from "@/data/companies";
import type { FundingRound, MoneyPlaceholder } from "@/data/types";

const mock = (usd: number): MoneyPlaceholder => ({ status: "mock", usd });
const undisclosed: MoneyPlaceholder = { status: "undisclosed" };

/** Placeholder rounds. Investor names are fictional on purpose. */
export const rounds: FundingRound[] = [
  {
    id: "r-moonshot",
    companySlug: "moonshot",
    round: "C 轮",
    amount: mock(800_000_000),
    announcedOn: "2026-10-08",
    investors: ["示意基金甲", "示意基金乙"],
  },
  {
    id: "r-anthropic",
    companySlug: "anthropic",
    round: "战略融资",
    amount: mock(2_000_000_000),
    announcedOn: "2026-10-06",
    investors: ["示意基金丙"],
  },
  {
    id: "r-xai",
    companySlug: "xai",
    round: "后期轮",
    amount: mock(3_000_000_000),
    announcedOn: "2026-10-05",
    investors: ["示意基金丁", "示意基金戊"],
  },
  {
    id: "r-harvey",
    companySlug: "harvey",
    round: "D 轮",
    amount: mock(200_000_000),
    announcedOn: "2026-10-03",
    investors: ["示意基金甲"],
  },
  {
    id: "r-coreweave",
    companySlug: "coreweave",
    round: "扩容融资",
    amount: mock(1_500_000_000),
    announcedOn: "2026-10-02",
    investors: ["示意基金乙", "示意基金丙"],
  },
  {
    id: "r-mistral",
    companySlug: "mistral",
    round: "后续轮",
    amount: mock(400_000_000),
    announcedOn: "2026-10-01",
    investors: ["示意基金戊"],
  },
  {
    id: "r-zhipu",
    companySlug: "zhipu",
    round: "战略轮",
    amount: mock(300_000_000),
    announcedOn: "2026-09-27",
    investors: ["示意基金甲", "示意基金丁"],
  },
  {
    id: "r-cerebras",
    companySlug: "cerebras",
    round: "后期轮",
    amount: mock(250_000_000),
    announcedOn: "2026-09-24",
    investors: ["示意基金丙"],
  },
  {
    id: "r-abridge",
    companySlug: "abridge",
    round: "C 轮",
    amount: mock(150_000_000),
    announcedOn: "2026-09-22",
    investors: ["示意基金乙"],
  },
  {
    id: "r-cognition",
    companySlug: "cognition",
    round: "B 轮",
    amount: mock(100_000_000),
    announcedOn: "2026-09-18",
    investors: ["示意基金丁", "示意基金戊"],
  },
  {
    id: "r-runway",
    companySlug: "runway",
    round: "后续轮",
    amount: mock(80_000_000),
    announcedOn: "2026-09-12",
    investors: ["示意基金甲"],
  },
  {
    id: "r-decagon",
    companySlug: "decagon",
    round: "B 轮",
    amount: undisclosed,
    announcedOn: "2026-09-09",
    investors: ["示意基金乙", "示意基金丙"],
  },
];

for (const round of rounds) {
  requireCompany(round.companySlug);
}

export function roundsForCompany(slug: string): FundingRound[] {
  return rounds.filter((round) => round.companySlug === slug);
}

export function disclosedFundingTotal(items: readonly FundingRound[]): number {
  return items.reduce((sum, round) => {
    return sum + (round.amount.status === "mock" ? round.amount.usd : 0);
  }, 0);
}
