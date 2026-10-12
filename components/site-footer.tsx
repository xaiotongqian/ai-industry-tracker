import Link from "next/link";
import { CADENCE_LABEL } from "@/data/types";
import { sources } from "@/data/sources";
import { sections } from "@/lib/sections";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-foreground/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div>
          <p className="font-serif text-2xl">纬图</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            模型、融资和产业地图放在同一张纸上。能读到的公开源直接进页面，读不到的格子仍标示意。
          </p>
          <nav aria-label="页脚栏目" className="mt-4">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={section.href}
                    className="hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
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
                <p
                  className={
                    source.connected
                      ? "font-mono text-[11px] text-primary"
                      : "font-mono text-[11px] text-cinnabar"
                  }
                >
                  {source.state} · {CADENCE_LABEL[source.cadence]}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            FutureX Capital 与 Epoch AI 的公开数据按 CC BY 4.0 使用。某一轮拉取失败时，对应栏目会改显示示意数据。
          </p>
        </div>
      </div>
    </footer>
  );
}
