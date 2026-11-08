# Product specification
## Entertainment Relationship Explorer, 0.1 Draft 2

**Date:** 8 November 2026  
**Status:** Working draft. Not a release candidate.  
**Controlling research prompt:** Version 3.8, dated 7 November 2026.

## 1. Product purpose

An online-first entertainment research and visualisation PWA. It helps the user search entertainment sources, inspect records, explore source-backed relationships and save selected research for later use.

The application is not intended to be a static offline entertainment database. The offline function is personal research retention only.

## 2. Supported subject areas

- Films, TV series, seasons, episodes, streaming and broadcast programmes.
- Actors, directors, writers, producers, composers, crew and characters.
- Music artists, bands, albums, EPs, songs, recordings, releases, versions, soundtracks and scores.
- Classical composers, compositions, performers, orchestras, conductors and recordings.
- Books, authors, publishers, adaptations and source material.
- Documentaries, franchises, labels, studios, platforms, broadcasters, genres, awards, festivals and cross-media subjects.

The complete approved v3.8 prompt is included at `docs/Entertainment_Relationship_Explorer_Master_Prompt_v3.8.md` and embedded into the Worker research prompt.

## 3. Navigation and screens

1. **Overview:** Search entry point, intelligence levels, category shortcuts and saved research summary.
2. **Explore:** Film/TV, music, books, people and cross-media starting points.
3. **Research Search:** Category-scoped search, live results, source labels, details, save and connection actions.
4. **Connections:** SVG relationship map and source-backed relationship list.
5. **What's New:** Current news and upcoming-release search through the configured web-search gateway, with an honest external-search fallback.
6. **Saved Research:** Explicitly saved entities and searches. Edit title/notes, delete, export and merge-import.
7. **Settings:** Region, depth, spoiler preference, Worker URL, service status and AI preference.

## 4. Search behaviour in this draft

### Direct mode, no Worker configured

- TVmaze show search for screen and general searches.
- Wikipedia Action API search for all categories.
- The app clearly reports that this is limited direct mode.
- A wider-web search can be opened in the browser.

### Worker mode

- TVmaze.
- MusicBrainz artist search.
- Open Library search.
- Apple Search catalogue search for music and films.
- Wikipedia search.
- Optional TMDB multi-search.
- Optional Brave web search.
- Optional Brave news search.

A source result is not automatically a verified factual claim. Exact entity matching, source corroboration, confidence labels and citations remain mandatory under v3.8.

## 5. Relationship visualisation

- Connections are requested from a source record.
- TVmaze cast and crew records are supported.
- MusicBrainz artist relationships are supported through the Worker.
- TMDB credits and IMDb external-ID lookup are supported when TMDB is configured with its API key and required in-app logo/attribution.
- Open Library author records can be shown from the returned book record.
- Unsupported relationships are not invented. The screen states when no structured relationships were returned.

## 6. Saved research

- Save a selected result, a search snapshot or a source-backed relationship map.
- Reopen saved search snapshots and relationship maps offline. A visible label distinguishes saved snapshots from current live results.
- Refresh saved searches and maps when online.
- Edit the saved title and personal notes.
- Delete any saved item.
- Export JSON backup.
- Import JSON backup using merge behaviour. Existing records are not overwritten. Duplicate fingerprints are skipped.
- The library is local to the browser profile/device.

## 7. AI and security

- AI is optional.
- External ChatGPT, Claude and Gemini websites can be opened, but this is not described as in-app integration.
- In-app AI requires a configured Cloudflare Worker with an OpenAI-compatible endpoint, model and secret key.
- No API key field exists in the browser.
- The Worker uses the complete v3.8 master prompt as its system prompt.
- AI results must identify evidence gaps and must not claim research beyond the supplied source records and any configured web-search results.

## 8. Design and accessibility

- Cinematic dark Design A direction.
- Deep navy surfaces, muted gold highlights, subtle blue/cyan accents and restrained motion.
- Responsive desktop and narrow mobile layouts.
- Bottom navigation on mobile; sidebar navigation on desktop.
- Semantic buttons, visible focus states, reduced-motion support and labelled form controls.
- No external font or UI framework dependency.

## 9. Explicitly not included in this draft

- Full v3.8 specialist analysis and verification workflow as a polished in-app report engine.
- Comprehensive IMDb, TMDB, Rotten Tomatoes, Discogs, AllMusic, BFI, publisher and official-source verification for every entity type.
- Full cross-entity graph traversal, path finding and graph expansion.
- Personalised recommendation engine and Interesting Facts engine beyond the v3.8 AI prompt foundation.
- User accounts, shared cloud library or cross-device synchronisation.
- Production rate limiting, user authentication or public multi-user deployment hardening for the Worker.

These are not silently marked as complete.
