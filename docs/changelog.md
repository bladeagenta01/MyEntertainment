# Technical changelog

## 0.1 Draft 2 — 8 November 2026

**Status:** Working draft. Not a final release. The semantic release number remains 0.1. This is a draft iteration, not version 0.2.

### Purpose

Correct the earlier 0.1 and 0.2 delivery problems by rebuilding the foundation around the approved cinematic design direction and the user's clarified online-first research/visualiser purpose.

### Changes

- Reworked the interface around a cinematic dark palette, deep navy surfaces, gold accents and a responsive desktop/mobile layout.
- Added Overview, Explore, Research Search, Connections, What's New, Saved Research and Settings screens.
- Added three intelligence levels: personal saved research, live external information and independent reasoning.
- Replaced preloaded sample library records with an empty personal library. No sample entry is inserted automatically.
- Added explicit save-search and save-result actions.
- Added edit and delete for every saved record.
- Added JSON export and merge import with duplicate skipping.
- Added Open actions for saved items, offline reopening of search snapshots and relationship maps, and online refresh actions.
- Added duplicate-save protection for source records and searches.
- Added direct public-source search for TVmaze and Wikipedia.
- Added Cloudflare Worker routes for MusicBrainz, Open Library, Apple Search, optional TMDB, optional Brave web/news search and optional AI reasoning.
- Added a provider-agnostic AI gateway using an OpenAI-compatible chat-completions endpoint.
- Embedded the complete approved v3.8 research prompt into the Worker system prompt.
- Added an interactive SVG relationship visualiser for source-backed records.
- Added PWA manifest, SVG/PNG icons and an app-shell service worker.
- Kept search results out of the service-worker cache. Only the user-saved library is retained in IndexedDB.
- Added GitHub Pages, Cloudflare Worker, testing, architecture and specification documentation.

### Decisions and rationale

- **Online-first:** The user's latest clarification is controlling. Offline use is for previously saved research and the app shell, not a bundled entertainment database.
- **No automatic sample data:** The user identified inability to delete supplied sample entries as a defect. This draft starts with an empty personal library.
- **Classic deferred scripts:** Avoids the previous JavaScript-module loading failure when opening `index.html` directly.
- **Worker for non-public or credentialed services:** Keeps keys off the client and provides a controlled adapter layer.
- **Independent AI:** The app does not hard-code one model provider. In-app reasoning requires an OpenAI-compatible endpoint configured in the Worker.
- **No fake relationships:** The graph renders only records returned by supported source APIs. Missing relationships are stated, not invented.
- **No silent version bump:** This is 0.1 Draft 2. It is not labelled 0.2 or 0.3.

### Files affected / added

- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/api.js`
- `js/storage.js`
- `js/graph.js`
- `manifest.webmanifest`
- `service-worker.js`
- `assets/icons/icon.svg`
- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`
- `worker/index.js`
- `worker/research-prompt.js`
- `worker/wrangler.toml`
- `worker/README.md`
- `worker/package.json`
- `tests/smoke.html`
- `tests/api-smoke.cjs`
- `tests/worker-smoke.mjs`
- `tests/static-check.py`
- `docs/provider-notes.md`
- `docs/requirements-traceability.md`
- `docs/architecture.md`
- `docs/specification.md`
- `docs/testing.md`
- `docs/build-validation.md`
- `docs/changelog.md`
- `docs/Entertainment_Relationship_Explorer_Master_Prompt_v3.8.md`
- `docs/three-levels-of-intelligence-reference.png`
- `README.md`
- `.gitignore`
- `.nojekyll`

### Tests

See `docs/testing.md`. Syntax, structural and static feature checks plus mocked frontend API and Worker tests were run in the build environment. The browser interaction harness is included but could not be executed because browser automation launch/navigation was blocked by the execution environment. ZIP integrity is checked after packaging.

### Known issues and limitations

- Live upstream API calls could not be tested from the build container because outbound network access was unavailable.
- Direct mode currently searches TVmaze and Wikipedia only. Full music, book, TMDB, broader web and news search requires deploying the Worker. Brave requires its own key. TMDB requires its own key plus the approved logo and attribution before the Worker enables it.
- In-app AI requires the Worker plus a compatible endpoint, model and secret key.
- The Worker is not production-hardened for public multi-user access. Configure Cloudflare rate limiting and restrict CORS origins before sharing.
- IMDb/TMDB checks, Rotten Tomatoes links, full v3.8 report generation, recommendations and Interesting Facts need further specialist implementation.
- Real iPhone Home Screen and Windows device testing has not been performed in this environment.
- The separate full architecture specification dated 7 November was not present as a distinct Library file. The architecture document records the recovered approved decisions and identifies additional implementation decisions honestly.
- The separate UPIEC text was not available in the recovered project files. The v3.8 prompt states that UPIEC remains an additional controlling instruction; it has not been falsely represented as embedded.

### Migration and backup implications

- This draft uses a new IndexedDB database named `ere-personal-library`.
- It does not automatically migrate data from the earlier 0.1 or 0.2 builds.
- Existing 0.1/0.2 records should be exported from those builds before replacing a deployment if the user wants to preserve them. The earlier builds used different data structures, so a dedicated migration converter is not included.
- JSON backup import merges into the current library and skips duplicate fingerprints. It does not replace existing data.
- Do not commit personal JSON backups to the public GitHub repository.

### Deferred work

- Full cross-category entity resolution and ambiguity workflow.
- Complete v3.8 research report composition and source-verification checklist.
- IMDb, TMDB and Rotten Tomatoes link verification across all screen entities.
- Full music, classical, literary and documentary specialist engines.
- Multi-hop relationship graph traversal, filters, clustering and graph export.
- Recommendations and sourced Interesting Facts presentation.
- Streaming availability and regional catalogue research.
- User-configurable source priority and additional providers.
- Worker rate limiting, access control and operational monitoring.
- Real-device iPhone and Windows acceptance testing.

## Earlier build context

- **0.1.0 (7 November 2026):** Earlier foundation. User reported visual mismatch and non-responsive buttons when opening the file directly. Its JavaScript module loading was a likely cause.
- **0.2.0 (7 November 2026):** Earlier attempt to correct the UI. User reported continued visual mismatch, missing delete functionality and insufficient live research. It is superseded by this revised 0.1 draft direction, not silently promoted as a release.
