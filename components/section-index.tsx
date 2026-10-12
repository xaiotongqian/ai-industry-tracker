import Link from "next/link";
import { sections, type SectionId } from "@/lib/sections";
import { cn } from "@/lib/utils";

const focusRing =
  "rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function SectionIndex({ current }: { current: SectionId | "company" }) {
  return (
    <nav aria-label="栏目索引" className="mt-6 border-t border-border pt-3">
      <ol className="flex flex-wrap gap-x-4 gap-y-2">
        {sections.map((section) => {
          const onPage = section.id === current;
          const inSection = current === "company" && section.id === "landscape";
          const here = onPage || inSection;
          return (
            <li key={section.id}>
              <Link
                href={section.href}
                aria-current={onPage ? "page" : inSection ? "location" : undefined}
                className={cn(
                  "font-mono text-[11px] tracking-wide",
                  focusRing,
                  here ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {section.index} {section.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
