import type { MoneyPlaceholder } from "@/data/types";
import { formatUsd } from "@/lib/format";

export function Money({
  value,
  className = "",
}: {
  value: MoneyPlaceholder;
  className?: string;
}) {
  if (value.status === "mock") {
    return (
      <span className={className}>
        <span className="tabular-nums">{formatUsd(value.usd)}</span>
        <span className="ml-1.5 align-middle text-xs text-muted-foreground">示意</span>
      </span>
    );
  }

  if (value.status === "reported") {
    return <span className={`${className} tabular-nums`}>{formatUsd(value.usd)}</span>;
  }

  if (value.status === "undisclosed") {
    return <span className={className}>未披露</span>;
  }

  return <span className={className}>{value.reason}</span>;
}
