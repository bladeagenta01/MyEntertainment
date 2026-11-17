import { json } from "../_lib/provider.js";
import { testWebSearch } from "../_lib/web-search.js";

export async function onRequestPost({ request }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "The request body must be valid JSON." }, 400); }
  const key = String(body?.searchApiKey || "").trim();
  if (!key || key.length > 1000) return json({ error: "Enter a valid Tavily Search API key." }, 400);
  try { return json(await testWebSearch(key)); }
  catch (error) { return json({ error: error.message || "Independent web search test failed." }, 502); }
}
