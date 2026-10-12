import { CADENCE_LABEL } from "@/data/types";
import { sources } from "@/data/sources";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-foreground/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div>
          <p className="font-serif text-2xl">纬图</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            模型、融资和产业地图放在同一张纸上。这一版只搭骨架，标题和数字都可以整表替换。
          </p>
        </div>
        <div>
          <h2 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
            数据源槽位
          </h2>
          <ul className="mt-3 divide-y border-y border-border">
            {sources.map((source) => (
              <li
                key={source.id}
                className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] sm:items-baseline sm:gap-3"
              >
                <p className="text-sm">{source.name}</p>
                <p className="text-sm text-muted-foreground">
                  {source.covers} · {source.usedOn}
                </p>
                <p className="font-mono text-[11px] text-cinnabar">
                  未接入 · {CADENCE_LABEL[source.cadence]}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
