import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionIndex } from "@/components/section-index";
import { CADENCE_LABEL, type Cadence } from "@/data/types";
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
    <header className="mb-16 sm:mb-20">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <Breadcrumbs
          items={[
            { href: "/", label: "动态" },
            { label: title },
          ]}
        />
        <p className="text-sm text-muted-foreground">{CADENCE_LABEL[cadence]}</p>
      </div>
      <h1 className="mt-12 text-5xl font-semibold tracking-tight text-balance sm:text-6xl sm:leading-[1.05]">
        {title}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
        {lede}
      </p>
      {mark ? <div className="mt-6 max-w-2xl">{mark}</div> : null}
      <SectionIndex current={section} />
    </header>
  );
}
