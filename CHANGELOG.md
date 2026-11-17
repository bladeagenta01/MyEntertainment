# Change log

## v0.1 Pilot Draft. Cloudflare Pages Multi-Provider
Date: 15 November 2026

### Changes
- Replaced the standalone Worker deployment with Cloudflare Pages Functions in the same GitHub repository as the static application.
- Changed the browser API path to same-origin `/api/test` and `/api/research`.
- Added provider selection for Google Gemini, OpenAI and Anthropic.
- Stored a separate API key per provider in browser localStorage after a successful provider authentication check.
- Added shared provider request handling and provider-specific web search integration.
- Preserved the existing application layout, category/depth/region/spoiler controls and saved reference information.
- Added the full supplied Entertainment Relationship Explorer prompt source as a project reference and embedded it for runtime use.
- Added Cloudflare Pages and GitHub setup documentation.

### Decisions and rationale
- GitHub remains the master source repository. It may remain public during the pilot and should only be made private after the new Pages deployment is tested, taking account of the effect on the existing GitHub Pages site.
- Cloudflare Pages serves both the website and its backend Functions, avoiding separate Worker deployments.
- API keys are supplied by the user per request. The Pages Function forwards them to the selected provider and does not intentionally persist, log or cache them.
- Gemini is the initial test provider. OpenAI and Anthropic are supported through provider-specific request handling.
- Updated the Anthropic default model to `claude-sonnet-5-5` based on the current Anthropic model catalogue. Gemini `gemini-3.8-flash` and OpenAI `gpt-6-astra` were checked against their current official API documentation.
- Changed model override storage to be provider-specific, matching the separate API-key storage, so changing providers does not reuse the previous provider model override.

### Files affected
- Replaced: `index.html`, `app.js`, `config.js`
- Retained: `styles.css`
- Added: `functions/api/test.js`, `functions/api/research.js`, `functions/_lib/provider.js`, `functions/_lib/research-prompt.js`, `_routes.json`
- Added documentation: `README.md`, `README-CLOUDFLARE-SETUP.md`, `README-GITHUB-SETUP.md`, `CHANGELOG.md`, `RESEARCH-MAPPING.md`, `ENTERTAINMENT-3.8-SOURCE-PROMPT.md`

### Checks performed for this revision
- ZIP archive integrity and file inventory checked.
- Provider model defaults checked against official provider documentation dated 15 November 2026.
- JavaScript syntax checks (`node --check` on the browser script and Pages Function modules) passed. Static HTML ID consistency and route configuration checks passed. ZIP integrity passed.

### Not tested
- No live Gemini, OpenAI or Anthropic API call.
- No Cloudflare Pages project has been created or deployed from this package.
- No GitHub integration or production deployment has been performed.
- No live iPhone Safari or Windows browser test.
- API key authentication and full research behaviour must be tested after deployment with the user's own provider account.

### Known limitations
- API keys are held in browser localStorage, which is not encrypted.
- Each request carries the key through Cloudflare Pages to the chosen AI provider.
- Search and citation formats differ between providers. The application normalises returned source links but cannot guarantee identical citation quality.
- Provider API billing is separate from ChatGPT subscriptions.
- The prompt source file is headed "Version 3.7" in its opening lines but its own version history identifies Version 3.8 dated 7 November 2026. The supplied source is preserved without silently changing that inconsistency.
- The UPIEC companion document was not included because it was not present among the retrieved project source files.

### Migration and backup implications
- Existing saved reference information and provider keys remain in the browser origin's localStorage. Moving from the GitHub Pages hostname to a Cloudflare Pages hostname creates a different browser origin, so these values do not automatically transfer.
- Before migration, download the Saved Info backup from the old app. Re-enter provider keys in the new Pages app. Never export API keys in a backup.
- The old GitHub Pages site and Worker should remain available until the new deployment passes testing.

### Deferred
- Cloudflare Access restrictions for private application access.
- Additional providers beyond Gemini, OpenAI and Anthropic.
- Automated provider model discovery and model selector.
- Full responsive and accessibility audit on physical devices.


## v0.1 Pilot Draft. Provider Usage Profiles and Operating Modes
Date: 16 November 2026

### Changes
- Added Testing Mode and Production Mode with server-enforced input, context and depth limits.
- Added provider account profile labels for Google Gemini, OpenAI and Anthropic. These are descriptive only and do not claim live billing verification.
- Added provider model discovery and a separate basic generation test without web search.
- Added a per-provider explicit API generation authorisation control, off by default and enforced by the backend for generation tests and research. Clearing a provider key also clears its authorisation.
- Changed live web search to default off in both modes. Production Mode no longer enables it automatically. The backend also treats a missing webSearch flag as disabled.
- Retained the Cloudflare Pages manual redirect handling fix and existing Entertainment 3.8 prompt source.

### Files affected
- Added: `functions/_lib/provider-profiles.js`, `functions/api/models.js`, `functions/api/test-generation.js`, `README-REVISION-16-NOV-2026.md`, `PROVIDER-USAGE-PROFILES.md`.
- Updated: `functions/_lib/provider.js`, `app.js`, `index.html`, `styles.css`, `README.md`, `CHANGELOG.md`, `BUILD-NOTES.md`, `RESEARCH-MAPPING.md`, `README-CLOUDFLARE-SETUP.md`.

### Verification
- JavaScript syntax checks passed for the browser script and all Pages Function modules.
- HTML element IDs and route configuration checked.
- Mocked backend tests confirmed generation is blocked without authorisation and omitted webSearch defaults to off.
- ZIP integrity checked.
- Not tested: live provider calls, GitHub upload, Cloudflare deployment, iPhone Safari or Windows browser behaviour.

### Known limitations
- The app cannot inspect provider balances, determine whether a specific request will be free, or stop a request based on a provider-side credit balance. The authorisation control is consent, not a guaranteed spend ceiling.
- Provider model-list endpoints do not prove access to every generation or web-search feature.
- No automatic provider switching, paid fallback, automatic retries, or server-side per-user request budget is implemented.


## 16 November 2026. Independent search revision

- Added Tavily as an independent web-search service, separate from the selected AI model provider.
- Added a separate search API key field and connection test.
- Research now retrieves web results first and supplies those results to the AI model for analysis.
- Disabled provider-native search/grounding tools in this workflow to avoid the Gemini Free Tier grounding restriction encountered during testing.
- Replaced the embedded prompt source with the user's approved Entertainment Relationship Explorer v3.8 master prompt.
- Added `INDEPENDENT-SEARCH-ARCHITECTURE.md`.
- Live provider integration and end-to-end research remain unverified until deployed and tested with real API keys.

- Clarified that search snippets are research leads, not full source-page verification.
- Added Tavily setup, current free-credit information and exact pilot-branch deployment steps.
