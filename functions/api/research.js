import { json, runResearch, validateRequestBody } from "../_lib/provider.js";
import { searchWeb } from "../_lib/web-search.js";

export async function onRequestPost({ request }) {
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "The request body must be valid JSON." }, 400); }
  const checked = validateRequestBody(body);
  if (checked.error) return json({ error: checked.error }, 400);
  let searchResults = [];
  if (body.webSearch === true) {
    try { searchResults = await searchWeb(String(body.searchApiKey || "").trim(), String(body.query || "").trim(), body.mode === "production" ? "production" : "testing"); }
    catch (error) { return json({ error: "Independent web search failed before AI analysis. " + (error.message || "Check the search provider settings."), stage: "web_search" }, 502); }
  }
  try { return await runResearch(checked.provider, checked.key, { ...body, webSearch: false, externalSearch: body.webSearch === true, searchResults }); }
  catch (error) { return json({ error: error.message || "The research request failed." }, 502); }
}
