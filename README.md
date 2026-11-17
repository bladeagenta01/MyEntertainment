# Entertainment Research Explorer
## v0.1 Pilot Draft. Cloudflare Pages, multi-provider BYOK

This package is a new deployment architecture for the Entertainment Research Explorer. It replaces the previous standalone Cloudflare Worker arrangement with one Cloudflare Pages project containing both the static application and its Pages Functions backend.

### What is included
- Browser application: `index.html`, `styles.css`, `app.js`, `config.js`
- Cloudflare Pages API: `functions/api/test.js`, `functions/api/models.js`, `functions/api/test-generation.js` and `functions/api/research.js`
- Shared provider handling: `functions/_lib/provider.js`
- Embedded research prompt: `functions/_lib/research-prompt.js`
- Pages route configuration: `_routes.json`
- Full source prompt: `ENTERTAINMENT-3.8-SOURCE-PROMPT.md`
- Deployment and maintenance instructions.

### Supported providers
- Google Gemini.
- OpenAI.
- Anthropic Claude.

The app retrieves the model list using the selected provider key. Select a returned model or enter an exact model ID manually. Model-list membership does not guarantee that every API feature is available for that model; use Test AI Generation to check basic generation access.

OpenAI's Responses API uses its `web_search` tool. Gemini uses Google Search grounding. Anthropic uses its Messages API web search tool. Search and citation behaviour differs between providers.

### Operating modes and provider usage profiles
- Testing Mode is the default. It caps research depth at Level 2, limits question length to 1,200 characters and reference information to 4,000 characters, and starts with live web search disabled. Anthropic web-search use is capped at one use when enabled. OpenAI web-search context is set to low when enabled.
- Production Mode permits research depth 1 to 4, questions up to 4,000 characters and reference information up to 30,000 characters. Provider web-search tools are enabled when the user selects live web search.
- The provider account profile is descriptive only. The app cannot inspect balances, determine whether credits are free, or guarantee that a request will not be billed.
- The separate Test & Save Key button checks provider authentication. Test AI Generation sends a small provider-specific generation request without the full research prompt or live web search. Neither test proves that live search grounding or future requests have available free quota.
- Provider billing and spending limits are the final financial safeguard. Review provider billing settings before using Production Mode. Do not rely on app-side limits as a guarantee against charges.

### Security and privacy
- There is no developer-owned AI key.
- The user supplies a provider key in Settings.
- The key is stored separately for each provider in browser localStorage after a successful key check. Browser localStorage is not encrypted.
- The key is sent over HTTPS in the request body to the same-origin Cloudflare Pages Function. The function forwards it to the selected provider.
- The backend code does not intentionally log, store, cache or persist API keys. Cloudflare necessarily processes the HTTPS request as part of hosting and function execution. Do not describe this as the key never passing through Cloudflare.
- Do not commit API keys to GitHub or put them in source files.
- Saved reference information is local to the browser and is included with research requests. Search history is not stored.

### Initial deployment
Follow `README-CLOUDFLARE-SETUP.md`. Do not deploy `worker-dashboard.js` from an earlier package. This package has no standalone Worker deployment file.

### Current verification status
Static checks and ZIP integrity are performed before distribution. No live provider API request, Cloudflare deployment, GitHub deployment or iPhone/Windows browser test is claimed as completed. Those checks must be performed after deployment.

### Source-of-truth rule
The connected GitHub repository is the master copy. It may remain public during pilot testing and can be made private after the new Pages deployment is verified. Do not make unrecorded code edits in the Cloudflare dashboard. Commit source changes to GitHub and let Cloudflare Pages deploy them.


## Provider Usage Profiles and Operating Modes (16 November 2026)

The pilot includes Testing Mode and Production Mode, provider-specific account profile labels, provider model discovery, a separate basic generation test, and an explicit API generation authorisation control. Testing Mode is the default and applies conservative request limits. Live web search is off by default in both modes.

AI generation and research are blocked unless the user explicitly enables the authorisation control in Settings. This is a consent gate, not a billing detector. The application cannot inspect provider credit balances, distinguish a free request from a paid request, or guarantee that a request will remain free. Provider profiles are descriptive labels only. Check provider billing, quotas, model eligibility and automatic-recharge settings before authorising generation.

See `PROVIDER-USAGE-PROFILES.md` for the provider-specific classifications, operating-mode limits and official policy references. The provider API-key authentication check and model-list retrieval do not require generation authorisation. The separate generation test and all research requests do. No automatic provider switching, automatic retry or paid fallback is implemented.


## Independent web search revision

The current pilot can use Tavily for web search independently of Gemini, OpenAI or Anthropic. Add and test a separate Tavily API key in Settings, then enable independent live web search. The selected AI provider analyses the returned search extracts. See `INDEPENDENT-SEARCH-ARCHITECTURE.md` before deployment.
