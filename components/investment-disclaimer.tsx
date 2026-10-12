import { INVESTMENT_DISCLAIMER } from "@/data/insights";

export function InvestmentDisclaimer() {
  return (
    <aside className="border-y border-border py-6" aria-label="非投资建议">
      <p className="text-sm font-medium tracking-tight">非投资建议</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {INVESTMENT_DISCLAIMER}
      </p>
    </aside>
  );
}
