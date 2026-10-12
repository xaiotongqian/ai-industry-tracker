"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CADENCE_LABEL } from "@/data/types";
import { sections } from "@/lib/sections";
import { focusRingDark, frameClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  return <SiteHeaderFrame pathname={pathname} />;
}

function SiteHeaderFrame({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [trackedPath, setTrackedPath] = useState(pathname);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  if (trackedPath !== pathname) {
    setTrackedPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false);
    }
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLAnchorElement>("a");
    first?.focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }

    function onPointerDown(event: PointerEvent) {
      const root = headerRef.current;
      if (!root || !(event.target instanceof Node) || root.contains(event.target)) return;
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 bg-black/80 text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-black/75"
      onBlur={(event) => {
        if (!open) return;
        const next = event.relatedTarget;
        if (!(next instanceof Node)) return;
        if (event.currentTarget.contains(next)) return;
        setOpen(false);
      }}
    >
      <div className={cn(frameClass, "flex h-12 items-center justify-between gap-4")}>
        <Link
          href="/"
          className={cn("flex items-baseline gap-2", focusRingDark)}
        >
          <span className="text-[17px] font-semibold tracking-tight">AI纵横</span>
          <span className="text-xs tracking-[0.16em] text-white/60">AI ZONGHENG</span>
        </Link>
        <button
          ref={buttonRef}
          type="button"
          className={cn(
            "inline-flex h-11 items-center gap-2 px-1 text-[13px] text-white/80 md:hidden",
            focusRingDark,
          )}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "关闭" : "栏目"}
        </button>
        <nav aria-label="栏目" className="hidden h-12 items-stretch md:flex">
          {sections.map((section) => {
            const active = section.match(pathname);
            return (
              <Link
                key={section.href}
                href={section.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-12 items-center gap-1.5 px-3 text-[13px] text-white/60 motion-safe:transition-colors motion-safe:duration-200 hover:text-white",
                  focusRingDark,
                  active && "text-white",
                )}
              >
                <span className={cn("text-[11px]", active ? "text-white/70" : "text-white/55")}>
                  {section.index}
                </span>
                {section.label}
                {active ? (
                  <span aria-hidden className="absolute inset-x-3 bottom-0 h-px bg-white" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
      <div
        id="site-menu"
        ref={panelRef}
        className={cn("border-t border-white/10 bg-black md:hidden", !open && "hidden")}
      >
        <nav aria-label="栏目" className={cn(frameClass, "py-2")}>
          <ul>
            {sections.map((section) => {
              const active = section.match(pathname);
              return (
                <li key={section.href} className="border-b border-white/10 last:border-b-0">
                  <Link
                    href={section.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 flex-col justify-center py-3",
                      focusRingDark,
                      active ? "text-white" : "text-white/70",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="flex items-baseline gap-2">
                        <span className={cn("text-xs", active ? "text-white/70" : "text-white/55")}>
                          {section.index}
                        </span>
                        <span className="text-2xl font-medium tracking-tight">{section.label}</span>
                      </span>
                      <span className="text-xs text-white/65">
                        {CADENCE_LABEL[section.cadence]}
                      </span>
                    </span>
                    <span className={cn("mt-1 text-sm", active ? "text-white/75" : "text-white/65")}>
                      {section.summary}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
