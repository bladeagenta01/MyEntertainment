const TAVILY_URL = "https://api.tavily.com/search";

export async function searchWeb(apiKey, query, mode = "testing") {
  if (!apiKey || typeof apiKey !== "string") throw new Error("Add a Tavily Search API key in Settings to use independent web search.");
  const response = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      query,
      search_depth: mode === "production" ? "advanced" : "basic",
      topic: "general",
      max_results: mode === "production" ? 10 : 5,
      include_answer: false,
      include_raw_content: false
    }),
    redirect: "manual"
  });
  if (response.status >= 300 && response.status < 400) throw new Error(`Search provider returned an unexpected redirect (HTTP ${response.status}).`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.detail?.error || data?.detail || data?.error || data?.message || "";
    if (response.status === 401 || response.status === 403) throw new Error("Tavily rejected the search key or it lacks permission. " + String(detail).slice(0,250));
    if (response.status === 429) throw new Error("Tavily search quota or rate limit reached. Check the Tavily account usage and plan. " + String(detail).slice(0,250));
    throw new Error(`Tavily search failed (HTTP ${response.status}). ` + String(detail).slice(0,250));
  }
  const results = (data.results || []).filter(x => x && /^https?:\/\//i.test(x.url || "")).slice(0, mode === "production" ? 10 : 5).map(x => ({
    title: String(x.title || x.url).slice(0,300),
    url: x.url,
    content: String(x.content || "").slice(0,1800),
    score: Number.isFinite(x.score) ? x.score : null
  }));
  if (!results.length) throw new Error("The search provider returned no usable web results for this question.");
  return results;
}

export async function testWebSearch(apiKey) {
  const results = await searchWeb(apiKey, "official website IMDb TMDB entertainment research test", "testing");
  return { ok: true, count: results.length, message: `Independent web search test passed. ${results.length} web results were returned.` };
}
