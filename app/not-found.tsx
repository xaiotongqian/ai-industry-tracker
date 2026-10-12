import Link from "next/link";
import { sections } from "@/lib/sections";

export default function NotFound() {
  return (
    <div className="max-w-lg">
      <p className="font-mono text-[11px] tracking-[0.18em] text-cinnabar">404</p>
      <h1 className="mt-3 font-serif text-4xl">这页不在地图上</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        地址可能写错了。从栏目重新进入。
      </p>
      <nav aria-label="前往栏目" className="mt-6">
        <ul className="divide-y border-y border-border">
          {sections.map((section) => (
            <li key={section.id}>
              <Link
                href={section.href}
                className="flex items-baseline gap-3 py-3 text-sm hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="font-mono text-[11px] text-muted-foreground">
                  {section.index}
                </span>
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
