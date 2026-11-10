# Entertainment Research v0.1 Pilot Draft 1

Status: revised review draft. Not a production release.

## Purpose

A simple, search-led entertainment research application. The GitHub Query project is used only as the interface and interaction reference. Entertainment Relationship Explorer v3.8 supplies the research scope. The supplied screenshots guide the black, illustrated, long-form results presentation.

## Important architecture decision

This revision has **no AI model dependency and makes no AI API calls**. It does not require an OpenAI key, any other model key, or an AI account.

The application uses fixed classification rules and retrieves records from public catalogue services through a Cloudflare Worker. The Worker does not generate answers. The browser formats the returned records into a consistent results page.

This is a deliberately limited first pilot. It is a catalogue retrieval application, not yet a full web research agent. It cannot reproduce all open-ended synthesis, relationship reasoning, current-news discovery or verification capabilities in the Entertainment 3.8 ChatGPT prompt without additional deterministic data sources and explicitly designed rules.

## Included functionality

- Empty question box. No example placeholder.
- Entertainment-specific category menu, with automatic keyword classification as an option.
- Research depth selection.
- Optional region and spoiler controls retained for the future research stages. They do not currently alter provider results.
- Live retrieval from Wikipedia across categories.
- Additional live catalogue retrieval for music (Apple iTunes Search), television (TVmaze), and books (Open Library).
- Source labels and direct links for returned records.
- Black results presentation with optional source artwork.
- New Search clears the current question and results.
- No saved searches, history, user profile, browser storage, database, cookies, or application memory.

## Current source coverage

| Category | Sources in this pilot | Current limitation |
|---|---|---|
| Music | Wikipedia, Apple iTunes Search | Catalogue matches, not full discography or verified credits |
| Television | Wikipedia, TVmaze | Basic programme records, not episode-level verification |
| Books | Wikipedia, Open Library | Catalogue records, not full literary analysis |
| Film and cinema | Wikipedia | No TMDB or IMDb API integration yet |
| Documentary | Wikipedia | No specialist documentary catalogue yet |
| People | Wikipedia | No comprehensive professional-credit graph |
| Games | Wikipedia | No specialist game database yet |
| Theatre | Wikipedia | No specialist theatre database yet |
| Cross-media | Wikipedia, selected music/TV/book catalogues | Broad discovery only; results are not automatically proven relationships |
| Upcoming | Same available catalogues | No dedicated future-release or live-news search yet |

A missing result does not establish that a work or relationship does not exist. Search results are source records, not independently verified conclusions.

## Files

- `index.html`, `styles.css`, `app.js`: interface and result display.
- `config.js`: deployed Worker URL. No secrets belong here.
- `worker/worker.js`: stateless retrieval gateway. No AI integration or secrets required.
- `wrangler.toml`: Cloudflare Worker deployment configuration.
- `ENTERTAINMENT-3.8-SOURCE-PROMPT.md`: retained reference copy of the approved research specification. It is not executed by the current application.
- `RESEARCH-MAPPING.md`: scope mapping and known implementation gaps.
- `CHANGELOG.md`: revision record.

## Local interface review

1. Extract the ZIP.
2. Open `index.html` in a modern browser to review the interface.
3. Live search requires the Worker to be deployed and its URL entered in `config.js`.

## Deploy the Worker

Prerequisites: a Cloudflare account and Node.js/npm with Wrangler available. No AI account or API key is required.

1. Open a terminal in this project folder.
2. Run `npx wrangler deploy`.
3. Copy the Worker URL shown by Wrangler.
4. Edit `config.js` and set `window.ENTERTAINMENT_API_ENDPOINT` to that HTTPS Worker URL. Do not append `/research`.
5. Publish the static application files to the GitHub Pages repository.
6. Test searches in the published app. Try a music query with the category set to Music, a television query with Television selected, and a book query with Books selected.

The Worker calls public catalogue endpoints. Those providers may change their APIs, impose limits, or be temporarily unavailable. This pilot does not add provider credentials.

## Privacy and no-memory behaviour

The application does not write search terms or results to localStorage, IndexedDB, cookies or an application database. Each request is independent. The Worker does not intentionally persist request or response content. Public catalogue providers will receive the search terms needed to answer the request and may process technical logs under their own policies. This is not a claim that internet infrastructure retains no logs.

## Testing status

The revised JavaScript files are syntax-checked and the ZIP archive is integrity-checked before packaging. The Worker has not been deployed to the user's Cloudflare account from this environment. Live provider calls, GitHub Pages deployment, iPhone Safari and Windows browser behaviour therefore remain unverified.

## Next development boundary

Do not add AI. Do not add search memory. Improve deterministic source coverage and the structured presentation in small, testable steps. In particular, a future version needs explicit source integrations for film/TV identifiers and credits, news and future releases, regional availability, and relationship verification. Do not present unsupported research capabilities as implemented.
