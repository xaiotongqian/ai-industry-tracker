import { CadenceBadge } from "@/components/cadence-badge";
import type { Cadence } from "@/data/types";

export function PageIntro({
  index,
  title,
  cadence,
  lede,
  mark,
}: {
  index: string;
  title: string;
  cadence: Cadence;
  lede: string;
  mark?: React.ReactNode;
}) {
  return (
    <header className="mb-8 border-b border-foreground/80 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary">
          {index}
        </p>
        <CadenceBadge cadence={cadence} />
      </div>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-balance sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
        {lede}
      </p>
      {mark ? <div className="mt-4 max-w-2xl">{mark}</div> : null}
    </header>
  );
}
