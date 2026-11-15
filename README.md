# Entertainment Research Explorer
## v0.1 Pilot Draft. Cloudflare Pages, multi-provider BYOK

This package is a new deployment architecture for the Entertainment Research Explorer. It replaces the previous standalone Cloudflare Worker arrangement with one Cloudflare Pages project containing both the static application and its Pages Functions backend.

### What is included
- Browser application: `index.html`, `styles.css`, `app.js`, `config.js`
- Cloudflare Pages API: `functions/api/test.js` and `functions/api/research.js`
- Shared provider handling: `functions/_lib/provider.js`
- Embedded research prompt: `functions/_lib/research-prompt.js`
- Pages route configuration: `_routes.json`
- Full source prompt: `ENTERTAINMENT-3.8-SOURCE-PROMPT.md`
- Deployment and maintenance instructions.

### Supported providers
- Google Gemini. Initial test provider. Default model: `gemini-3.8-flash`.
- OpenAI. Default model: `gpt-6-astra`.
- Anthropic Claude. Default model: `claude-sonnet-5-5`.

Provider models can change. The model field is optional and can be used to enter another model ID supported by the selected provider and account. Provider/model availability is not guaranteed by this application.

OpenAI's Responses API uses its `web_search` tool. Gemini uses Google Search grounding. Anthropic uses its Messages API web search tool. Search and citation behaviour differs between providers.

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
