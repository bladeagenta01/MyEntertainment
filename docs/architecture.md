# Entertainment Relationship Explorer
## Recovered architecture baseline and implementation architecture

**Approved baseline date:** 7 November 2026  
**Current working build:** 0.1 Draft 2  
**Research specification:** Entertainment Relationship Explorer Master Prompt v3.8, 7 November 2026

## 1. Baseline decisions preserved

The following decisions were recovered from the approved 7 November project architecture and the user's subsequent clarifications:

- Personal-use application. No mandatory account or login.
- Design A: cinematic dark visual design.
- Installable Progressive Web App for iPhone and Windows, with Android compatibility retained.
- GitHub is the source-control and static-site deployment target.
- HTML, CSS and JavaScript are the core application technologies.
- Cloudflare Workers provide an optional secure research and reasoning gateway.
- IndexedDB stores the user's explicitly saved research on the device.
- The application is online-first for research. Offline operation is for the app shell and previously saved research, not a claim that a complete entertainment database is bundled locally.
- AI architecture remains provider-independent. Credentials must never be placed in the browser or public repository.
- Modular research engines and distinct screens for Overview, Explore, Research Search, Connections, What's New, Saved Research and Settings.

The latest user clarification supersedes any earlier interpretation that the application should function as an offline entertainment database. The app is a research visualiser and personal research workspace.

## 2. Three levels of intelligence

The included `three-levels-of-intelligence-reference.png` is the recovered conceptual architecture image.

### Level 1: Personal research memory

- IndexedDB stores only items the user explicitly saves.
- Saved searches, selected source records and notes remain on the device.
- Saved items can be edited, deleted, exported and merged from backup.
- The service worker caches the application shell only. It does not silently save every live search result.

### Level 2: Live external information

Direct public-source access is used only where browser access is supported. The current direct mode uses TVmaze and the Wikipedia Action API. The optional Worker adds:

- MusicBrainz artist search and relationship lookups.
- Open Library book search.
- Apple Search catalogue results for music and films.
- TMDB search and cast/crew records when a TMDB key is configured.
- Brave web and news search when a Brave key is configured.

### Level 3: Independent reasoning

- The Worker accepts an OpenAI-compatible chat-completions endpoint.
- Provider base URL and model are configuration values. The API key is a Cloudflare secret.
- The full v3.8 master prompt is embedded in the Worker as its research system prompt.
- AI output is an analysis aid. It does not replace source verification.
- External AI websites can be opened without claiming they are integrated with the app.

## 3. Deployment architecture

```text
GitHub Pages
  Static PWA: HTML + CSS + JavaScript
       |                         |
       | public CORS APIs        | configured HTTPS gateway URL
       |                         v
       |                  Cloudflare Worker
       |                    |       |       |
       |                    |       |       +-- AI-compatible provider
       |                    |       +---------- Brave Search
       |                    +------------------ TMDB / MusicBrainz / Open Library / Apple
       |
       +-- TVmaze / Wikipedia

Browser on each device
  IndexedDB: explicitly saved research and notes
  Service worker: app shell only
```

No shared user database is included. The Worker does not store personal library records.

## 4. Data and privacy boundaries

| Data | Location | Sent to gateway? |
|---|---|---|
| Search query | Browser memory during search | Sent to public source APIs directly in direct mode, or to the Worker when gateway search is used |
| Search results | Browser memory until saved or dismissed | Selected source records are sent to the Worker only when the user requests gateway AI reasoning |
| Saved research | Local IndexedDB | No |
| Notes | Local IndexedDB | No. Notes are not included in the current AI request payload |
| Worker URL and preferences | Local storage | No |
| API credentials | Cloudflare Worker secrets | Never returned to the browser |

No analytics, advertising, mandatory account, remote personal database or automatic upload of saved research is included.

## 5. PWA behaviour

- GitHub Pages provides HTTPS hosting.
- The manifest and icons support installation.
- The service worker caches the application shell and local assets.
- Live search and AI require an internet connection.
- Saved research remains accessible offline after it has been saved.
- Clearing browser/site data can remove the local library. The user should export a backup.
- iOS PWA behaviour must be checked on a real iPhone. Desktop tests do not prove iOS installation or persistence behaviour.

## 6. Source-control structure

The project is designed for a GitHub repository. The PWA is the repository root; the Worker is in `/worker`. The Worker is deployed separately to Cloudflare.

No API keys, `.dev.vars`, `.env`, personal backups or saved research belong in the public repository.

## 7. Recovered-specification limitation

The separate full architecture document dated 7 November 2026 was not found as a distinct Library file during this run. The baseline above uses the recovered approved architecture decisions from the project context and the exact v3.8 master prompt retrieved from the user's Library. Any additional implementation detail in this draft is labelled as an implementation decision rather than falsely attributed to the missing original document.
