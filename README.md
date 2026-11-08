# Entertainment Relationship Explorer
## 0.1 Draft 2

A cinematic, online-first entertainment research and visualisation PWA for personal use.

This is a working draft, not a finished release. It replaces the earlier simplified 0.1/0.2 attempts for review. The semantic release remains 0.1 while the foundation is being corrected.

## What this draft contains

- Responsive cinematic dark interface for iPhone and Windows.
- Overview, Explore, Research Search, Connections, What's New, Saved Research and Settings.
- Direct public-source search for TVmaze and Wikipedia.
- Optional Cloudflare research gateway for MusicBrainz, Open Library, Apple Search, TMDB, Brave web/news search and independent AI reasoning.
- Source-backed relationship map. Unsupported connections are not invented.
- IndexedDB personal library with save, edit, delete, export and merge import. Saved searches and relationship maps can be reopened offline and refreshed when online.
- PWA manifest, icons and service worker.
- Full approved Entertainment Relationship Explorer v3.8 prompt included and embedded in the Worker.

## Important behaviour

- Search is online-first.
- Offline use is for the app shell and research the user has explicitly saved.
- No sample entries are preloaded into the personal library.
- Search results are not automatically saved.
- API keys are never entered into the browser. Optional keys belong in Cloudflare Worker secrets.
- Direct mode without the Worker is deliberately limited to TVmaze and Wikipedia. Connect the Worker for specialist databases, wider web search and AI.

## 1. Test the app locally

The app no longer uses JavaScript modules. You can open `index.html` directly to inspect the interface and local controls. For reliable API testing and PWA behaviour, use a local web server:

1. Extract the ZIP.
2. Open a terminal in the project folder.
3. Run:

   ```bash
   python -m http.server 8000
   ```

4. Open `http://localhost:8000`.
5. Try navigation, search, save, edit, delete, export and import.

A directly opened `file://` page cannot install a service worker. Publish through HTTPS to test PWA installation.

## 2. Publish through GitHub Pages

1. Sign in to GitHub.
2. Create a new repository for this project.
3. Extract the ZIP on your Windows laptop.
4. Upload the contents of the `Entertainment_Relationship_Explorer_v0.1-draft-2` folder to the repository root. Do not upload the ZIP itself as the only repository file.
5. Open the repository's **Settings**.
6. Open **Pages**.
7. Under Build and deployment, choose **Deploy from a branch**.
8. Choose branch `main` and folder `/ (root)`, then save.
9. Wait for GitHub Pages to publish and open the supplied HTTPS URL.

The app can be used without the optional Worker, but search coverage is limited.

## 3. Deploy the optional Cloudflare research gateway

1. Open the `worker` folder in a terminal.
2. Install Wrangler if needed: `npm install -g wrangler`.
3. Sign in: `wrangler login`.
4. Deploy from the `worker` folder: `wrangler deploy`.
5. Copy the `workers.dev` URL.
6. Open the PWA Settings, choose **Connections & AI**, paste the Worker URL and save it.
7. Select **Check connection**.
8. After GitHub Pages is live, change `ALLOWED_ORIGINS` in `worker/wrangler.toml` from `*` to the exact GitHub Pages origin and redeploy.

The Worker can search MusicBrainz, Open Library, Apple Search, TVmaze and Wikipedia without paid keys. Add optional secrets for TMDB and Brave Search if you want those services.

### Optional service secrets

From the `worker` folder, run only for services you choose:

```bash
wrangler secret put TMDB_API_KEY
wrangler secret put BRAVE_API_KEY
wrangler secret put AI_API_KEY
```

For AI, set `AI_BASE_URL`, `AI_MODEL` and `AI_PROVIDER_NAME` in `wrangler.toml`, then deploy. The endpoint must support OpenAI-compatible `/chat/completions`. The API key remains in Cloudflare and is not sent to the browser.

Brave Search is a metered service. Check its current price before adding a key. TMDB requires an account/API key and the approved logo plus attribution before it is enabled. Provider API usage may incur charges. A ChatGPT subscription does not automatically include OpenAI API usage. Do not assume optional keys are free.

## 4. iPhone installation

After GitHub Pages is live:

1. Open the HTTPS site in Safari on your iPhone.
2. Tap Share.
3. Choose **Add to Home Screen**.
4. Launch it from the new Home Screen icon.
5. Save one research item, close the app, reopen it and confirm the item remains.
6. With the item saved, briefly enable Airplane Mode and confirm it remains viewable. Live search should be unavailable offline.

This device test has not yet been performed by the build environment.

## 5. Backups

Open Saved Research or Settings and choose **Export backup**. Keep the JSON file somewhere you control. Import uses merge behaviour and skips duplicates. Never upload personal backup files to the public repository.

## Optional developer checks

From the project root, with Node.js 20+ and Python 3 available:

```bash
node tests/api-smoke.cjs
node tests/worker-smoke.mjs
python tests/static-check.py
```

For a browser interaction smoke test using mocked source responses, start the local server and open `http://localhost:8000/tests/smoke.html`. This checks navigation, search rendering, result details, graph rendering, save/edit/delete, saved snapshots and backup merge behaviour. It does not test live provider services.

## Project documents

- `docs/architecture.md` — recovered approved architecture and implementation structure.
- `docs/specification.md` — current functional scope and limitations.
- `docs/testing.md` — test instructions and acceptance boundaries.
- `docs/build-validation.md` — actual checks performed and limitations.
- `docs/provider-notes.md` — source usage, attribution, rate limits and provider costs.
- `docs/requirements-traceability.md` — approved requirements mapped to implemented, partial and deferred status.
- `docs/changelog.md` — complete technical history for this draft.
- `docs/Entertainment_Relationship_Explorer_Master_Prompt_v3.8.md` — full controlling research prompt.
- `docs/three-levels-of-intelligence-reference.png` — recovered architecture reference image.
- `worker/README.md` — Worker setup and security notes.

## Known limitations

- Live upstream API responses could not be tested from the build container because outbound network access was unavailable.
- Direct mode is limited to TVmaze and Wikipedia.
- Wider web/news search requires Brave Search configuration in the Worker.
- TMDB search requires a TMDB API key and the approved TMDB logo plus required attribution in the app Credits section.
- In-app AI requires a configured OpenAI-compatible endpoint and Cloudflare secret.
- Full v3.8 report generation, deep specialist research, complete link verification, regional streaming availability and multi-hop graph traversal are not yet implemented.
- Real iPhone and Windows device acceptance testing remains outstanding.

See `docs/testing.md` and `docs/changelog.md` before treating this as a release.
