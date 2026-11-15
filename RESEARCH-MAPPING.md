# Research requirement mapping

The runtime system prompt is embedded in `functions/_lib/research-prompt.js`. The full supplied prompt source is retained in `ENTERTAINMENT-3.8-SOURCE-PROMPT.md`.

| Requirement | Implementation location |
|---|---|
| Entertainment relationship graph and specialist research | Embedded master prompt |
| Entity-specific response structures | Embedded master prompt |
| Research depth 1 to 4, default 2 | `index.html`, `app.js`, provider prompt builder |
| Region and spoiler controls | `index.html`, `app.js`, provider prompt builder |
| Similar entertainment recommendations | Master prompt |
| Sourced interesting facts | Master prompt |
| Current and future research | Master prompt plus provider web-search tools |
| IMDb and TMDB checks for screen entities | Master prompt |
| Verified links and citations | Provider-specific citation extraction and prompt |
| User-supplied saved reference information | `app.js`, localStorage and provider prompt builder |
| Independent searches, no search history | `app.js` and master prompt |
| Multi-provider BYOK | `functions/_lib/provider.js` |
| Same-origin backend requests | `config.js`, `functions/api/*` |
| Private source repository and automatic deployment | Cloudflare Pages Git integration |

## Provider-specific research integration
- Google Gemini: `generateContent` with Google Search grounding. Default `gemini-3.8-flash`.
- OpenAI: Responses API with the `web_search` tool. Default `gpt-6-astra`.
- Anthropic: Messages API with the web search tool. Default `claude-sonnet-5-5`.

A successful API-key test only verifies that the provider accepts the key at its models endpoint. It does not guarantee the selected model supports the requested search feature or that a full research request will succeed.
