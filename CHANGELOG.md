# Change Log

## v0.1 Pilot Draft. Complete BYOK consolidation
Date: 12 November 2026
Status: Consolidated repair draft. Not a release.

### Purpose
Replace the incomplete dashboard Worker and reconcile the browser application, endpoint contract and deployment instructions into one consistent package.

### Changes
- Replaced the partial Worker deployment instructions with a complete single-file `worker-dashboard.js`.
- Added `GET /health`, `POST /test`, `POST /research` and CORS preflight handling.
- Corrected CORS to allow `Content-Type`, `X-User-API-Key` and `X-AI-Provider`.
- Embedded the supplied master research prompt in the Worker, avoiding a missing second-module import during dashboard deployment.
- Added explicit v3.8 pilot requirements for sourced interesting facts and similar-entertainment recommendations.
- Corrected duplicate `infoStatus` HTML identifier by using `savedInfoStatus` for the Settings status paragraph.
- Added browser-storage exception handling and read-back confirmation before displaying that the API key was saved.
- Clarified that API key storage is local browser storage and is not encrypted.
- Added distinct GitHub Pages and Cloudflare dashboard deployment guides.
- Retained the pilot's simple search-led interface, independent searches and locally stored optional Saved Info.

### Files affected
`index.html`, `app.js`, `config.js`, `worker-dashboard.js`, `wrangler.toml`, `README.md`, `README-GITHUB-DEPLOY.md`, `README-CLOUDFLARE-DEPLOY.md`, `CHANGELOG.md`, `ENTERTAINMENT-3.8-SOURCE-PROMPT.md`.

### Rationale
The deployed Worker contained only a partial CORS configuration and did not include either route handler. A single-file dashboard Worker removes the separate prompt-module deployment dependency and makes it easier to replace the entire deployed code consistently.

### Tests performed during packaging
- JavaScript syntax checks for `app.js` and `worker-dashboard.js`.
- Static check that Worker implements `/health`, `/test`, `/research` and `OPTIONS`.
- Static check that CORS includes all three browser request headers.
- Static check that HTML IDs are unique.
- ZIP integrity test.
- Package file manifest check.

### Not tested
- No live provider API call was made.
- No deployment was performed in the user's Cloudflare or GitHub accounts.
- No browser end-to-end test was run against the live Worker.
- No physical iPhone Safari test was performed.

### Known limitations / deferred work
- The supplied master prompt filename says v3.8, but its internal heading/version history identifies the text as Version 3.7. The file has been preserved as supplied. The application-specific v3.8 additions remembered from the approved specification are added explicitly, but this version-label discrepancy should be reconciled against the user's authoritative v3.8 source before a release.
- The separate UPIEC companion document was not located and is not included.
- CORS remains permissive for pilot deployment. Restrict it to the exact GitHub Pages origin before wider public exposure.
- Rate limiting, abuse controls and request authentication are not implemented.
- The browser API key is stored in localStorage, which is not encrypted.
- Provider billing, retention and model availability are governed by each provider.
- Rich image retrieval and strict typed specialist result rendering remain deferred.

### Migration / backup implications
There is no search history to migrate. Saved Info remains in local browser storage and is not transferred by redeployment. Export Saved Info before clearing browser site data or moving to another device.
