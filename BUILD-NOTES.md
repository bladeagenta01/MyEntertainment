# Build notes

This is a pilot build, not a production-certified application. The package contains Cloudflare Pages Functions and multi-provider request code. Static checks are being performed before handoff. Live API and hosted deployment testing remain outstanding.

The source prompt supplied by the user is preserved byte-for-byte. Its opening heading says Version 3.7, while the version history within the same document identifies Version 3.8. This is disclosed rather than silently edited.

Hard-coded provider model defaults were removed in the 16 November revision. The app now retrieves model IDs from the selected provider account and asks the user to select one or enter an exact model ID. A successful model-list response does not guarantee tool compatibility or full research access.

## Provider Usage Profiles and Operating Modes revision
Date: 16 November 2026

Testing Mode is the default. It limits research depth to Level 2, query length to 1,200 characters and saved reference context to 4,000 characters. Live web search is off by default. If enabled, the Anthropic web-search tool is limited to one use and OpenAI search context is low.

Production Mode restores depth Levels 1 to 4, query length up to 4,000 characters and reference context up to 30,000 characters. The user can enable live web search.

Provider account profiles are descriptive only. The application cannot inspect account balances or guarantee free usage. The provider's own billing controls must be used to prevent unexpected charges.

A separate `/api/test-generation` route makes a small provider-specific request without the full research prompt or live web search. The existing API key test checks authentication only.

Cloudflare compatibility fix: `providerFetch` uses `redirect: "manual"` and explicitly rejects unexpected 3xx responses. Cloudflare Workers/Pages do not support `redirect: "error"`.

No live provider calls, Cloudflare deployment, or device testing are claimed for this revision.


Model discovery is provided by `/api/models`. Google results are filtered to models advertising `generateContent`; OpenAI and Anthropic model IDs are listed from their account model endpoints. The list is not a guarantee of web-search tool or feature compatibility.
