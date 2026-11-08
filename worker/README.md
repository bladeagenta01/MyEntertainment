# Research gateway

This Cloudflare Worker keeps optional service credentials away from the browser. The PWA can use public sources without the Worker, but the Worker adds MusicBrainz, Open Library, Apple Search, optional TMDB, optional Brave web/news search, and provider-agnostic AI reasoning.

## Deploy

1. Before using MusicBrainz or Open Library, change `APP_CONTACT` in `wrangler.toml` from the placeholder to the actual public GitHub repository URL or a contact email. These sources require an identifiable application User-Agent.
2. Install Node.js and Wrangler (`npm install -g wrangler`).
3. Sign in (`wrangler login`).
4. From this folder, run `wrangler deploy`.
5. Copy the deployed `https://...workers.dev` URL into the PWA Settings.
6. Replace `ALLOWED_ORIGINS = "*"` with your exact GitHub Pages origin after the site is published, then deploy again.

## Optional secrets

Set only the services you intend to use:

```bash
wrangler secret put BRAVE_API_KEY
wrangler secret put TMDB_API_KEY
wrangler secret put AI_API_KEY
```

For AI, also edit `AI_BASE_URL`, `AI_MODEL`, and `AI_PROVIDER_NAME` in `wrangler.toml`, then deploy. The endpoint must support the OpenAI-compatible `/chat/completions` API. The PWA never receives the secret key. Provider API usage may incur charges. A ChatGPT subscription does not automatically provide an API key or include API usage.

TMDB remains disabled even after adding its key until the approved TMDB logo and attribution notice have been added to the app's Credits section. The required notice is: `This product uses the TMDB API but is not endorsed or certified by TMDB.` Obtain an approved logo from [TMDB's official logo and attribution page](https://www.themoviedb.org/about/logos-attribution), place it in the app's Credits section, then set `TMDB_ATTRIBUTION_READY = "yes"` in `wrangler.toml` and redeploy. Do not set this flag before the attribution is actually present.

Examples of base URL shapes (not credentials):

- `https://api.openai.com/v1`
- Another provider's OpenAI-compatible API base URL

The model name must be a model available to the selected provider. Provider compatibility varies. The app does not claim that every provider endpoint is interchangeable.

## Security and operating notes

- The Worker has no user login or account system. It is intended for this personal PWA.
- `ALLOWED_ORIGINS` is a browser CORS restriction, not authentication. It does not prevent direct non-browser calls to the Worker URL.
- Before making the Worker public or sharing the app, configure Cloudflare rate limiting and usage limits for upstream providers.
- Do not commit API keys, `.dev.vars`, or `.env` files.
- MusicBrainz asks clients to stay at or below one request per second and provide a meaningful User-Agent. The Worker waits between MusicBrainz calls within an isolate and sends the configured contact value.
- Brave Search is optional and metered. Check current provider pricing before adding a key.
- Search results are source records, not proof that every claim has been independently verified. The v3.8 research prompt governs the reasoning and verification standard.
