import Link from "next/link";
import type { DataOrigin } from "@/data/types";
import { formatDate } from "@/lib/format";
import { getSection, type SectionId } from "@/lib/sections";
import { focusRing, hoverFade } from "@/lib/ui";
import { cn } from "@/lib/utils";

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
      <p className="text-sm text-muted-foreground">截至 {formatDate(asOf)}</p>
      <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4">
        {cards.map((card) => {
          const section = getSection(card.id);
          const live = card.origin === "live";
          return (
            <li key={card.id}>
              <Link
                href={card.href}
                className={cn("block", focusRing, hoverFade)}
              >
                <span className="block text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
                  {card.count}
                </span>
                <span className="mt-3 block text-sm text-foreground">{section.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {section.unit} · {live ? "实时" : "示意"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
