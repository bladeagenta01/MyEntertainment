# Provider and source notes

These notes are included so that the integration does not hide API requirements or costs.

## TVmaze

- Public REST API.
- Its documentation states that the endpoints are CORS-enabled and can be called from web applications.
- TVmaze recommends a descriptive User-Agent and requires source attribution. The app links back to the returned TVmaze record.
- API documentation: https://www.tvmaze.com/api

## Wikipedia / MediaWiki

- The Action API supports anonymous cross-origin access when `origin=*` is included in the request URL.
- The direct-mode query includes that parameter.
- MediaWiki CORS documentation: https://www.mediawiki.org/wiki/Manual:CORS

## Open Library

- Search API: https://openlibrary.org/dev/docs/api/search
- Usage guidelines: https://openlibrary.org/developers/api
- Open Library asks applications to identify themselves with a User-Agent and contact detail, make useful human-facing requests, cache where appropriate and avoid bulk harvesting.
- The default unauthenticated rate limit is one request per second. The Worker spaces requests and sends an application User-Agent.

## MusicBrainz

- API: https://musicbrainz.org/doc/MusicBrainz_API
- Rate limiting: https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting
- MusicBrainz requires no API key for read-only search, but requires a meaningful User-Agent with contact information.
- Applications must not exceed one request per second. The Worker spaces calls within an isolate. This is best-effort protection for this personal draft, not a global shared rate limiter across all Worker isolates or deployments.

## Brave Search

- API reference: https://api-dashboard.search.brave.com/api-reference/web/search/get
- Authentication guide: https://api-dashboard.search.brave.com/documentation/guides/authentication
- The key must be sent in the `X-Subscription-Token` header and must remain in the Worker secret store.
- Brave's public pricing page currently lists Search at $5 per 1,000 requests and $5 in monthly free credits. Pricing can change. Check the provider's current page before adding a key: https://brave.com/search/api/

## TMDB

- Official API FAQ: https://developer.themoviedb.org/docs/faq
- A developer API key is required.
- TMDB requires its approved logo and the notice: `This product uses the TMDB API but is not endorsed or certified by TMDB.`
- The draft contains the code adapter but deliberately keeps TMDB disabled until the approved logo is added to the app's Credits section and `TMDB_ATTRIBUTION_READY` is set to `yes` in the Worker configuration.
- Official logo/attribution page: https://www.themoviedb.org/about/logos-attribution
- This personal draft is not a commercial licence. Review the current TMDB terms before any public or monetised use.

## Cloudflare Worker secrets

- Cloudflare's official secrets documentation: https://developers.cloudflare.com/workers/configuration/secrets/
- API keys are stored as Worker secrets using `wrangler secret put` or the Cloudflare dashboard.
- They are never placed in the PWA, `wrangler.toml`, GitHub repository or browser storage.
