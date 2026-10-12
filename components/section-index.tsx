import Link from "next/link";
import { sections, type SectionId } from "@/lib/sections";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function SectionIndex({ current }: { current: SectionId | "company" }) {
  return (
    <nav aria-label="栏目索引" className="mt-8">
      <ol className="flex flex-wrap gap-x-5 gap-y-2">
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
                  "text-sm motion-safe:transition-colors motion-safe:duration-200",
                  focusRing,
                  here ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="mr-1.5 text-muted-foreground">{section.index}</span>
                {section.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
