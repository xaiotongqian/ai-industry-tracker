import Link from "next/link";
import { CADENCE_LABEL } from "@/data/types";
import { sources } from "@/data/sources";
import { sections } from "@/lib/sections";
import { focusRingDark, frameClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-black text-white">
      <div
        className={cn(
          frameClass,
          "grid gap-14 py-16 sm:py-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]",
        )}
      >
        <div>
          <p className="text-3xl font-semibold tracking-tight">AI纵横</p>
          <p className="mt-1 text-xs tracking-[0.16em] text-white/60">AI ZONGHENG</p>
          <p className="mt-5 max-w-sm text-[15px] leading-7 text-white/60">
            模型、融资和产业地图放在同一张纸上。能读到的公开源直接进页面，读不到的格子仍标示意。
          </p>
          <nav aria-label="页脚栏目" className="mt-6">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={section.href}
                    className={cn(
                      "text-white/75 motion-safe:transition-opacity motion-safe:duration-200 hover:text-white",
                      focusRingDark,
                    )}
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div>
          <h2 className="text-sm text-white/50">数据源槽位</h2>
          <ul className="mt-4 divide-y divide-white/15 border-y border-white/15">
            {sources.map((source) => (
              <li
                key={source.id}
                className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] sm:items-baseline sm:gap-4"
              >
                <p className="text-sm">{source.name}</p>
                <p className="text-sm text-white/55">
                  {source.covers} · {source.usedOn}
                </p>
                <p className={source.connected ? "text-xs text-white/80" : "text-xs text-white/65"}>
                  {source.state} · {CADENCE_LABEL[source.cadence]}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-white/65">
            FutureX Capital 与 Epoch AI 的公开数据按 CC BY 4.0 使用。某一轮拉取失败时，对应栏目会改显示示意数据。
          </p>
        </div>
      </div>
    </footer>
  );
}
