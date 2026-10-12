import type { DataOrigin } from "@/data/types";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function DataMark({
  origin,
  sourceName,
  sourceHref,
  note,
}: {
  origin: DataOrigin;
  sourceName: string;
  sourceHref?: string;
  note?: string;
}) {
  const source = sourceHref ? (
    <a
      href={sourceHref}
      target="_blank"
      rel="noreferrer noopener"
      className={cn("text-link underline-offset-4 hover:underline", focusRing)}
    >
      {sourceName}
    </a>
  ) : (
    sourceName
  );

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {origin === "demo" ? "示意数据" : "实时"}
        <span className="mx-1.5" aria-hidden>
          ·
        </span>
        {source}
      </p>
      {note ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p>
      ) : null}
    </div>
  );
}
