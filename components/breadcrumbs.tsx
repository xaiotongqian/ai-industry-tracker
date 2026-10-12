import Link from "next/link";
import { cn } from "@/lib/utils";

const focusRing =
  "rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function Breadcrumbs({
  items,
  className,
}: {
  items: { href?: string; label: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="面包屑" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-border">
                  /
                </span>
              ) : null}
              {last || !item.href ? (
                <span aria-current={last ? "page" : undefined} className="text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={cn("hover:text-primary", focusRing)}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
