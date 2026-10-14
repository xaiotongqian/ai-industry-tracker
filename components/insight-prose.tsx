import Link from "next/link";
import { isAllowedInsightHref } from "@/data/insights";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function InsightText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(/\[([^\]]+)\]\((\/[^)\s]+)\)/g)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const label = match[1] ?? "";
    const href = match[2] ?? "";
    if (isAllowedInsightHref(href)) {
      nodes.push(
        <Link
          key={key}
          href={href}
          className={cn("text-link underline-offset-4 hover:underline", focusRing)}
        >
          {label}
        </Link>,
      );
    } else {
      nodes.push(label);
    }
    key += 1;
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
