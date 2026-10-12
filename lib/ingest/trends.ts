import { cacheLife } from "next/cache";
import { trends as demoTrends } from "@/data/trends";
import { SAMPLE_AS_OF, type Loaded, type TrendNote } from "@/data/types";
import { formatFlop } from "@/lib/format";
import { fetchText } from "@/lib/ingest/http";
import { parseCsv } from "@/lib/ingest/text";

const EPOCH_URL = "https://epoch.ai/data/notable_ai_models.csv";
const EPOCH_PAGE = "https://epoch.ai/data/ai-models";

export async function loadTrends(): Promise<Loaded<TrendNote>> {
  "use cache";
  cacheLife("weekly");

  try {
    const csv = await fetchText(EPOCH_URL, 20_000);
    const items = notesFromCsv(csv);
    if (items.length === 0) return demoTrendsSet("Epoch CSV 没有解析出趋势句，侧栏仍是示意。");
    return {
      items,
      origin: "live",
      sourceName: "Epoch AI",
      sourceHref: EPOCH_PAGE,
      fetchedAt: new Date().toISOString(),
      note: "数字来自 Epoch notable 模型 CSV（CC BY），只转写条数和表内估计，不另做趋势外推。",
    };
  } catch {
    return demoTrendsSet("Epoch CSV 这一轮没有拿到，侧栏仍是示意。");
  }
}

function demoTrendsSet(note: string): Loaded<TrendNote> {
  return {
    items: demoTrends,
    origin: "demo",
    sourceName: "AI纵横示意趋势",
    sourceHref: EPOCH_PAGE,
    fetchedAt: SAMPLE_AS_OF,
    note,
  };
}

function notesFromCsv(csv: string): TrendNote[] {
  const dated = parseCsv(csv).filter((row) =>
    /^\d{4}-\d{2}-\d{2}$/.test(row["Publication date"] ?? ""),
  );
  if (dated.length === 0) return [];
  dated.sort((a, b) => b["Publication date"].localeCompare(a["Publication date"]));
  const newest = dated[0];
  const in2026 = dated.filter((row) => row["Publication date"].startsWith("2026")).length;
  const withFlop = dated.flatMap((row) => {
    const flop = Number(row["Training compute (FLOP)"]);
    return Number.isFinite(flop) && flop > 0 ? [{ row, flop }] : [];
  });
  const top = withFlop
    .filter((item) => item.row["Publication date"] >= "2024-01-01")
    .sort((a, b) => b.flop - a.flop)[0];

  const notes: TrendNote[] = [
    {
      id: "epoch-count",
      text: `Epoch notable 模型表有 ${dated.length} 条带发表日期的记录，其中 ${in2026} 条发表于 2026 年。`,
    },
  ];
  if (newest) {
    notes.push({
      id: "epoch-newest",
      text: `表里最近一条是 ${newest.Organization || "未署名机构"} 的 ${newest.Model}（${newest["Publication date"]}）。`,
    });
  }
  if (top) {
    notes.push({
      id: "epoch-flop",
      text: `2024 年以来写了训练算力估计的模型里，最高的是 ${top.row.Organization || "未署名机构"} 的 ${top.row.Model}（${top.row["Publication date"]}），约 ${formatFlop(top.flop)} FLOP。没填的算力不当作零。`,
    });
  }
  notes.push({
    id: "epoch-coverage",
    text: `训练算力有估计值的是 ${withFlop.length} 条，其余在表里留空。`,
  });
  return notes;
}
