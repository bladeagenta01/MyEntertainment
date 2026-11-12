# Entertainment Research v0.1 Pilot Draft. Complete BYOK package

## What this package is
A consolidated pilot package for GitHub Pages (the browser application) and Cloudflare Workers (the AI research proxy). It is a review draft, not a production release.

## Folder layout
- `index.html`, `styles.css`, `app.js`, `config.js`: publish these four files at the root of the GitHub Pages repository.
- `worker-dashboard.js`: complete single-file Cloudflare Worker. Paste the entire file into the Cloudflare dashboard editor.
- `ENTERTAINMENT-3.8-SOURCE-PROMPT.md`: supplied master prompt source.
- `RESEARCH-MAPPING.md`: mapping from the master prompt to the pilot.
- `CHANGELOG.md`: project history and this repair.
- `README-GITHUB-DEPLOY.md`: GitHub Pages publishing instructions.
- `README-CLOUDFLARE-DEPLOY.md`: Cloudflare Worker deployment instructions.
- `wrangler.toml`: optional Wrangler configuration. Not required for dashboard deployment.

## Deployment order
1. Deploy the Worker using `README-CLOUDFLARE-DEPLOY.md`.
2. Confirm `https://myentertainment.bladeagenta01.workers.dev/health` returns JSON with `ok: true`.
3. Publish the four browser files to the root of the GitHub Pages repository.
4. Open the GitHub Pages URL, configure a provider key in Settings, and use Test & Save Key.
5. Run a small research test.

## Important BYOK security facts
- No developer API key is included.
- The user's API key is stored in browser localStorage after the provider test succeeds. Browser localStorage is not encrypted.
- The key is sent over HTTPS from the browser to the Cloudflare Worker and then to the selected AI provider.
- The Worker does not intentionally log, store, or cache the key. The provider's own retention, billing and usage policies apply.
- Do not commit an API key to GitHub, `config.js`, or any source file.
- The Worker currently permits cross-origin requests from any origin for this pilot. Restricting CORS to the exact GitHub Pages origin and adding abuse controls are required before wider public use.

## Data behaviour
- Search history is not retained by the application.
- Every research request is independent.
- Optional Saved Info is stored locally in the browser and sent with each research request. It is not synced between devices.
- Export Saved Info before clearing browser site data or changing devices.

## Testing status
Static checks are performed during packaging. No live provider API call or deployment to the user's GitHub or Cloudflare account is claimed. iPhone Safari and Windows browser testing remain to be performed after deployment.
