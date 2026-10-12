import { Breadcrumbs } from "@/components/breadcrumbs";
import { CadenceBadge } from "@/components/cadence-badge";
import { SectionIndex } from "@/components/section-index";
import type { Cadence } from "@/data/types";
import type { SectionId } from "@/lib/sections";

export function PageIntro({
  section,
  title,
  cadence,
  lede,
  mark,
}: {
  section: SectionId;
  title: string;
  cadence: Cadence;
  lede: string;
  mark?: React.ReactNode;
}) {
  return (
    <header className="mb-8 border-b border-border pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { href: "/", label: "动态" },
            { label: title },
          ]}
        />
        <CadenceBadge cadence={cadence} />
      </div>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-balance sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
        {lede}
      </p>
      {mark ? <div className="mt-4 max-w-2xl">{mark}</div> : null}
      <SectionIndex current={section} />
    </header>
  );
}
