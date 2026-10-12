"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "首页动态", match: (path: string) => path === "/" },
  {
    href: "/models",
    label: "模型",
    match: (path: string) => path.startsWith("/models"),
  },
  {
    href: "/funding",
    label: "融资",
    match: (path: string) => path.startsWith("/funding"),
  },
  {
    href: "/landscape",
    label: "产业地图",
    match: (path: string) =>
      path.startsWith("/landscape") || path.startsWith("/companies"),
  },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="h-1 bg-primary" />
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 font-mono text-[11px] text-muted-foreground sm:px-6">
          <p>公开源按栏目接入 · 示意数据会标 Demo</p>
          <p className="shrink-0">失败时回退示意</p>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-end md:justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-11 -rotate-6 place-items-center border-2 border-cinnabar font-serif text-sm text-cinnabar"
          >
            纬
          </span>
          <span>
            <span className="block font-serif text-3xl leading-none tracking-tight">
              纬图
            </span>
            <span className="mt-1 block font-mono text-[10px] tracking-[0.28em] text-muted-foreground">
              WEITU · AI ATLAS
            </span>
          </span>
        </Link>
        <nav aria-label="栏目" className="flex flex-wrap gap-1">
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "px-3 py-1.5 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
