# Testing guide

**Build:** 0.1 Draft 2  
**Date:** 8 November 2026

## 1. Test locally

The application uses classic deferred JavaScript files, not JavaScript modules. This avoids the previous module-loading failure when opening `index.html` directly. Browser restrictions may still limit some cross-origin searches from a `file://` page.

Recommended local test:

1. Extract the ZIP.
2. Open a terminal in the extracted project folder.
3. Run `python -m http.server 8000`.
4. Open `http://localhost:8000` in Chrome or Edge.
5. Test navigation, search, save, edit, delete, export and import.

A direct `index.html` open should still render the interface and local controls. Service-worker installation is not available from `file://`.

## 2. Search tests

Without a Worker:
- Search a known TV title such as `The Gentlemen`.
- Search a person or entertainment title using Wikipedia.
- Confirm that the limited-mode warning is visible.
- Confirm that the wider-web search opens in a new tab.

With a Worker:
- Test screen search and TMDB if configured.
- Test MusicBrainz artist search.
- Test Open Library book search.
- Test Apple Search music and film search.
- Test Brave web search and news search if configured.
- Confirm source links open the original record.

The build environment used for this draft had no outbound network access. Live upstream API responses could not be executed from the build container during this run. The APIs and routes are implemented, but live provider response testing remains outstanding.

## 3. Library tests

1. Save a search and a result.
2. Open Saved Research.
3. Reopen the saved search snapshot and confirm it is labelled as a snapshot, not current live information.
4. Open a result, load its relationship map and save the map.
5. Reopen the saved map while offline and confirm the relationship records remain visible.
6. Edit the title and notes.
7. Delete an item and confirm it disappears.
8. Export a backup.
9. Import that backup into the same library. Duplicate records should be skipped, not overwritten.
10. Import into a fresh browser profile and confirm records are added.

## 4. PWA tests

After publishing through GitHub Pages:
- Confirm the manifest loads.
- Confirm the service worker installs.
- Refresh and confirm the app shell is cached.
- Disconnect the internet and confirm the app shell and saved research remain accessible.
- Confirm live search is unavailable offline and does not pretend otherwise.
- Test installation and launch from the iPhone Home Screen on a real iPhone.
- Test desktop layout and keyboard focus on Windows.

## 5. Worker tests

- `GET /api/health`
- `GET /api/status`
- `GET /api/search?q=Blade%20Runner&category=screen&region=IE`
- `GET /api/news?q=Yello&kind=news&region=IE` (requires Brave secret)
- `GET /api/entity?source=tvmaze&id=<TVMAZE_ID>`
- `POST /api/reason` (requires AI secret, base URL and model)

Check the browser console and Worker logs for errors. Do not expose secrets in screenshots, commits or logs.

## 6. Automated test commands

Run from the project root with Node.js 20+ and Python 3:

```bash
node tests/api-smoke.cjs
node tests/worker-smoke.mjs
python tests/static-check.py
```

The browser interaction harness is `tests/smoke.html`. Serve the project on localhost and open `/tests/smoke.html`. It uses mocked responses to test the interface without requiring live internet APIs.

## 7. Checks performed in the build environment

The following source and mock checks were run in this build environment. ZIP integrity is checked after packaging:
- JavaScript syntax checks for every app and Worker script.
- HTML parsing and duplicate-ID check.
- JSON parse for the manifest and Wrangler configuration.
- Service-worker shell path existence check.
- Required feature and event-action wiring checks.
- Mocked browser API-adapter tests.
- Mocked Cloudflare Worker route tests, including AI prompt injection and source matching.
- ZIP archive integrity check.
- Browser interaction smoke harness included at `tests/smoke.html`. Browser automation was attempted but could not be run in this build environment because browser launch/navigation was blocked by the execution environment.

## 8. Acceptance boundary

A passing static or mocked test does not prove that the app works on the user's iPhone or Windows laptop. Those device checks remain explicitly outstanding until performed on the actual devices.
