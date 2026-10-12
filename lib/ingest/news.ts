import { cacheLife } from "next/cache";
import { news as demoNews } from "@/data/news";
import { SAMPLE_AS_OF, type Loaded, type NewsItem } from "@/data/types";
import { fetchText } from "@/lib/ingest/http";
import { loadCompanies } from "@/lib/ingest/companies";
import { buildNameIndex } from "@/lib/ingest/match";
import { deskFor, parseFeed, stableId } from "@/lib/ingest/text";

const FEEDS: { name: string; url: string }[] = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
  {
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
  },
  { name: "OpenAI", url: "https://openai.com/news/rss.xml" },
  { name: "Google AI", url: "https://blog.google/technology/ai/rss/" },
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml" },
];

export async function loadNews(): Promise<Loaded<NewsItem>> {
  "use cache";
  cacheLife("news");

  try {
    const companies = await loadCompanies();
    const index = buildNameIndex(companies.items);
    const results = await Promise.all(
      FEEDS.map(async (feed) => {
        try {
          const xml = await fetchText(feed.url, 12_000);
          return { name: feed.name, stories: parseFeed(xml, feed.name), ok: true };
        } catch {
          return { name: feed.name, stories: [], ok: false };
        }
      }),
    );
    const seen = new Set<string>();
    const items: NewsItem[] = [];
    for (const result of results) {
      for (const story of result.stories) {
        const key = storyKey(story.href);
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({
          id: stableId("n", story.href),
          title: story.title,
          summary: story.summary,
          wire: story.sourceName,
          desk: deskFor(story.title, story.summary),
          publishedAt: story.publishedAt,
          companySlug: index.mention(`${story.title} ${story.summary}`),
          href: story.href,
        });
      }
    }
    items.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
    const top = items.slice(0, 18);
    const ok = results.filter((result) => result.ok).length;
    if (top.length === 0) {
      return demoNewsSet(`公开 RSS 这一轮没有解析出条目（${ok}/${FEEDS.length} 路有响应）。`);
    }
    return {
      items: top,
      origin: "live",
      sourceName: "公开 RSS",
      fetchedAt: new Date().toISOString(),
      note: `The 500 Feed 没有公开 RSS。这里是 ${FEEDS.map((feed) => feed.name).join("、")}，本轮 ${ok}/${FEEDS.length} 路成功，取最新 ${top.length} 条。标题链到原文。`,
    };
  } catch {
    return demoNewsSet("公开 RSS 拉取失败，暂时回退示意稿。");
  }
}

function demoNewsSet(note: string): Loaded<NewsItem> {
  return {
    items: demoNews,
    origin: "demo",
    sourceName: "AI纵横示意稿",
    fetchedAt: SAMPLE_AS_OF,
    note,
  };
}

function storyKey(href: string): string {
  try {
    const url = new URL(href);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return href;
  }
}
