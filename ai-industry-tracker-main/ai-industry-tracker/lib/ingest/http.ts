const USER_AGENT =
  "WeituBot/0.1 (+https://github.com/xaiotongqian/ai-industry-tracker)";

export async function fetchText(
  url: string,
  timeoutMs: number,
  headers?: Record<string, string>,
): Promise<string> {
  const response = await fetch(url, {
    headers: {
      accept:
        "application/json, application/rss+xml, application/atom+xml, application/xml, text/csv, text/plain, */*",
      "user-agent": USER_AGENT,
      ...headers,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}
