import Link from "next/link";
import type { DataOrigin } from "@/data/types";
import { formatDate } from "@/lib/format";
import { getSection, type SectionId } from "@/lib/sections";
import { cn } from "@/lib/utils";

const focusRing =
  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function ModuleStrip({
  asOf,
  cards,
}: {
  asOf: string;
  cards: {
    id: SectionId;
    href: string;
    count: number;
    origin: DataOrigin;
  }[];
}) {
  return (
    <section aria-label="样本规模">
      <p className="mb-2 font-mono text-[11px] text-muted-foreground">
        截至 {formatDate(asOf)}
      </p>
      <ul className="grid grid-cols-2 divide-x divide-y divide-border border-y border-border sm:grid-cols-4 sm:divide-y-0">
        {cards.map((card) => {
          const section = getSection(card.id);
          const live = card.origin === "live";
          return (
            <li key={card.id}>
              <Link
                href={card.href}
                className={cn(
                  "block px-3 py-3 hover:bg-muted/70 sm:px-4",
                  focusRing,
                )}
              >
                <span className="block text-sm text-muted-foreground">
                  {section.label}
                </span>
                <span className="mt-1 block font-mono text-2xl leading-none tabular-nums">
                  {card.count}
                  <span className="ml-1 font-sans text-xs text-muted-foreground">
                    {section.unit}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-1.5 block font-mono text-[11px]",
                    live ? "text-muted-foreground" : "text-cinnabar",
                  )}
                >
                  {live ? "实时" : "示意"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
