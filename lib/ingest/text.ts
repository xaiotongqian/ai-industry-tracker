export type FeedStory = {
  title: string;
  href: string;
  summary: string;
  publishedAt: string;
  sourceName: string;
};

export function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? safeCodePoint(code) : _;
    })
    .replace(/&#(\d+);/g, (_, dec: string) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) ? safeCodePoint(code) : _;
    })
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function safeCodePoint(code: number): string {
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

export function plainText(value: string): string {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function clip(text: string, max = 180): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  const base = space > 80 ? cut.slice(0, space) : cut;
  return `${base.trim()}…`;
}

export function norm(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");
}

export function nameKeys(name: string): string[] {
  const key = norm(name);
  const keys = new Set<string>();
  if (key.length >= 3) keys.add(key);
  const stripped = key.replace(/(incorporated|inc|ltd|llc|labs|corp|company)$/g, "");
  if (stripped.length >= 3 && stripped !== key) keys.add(stripped);
  if (/\bai\b/i.test(name)) {
    const without = norm(name.replace(/\bai\b/gi, " "));
    if (without.length >= 3) keys.add(without);
  }
  return [...keys];
}

export function slugify(input: string): string {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "org";
}

export function safeHttpUrl(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function hostname(value: string | undefined | null): string {
  const safe = safeHttpUrl(value);
  if (!safe) return "";
  try {
    return new URL(safe).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function stableId(prefix: string, value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${prefix}${(hash >>> 0).toString(36)}`;
}

export function parseCsv(text: string): Record<string, string>[] {
  const source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    if (char !== "\r") field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows.filter((cells) => cells.some((cell) => cell.trim()));
  if (!header) return [];
  return body.map((cells) => {
    const record: Record<string, string> = {};
    header.forEach((name, index) => {
      record[name.trim()] = (cells[index] ?? "").trim();
    });
    return record;
  });
}

export function parseFeed(xml: string, sourceName: string): FeedStory[] {
  const items = splitBlocks(xml, "item");
  const entries = splitBlocks(xml, "entry");
  const blocks = entries.length > items.length ? entries : items;
  const stories: FeedStory[] = [];
  for (const block of blocks) {
    const title = firstText(block, ["title"]);
    const href = feedLink(block);
    const summary = clip(firstText(block, ["description", "summary"]), 180);
    const publishedAt = parseFeedDate(
      firstText(block, ["pubDate", "published", "updated", "dc:date"]),
    );
    if (!title || !href || !publishedAt) continue;
    stories.push({
      title,
      href,
      summary: summary || title,
      publishedAt,
      sourceName,
    });
  }
  return stories;
}

function splitBlocks(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}\\b`, "gi");
  const starts: number[] = [];
  for (const match of xml.matchAll(re)) {
    if (match.index != null) starts.push(match.index);
  }
  return starts.map((start, index) => xml.slice(start, starts[index + 1] ?? xml.length));
}

function firstText(block: string, names: string[]): string {
  for (const name of names) {
    const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i");
    const match = block.match(re);
    if (match?.[1]) {
      const text = plainText(match[1]);
      if (text) return text;
    }
  }
  return "";
}

function feedLink(block: string): string {
  const textLink = firstText(block, ["link"]);
  if (/^https?:\/\//i.test(textLink)) return textLink;
  let fallback = "";
  for (const link of block.matchAll(/<link\b([^>]*?)\/?>/gi)) {
    const attrs = link[1] ?? "";
    const href = decodeEntities(
      attrs.match(/\bhref\s*=\s*"([^"]+)"/i)?.[1] ??
        attrs.match(/\bhref\s*=\s*'([^']+)'/i)?.[1] ??
        "",
    );
    if (!/^https?:\/\//i.test(href)) continue;
    const rel = attrs.match(/\brel\s*=\s*"([^"]+)"/i)?.[1];
    if (!rel || rel === "alternate") return href;
    if (!fallback) fallback = href;
  }
  return fallback;
}

function parseFeedDate(value: string): string | null {
  if (!value) return null;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString();
}

export function parseReportedValuation(
  raw: string | null | undefined,
):
  | { status: "reported"; usd: number }
  | { status: "undisclosed" }
  | { status: "pending"; reason: string } {
  const text = (raw ?? "").trim();
  if (!text || text.toUpperCase() === "N/A" || text.includes("数")) {
    return { status: "undisclosed" };
  }
  if (text.startsWith("HK$") || text.startsWith("¥")) {
    return { status: "pending", reason: `公开报道 ${text}（未换算）` };
  }
  const match = text.match(/^\$(\d+(?:\.\d+)?)([MBT])\+?$/i);
  if (!match) return { status: "pending", reason: `公开报道 ${text}` };
  const quantity = Number(match[1]);
  const unit = match[2].toUpperCase();
  const multiplier = unit === "M" ? 1_000_000 : unit === "B" ? 1_000_000_000 : 1_000_000_000_000;
  if (!Number.isFinite(quantity)) return { status: "pending", reason: `公开报道 ${text}` };
  if (text.endsWith("+")) return { status: "pending", reason: `公开报道不低于 ${text}` };
  return { status: "reported", usd: Math.round(quantity * multiplier) };
}

export function deskFor(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();
  if (/\b(series [a-f]|raises|raised|funding|seed round|valuation|ipo)\b/.test(text)) {
    return "资本";
  }
  if (/\b(gpu|chip|semiconductor|nvidia|asic)\b/.test(text)) return "芯片";
  if (/\b(model|gpt|llm|weights|benchmark|gemini|claude)\b/.test(text)) return "模型";
  if (/\b(data center|datacenter|inference|compute|cloud)\b/.test(text)) return "算力";
  if (/\b(agent|coding|enterprise)\b/.test(text)) return "应用";
  return "动态";
}
