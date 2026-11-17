# Independent Search Architecture

Release label: v0.1 Pilot Draft
Revision: Independent web search and AI analysis
Date: 16 November 2026

## What changed

- The search stage is now separate from the selected AI provider.
- Tavily performs web search first. Its result extracts are passed to Gemini, OpenAI or Anthropic for analysis using the approved Entertainment Relationship Explorer v3.8 prompt.
- The AI request no longer enables the provider-native Google Search, OpenAI web_search or Anthropic web_search tools.
- Search and AI have separate API keys, tests, error messages and usage limits.
- Search results are included as citations in the returned report.
- The backend does not intentionally store, log or cache either key. Keys are passed per request over HTTPS. Browser localStorage is not encrypted.

## New file

- `functions/_lib/web-search.js`
- `functions/api/search-test.js`
- `INDEPENDENT-SEARCH-ARCHITECTURE.md`

## Updated files

- `functions/api/research.js`
- `functions/_lib/provider.js`
- `functions/_lib/research-prompt.js`
- `ENTERTAINMENT-3.8-SOURCE-PROMPT.md`
- `app.js`
- `index.html`

## Important limits

This is an integration draft, not a live-verified service. Tavily requires its own API key and has its own plan, rate and credit limits. Its official pricing page currently lists 1,000 free API credits per month without a credit card. Basic search costs 1 credit per request; advanced search costs 2 credits. Testing Mode uses basic search, while Production Mode uses advanced search. The free allowance is limited, not unlimited, and the app cannot guarantee that future account terms will remain unchanged. A successful search test proves only that a small search request succeeded. It does not prove full research quality, source-page accessibility, or that all results are free. Search snippets are research leads, not proof that every source page was fully read. This first revision does not yet perform a separate full-page extraction pass or multi-query expansion. Do not treat it as full source verification or a completed v3.8 production research engine. The AI must label uncertainty and cite the URLs supplied to it.

## Deployment

Upload the extracted project contents to `pages-multiprovider-pilot` only. Do not change `main`, delete the old Worker folder, or modify the old Worker deployment. Cloudflare Pages should deploy the commit from its connected pilot branch.
