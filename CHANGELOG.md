# Change Log

## v0.1 Pilot Draft 1. No-AI revision

Date: 10 November 2026
Status: revised review draft. Not a release.

### Reason for revision

The first draft incorrectly used the OpenAI Responses API and AI web search. The user clarified that the application must not depend on AI and should perform deterministic live retrieval using the selected classification, choices and question. The user also requested an entirely empty question box and no search memory.

### Changes made

- Removed all OpenAI API calls and AI model configuration.
- Removed the AI-specific Worker prompt module from the deployment package.
- Replaced the Worker with fixed retrieval calls to public catalogue services.
- Added Wikipedia search for all categories.
- Added Apple iTunes Search lookups for music.
- Added TVmaze lookups for television.
- Added Open Library lookups for books.
- Added rule-based category classification using keywords when Automatic is selected.
- Replaced the AI-generated Markdown response renderer with a structured catalogue-result renderer.
- Removed the example text from the question box. The field is blank.
- Removed the example preview button to avoid confusing illustrative data with live research.
- Updated status messages, README, research mapping and deployment instructions to remove AI setup requirements.
- Kept the approved Entertainment 3.8 source prompt as a reference document only. It is not executed by this pilot.
- Retained no-history/no-storage behaviour.

### Decisions and rationale

- No AI model, AI API key or generative endpoint is used.
- Cloudflare Worker is retained only as a stateless retrieval gateway to avoid exposing future provider credentials and to centralise source requests.
- Public catalogue APIs are used where practical. Current provider availability and limits are outside the application's control.
- Search results are displayed as source records. The application does not invent narrative analysis, connections, recommendations or verification.
- Automatic classification is explicitly keyword-based. The user can choose a category when the subject is ambiguous.
- Region and spoiler controls remain visible for the intended future design but are not represented as functional in this pilot.
- No searches or results are saved by the application.

### Files affected

- `index.html`
- `app.js`
- `config.js`
- `worker/worker.js`
- `wrangler.toml`
- `README.md`
- `RESEARCH-MAPPING.md`
- `CHANGELOG.md`
- Removed `worker/entertainment-v3.8.js` from the deployment package.

### Tests performed

- JavaScript syntax checks: pending final packaging check.
- ZIP integrity check: pending final packaging check.
- No live provider calls or Cloudflare deployment performed from this environment.
- No iPhone Safari or Windows browser end-to-end test performed.

### Known limitations

- Film, games, theatre, people and documentary searches currently rely on Wikipedia results only.
- Music, television and books have limited public catalogue integrations.
- No cross-source fact verification, relationship graph, credits analysis, influence analysis, similarity recommendations, regional streaming availability, spoiler filtering, news search or future release radar is implemented.
- Research depth currently changes the maximum number of catalogue records, not the reasoning depth.
- Region and spoiler controls are retained but not active in retrieval.
- Automatic category detection is based on keywords, not semantic understanding.
- External catalogue providers may rate-limit, change or discontinue endpoints.

### Privacy and migration

No saved user data exists and no migration is required. The app does not use localStorage, IndexedDB, cookies or a database. Public providers receive search terms as required to retrieve records and may maintain their own technical logs.

### Deferred work

- Deploy Worker and test public provider connectivity.
- Test the GitHub Pages app on Windows and iPhone Safari.
- Add deterministic specialist source coverage for film/TV, music credits, gaming, theatre and current news.
- Implement verified relationship and lineage data rather than inferred claims.
- Add transparent, evidence-based recommendation rules.
- Restrict CORS to the deployed GitHub Pages origin and add request abuse controls before wider use.

### Release decision

This remains a review draft. Do not label it a completed research engine or production release until live deployment and the promised research capabilities have been tested.
