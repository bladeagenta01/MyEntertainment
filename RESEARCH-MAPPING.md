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
| Dynamic provider model list | `functions/api/models.js`, provider model-list adapters and Settings model selector |
| Testing and Production modes | `functions/_lib/provider-profiles.js`, `app.js`, `index.html`, `functions/_lib/provider.js` |
| Separate authentication and generation tests | `functions/api/test.js`, `functions/api/test-generation.js` |
| Provider-specific usage profile labels | `functions/_lib/provider-profiles.js`, `app.js` |
| Same-origin backend requests | `config.js`, `functions/api/*` |
| Private source repository and automatic deployment | Cloudflare Pages Git integration |

## Provider-specific research integration
- Google Gemini: `generateContent` with optional Google Search grounding. The app retrieves models advertising `generateContent` from the selected account.
- OpenAI: Responses API with optional `web_search`. Models are retrieved from the account model-list endpoint.
- Anthropic: Messages API with optional web search. Models are retrieved from the account model-list endpoint.

No hard-coded model default is assumed in this revision. The user selects a model returned by the provider or enters an exact model ID manually. A model-list result does not guarantee access to every tool or feature.

A successful API-key test only verifies that the provider accepts the key at its models endpoint. The separate generation test checks a small model response without web search. Neither guarantees that a full research request or search tool will succeed.
