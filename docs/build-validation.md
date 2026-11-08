# Build validation record

**Build:** 0.1 Draft 2  
**Date:** 8 November 2026

## Passed in this build environment

- JavaScript syntax checks for the PWA scripts, service worker, Worker and embedded research prompt.
- Frontend API adapter tests with mocked TVmaze, Wikipedia, Worker status, news, relationship and AI responses.
- Worker route tests with mocked TVmaze, MusicBrainz, Open Library, Apple Search, TMDB, Brave Search and AI provider responses.
- Exact title/year matching test before associating a TVmaze screen record with TMDB/IMDb.
- Test that TMDB stays disabled until the logo and attribution flag are present.
- Test that the Worker sends the complete included v3.8 prompt to the AI provider.
- HTML parsing, duplicate-ID check and local asset-path check.
- CSS rule-brace and comment-structure check.
- Manifest JSON, icon-file and Wrangler TOML validation.
- Check that all declared application actions have corresponding handlers.
- Check that every service-worker shell path exists and API routes are not cached.
- Check that IndexedDB, delete, backup and merge-import code paths are present.
- Check for obvious hard-coded API credentials.
- Exact byte-for-byte comparison between the included v3.8 Markdown prompt and the Worker-embedded prompt.
- Final ZIP archive integrity check: passed with no corrupt entries.

## Not verified in this environment

- The browser interaction harness `tests/smoke.html` is included. Browser automation was attempted but the browser could not be launched/navigated in this execution environment. Therefore UI clicks, IndexedDB persistence and modal interactions have not been independently exercised in a live browser here.
- Live upstream provider responses were not tested because outbound network access was unavailable in the build container.
- GitHub Pages deployment and Cloudflare Worker deployment have not been performed.
- iPhone Safari, iPhone Home Screen installation and Windows desktop browser behaviour have not been physically tested.

## Interpretation

The checks establish that the source files parse, the mocked service contracts behave as expected, the documented local assets exist and the archive is structurally valid. They do not prove that every live provider integration or real-device interaction works. The remaining tests are listed explicitly above and in `docs/testing.md`.
