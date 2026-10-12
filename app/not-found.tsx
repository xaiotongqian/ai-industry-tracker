import Link from "next/link";
import { PageFrame } from "@/components/page-frame";
import { sections } from "@/lib/sections";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <PageFrame>
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight">这页不在地图上</h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
        地址可能写错了。从栏目重新进入。
      </p>
      <nav aria-label="前往栏目" className="mt-12">
        <ul className="border-t border-border">
          {sections.map((section) => (
            <li key={section.id} className="border-b border-border">
              <Link
                href={section.href}
                className={cn(
                  "flex items-baseline gap-4 py-5 text-xl font-medium tracking-tight",
                  focusRing,
                )}
              >
                <span className="text-sm text-muted-foreground">{section.index}</span>
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </PageFrame>
  );
}
