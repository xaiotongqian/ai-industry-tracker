import Link from "next/link";
import { CADENCE_LABEL, type DataOrigin } from "@/data/types";
import { formatDate } from "@/lib/format";
import { getSection, type SectionId } from "@/lib/sections";
import { cn } from "@/lib/utils";

const focusRing =
  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function HomeHero({
  asOf,
  newsOrigin,
  cards,
}: {
  asOf: string;
  newsOrigin: DataOrigin;
  cards: {
    id: SectionId;
    href: string;
    count: number;
    origin: DataOrigin;
    sourceName: string;
  }[];
}) {
  return (
    <section className="mb-10 border-b border-foreground/80 pb-8">
      <p className="font-mono text-[11px] tracking-[0.22em] text-primary">
        动态 · 模型 · 融资 · 地图
      </p>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight tracking-tight text-balance sm:text-5xl">
        人工智能产业索引
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
        动态、模型基准、融资和机构地图放在一起。公开源读得到就进页面，读不到的格子标示意。
      </p>
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        动态截至 {formatDate(asOf)}
        <span className="mx-1.5" aria-hidden>
          ·
        </span>
        <span className={newsOrigin === "demo" ? "text-cinnabar" : "text-primary"}>
          {newsOrigin === "demo" ? "示意" : "实时"}
        </span>
      </p>
      <ul className="mt-8 grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
        {cards.map((card) => {
          const section = getSection(card.id);
          const live = card.origin === "live";
          return (
            <li key={card.id} className="bg-card">
              <Link
                href={card.href}
                className={cn(
                  "group flex h-full flex-col p-4 hover:bg-muted",
                  focusRing,
                )}
              >
                <span className="font-mono text-[11px] tracking-[0.18em] text-primary">
                  {section.index}
                </span>
                <span className="mt-2 font-serif text-2xl tracking-tight">
                  {section.label}
                </span>
                <span className="mt-3 font-mono text-3xl tabular-nums">
                  {card.count}
                  <span className="ml-1 font-sans text-sm text-muted-foreground">
                    {section.unit}
                  </span>
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {CADENCE_LABEL[section.cadence]}
                </span>
                <span
                  className={cn(
                    "mt-2 font-mono text-[11px]",
                    live ? "text-primary" : "text-cinnabar",
                  )}
                >
                  {live ? `实时 · ${card.sourceName}` : "示意数据 · Demo"}
                </span>
                <span className="mt-2 text-sm leading-6 text-muted-foreground">
                  {section.summary}
                </span>
                <span className="mt-auto pt-4 font-mono text-[11px] tracking-wide text-primary group-hover:underline">
                  查看
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
