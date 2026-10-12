"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CADENCE_LABEL } from "@/data/types";
import { sections } from "@/lib/sections";
import { cn } from "@/lib/utils";

const focusRing =
  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

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
      className="sticky top-0 z-40 border-b border-border bg-background"
      onBlur={(event) => {
        if (!open) return;
        const next = event.relatedTarget;
        if (!(next instanceof Node)) return;
        if (event.currentTarget.contains(next)) return;
        setOpen(false);
      }}
    >
      <div className="h-1 bg-primary" />
      <p className="mx-auto max-w-6xl px-4 pt-1.5 font-mono text-[11px] text-muted-foreground sm:px-6">
        公开源接入 · 示意标 Demo
      </p>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className={cn("group flex items-center gap-3 rounded-sm", focusRing)}
        >
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
        <button
          ref={buttonRef}
          type="button"
          className={cn(
            "inline-flex h-11 items-center gap-2 border border-foreground/30 px-3 font-mono text-xs md:hidden",
            focusRing,
          )}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X aria-hidden className="size-4" />
          ) : (
            <Menu aria-hidden className="size-4" />
          )}
          {open ? "关闭" : "栏目"}
        </button>
        <nav aria-label="栏目" className="hidden flex-wrap justify-end gap-1 md:flex">
          {sections.map((section) => {
            const active = section.match(pathname);
            return (
              <Link
                key={section.href}
                href={section.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-baseline gap-1.5 px-2.5 py-1.5 text-sm whitespace-nowrap",
                  focusRing,
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px]",
                    active ? "text-primary-foreground/75" : "text-muted-foreground",
                  )}
                >
                  {section.index}
                </span>
                {section.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div
        id="site-menu"
        ref={panelRef}
        hidden={!open}
        className="border-t border-border md:hidden"
      >
        <nav aria-label="栏目" className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
          <ul>
            {sections.map((section) => {
              const active = section.match(pathname);
              return (
                <li key={section.href} className="border-b border-border last:border-b-0">
                  <Link
                    href={section.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 flex-col justify-center px-3 py-2",
                      focusRing,
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            "font-mono text-[10px]",
                            active
                              ? "text-primary-foreground/75"
                              : "text-muted-foreground",
                          )}
                        >
                          {section.index}
                        </span>
                        <span className="font-serif text-xl">{section.label}</span>
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[10px]",
                          active
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {CADENCE_LABEL[section.cadence]}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-1 text-xs",
                        active ? "text-primary-foreground/80" : "text-muted-foreground",
                      )}
                    >
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
