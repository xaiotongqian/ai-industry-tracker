import type { DataOrigin } from "@/data/types";

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
      className="underline-offset-2 hover:underline"
    >
      {sourceName}
    </a>
  ) : (
    sourceName
  );

  return (
    <div className={origin === "demo" ? "text-cinnabar" : "text-primary"}>
      <p className="font-mono text-xs">
        {origin === "demo" ? "示意数据 · Demo" : "实时"}
        <span className="mx-1.5">·</span>
        {source}
      </p>
      {note ? (
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{note}</p>
      ) : null}
    </div>
  );
}
