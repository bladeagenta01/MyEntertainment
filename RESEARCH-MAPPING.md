# Entertainment 3.8 to Entertainment Research application mapping

This mapping is the first reverse-engineering pass. It preserves the v3.8 research obligations while changing how users enter requests and how the result is presented.

| v3.8 capability | Application treatment | Output behaviour |
|---|---|---|
| Entity identification and classification | Automatic by default, optional user override | Identify exact subject and ambiguity before selecting a specialist method |
| Specialist research engines | Selected from detected category and entity | Music, album, song, film, television, person, book, documentary, franchise, classical and other relevant methods |
| Connected entertainment graph | Backend research instruction | Follow meaningful direct and indirect links without inventing relationships |
| Past, present and future intelligence | Backend research instruction | Historical context, current developments and upcoming radar when relevant |
| Research depth 1 to 4 | Visible selector, default 2 | Controls breadth, not whether verification and citations are required |
| IMDb and TMDB checks | Mandatory backend instruction for screen entities | Exact entity links where verifiable; disclose missing/unverified pages |
| Music specialist references | Mandatory backend instruction | Official pages, MusicBrainz, Discogs, AllMusic and other suitable specialist sources |
| Source/adaptation lineage | Backend research instruction | Distinguish adaptation, remake, reboot, sequel, cover, sample, influence and interpretation |
| Relationship Explorer | Backend research instruction | Explain useful people, works, credits and cross-media connections |
| Critical reception and landmark versions | Subject-dependent output | Include where materially relevant and supported |
| Current news and future release radar | Live web search required | Research fresh claims rather than relying on model memory |
| Regional availability | Optional region selector; never infer | Distinguish global announcement from confirmed local availability |
| Spoiler control | Visible selector, spoiler-light default | Apply the selected spoiler policy to narrative works |
| Interesting Facts & Discoveries | Standard substantive output | Normally 3 to 5 sourced facts at Standard depth when evidence permits |
| If You Like This, Try These | Standard substantive output | Normally 3 to 6 verified, explained recommendations when useful |
| Verified links and citations | Required | Entity-specific links and evidence citations, including direct database links where applicable |
| Confidence and uncertainty | Required backend instruction | Distinguish confirmed, strongly supported, reported, possible, unknown and credit conflicts where relevant |
| Conversation continuity | Deliberately not carried into pilot | Each search is independent; no follow-up context is retained |
| Saved searches and personal library | Excluded from pilot | No client-side or server-side application search history |

## Presentation mapping

- GitHub Query supplies the simple, narrow, form-led interface and blue accent treatment.
- The supplied Entertainment 3.8 screenshots supply the long-form result presentation: black canvas, white text, prominent section headings, image-led subject details, structured lists, and visible source links.
- The result content must adapt to the entity. An album can have tracks; a film can have cast, crew, production and lineage; a book can have author, publication and adaptation history. Empty generic sections should not be forced into every answer.

## Known gap

The current Worker asks for a well-structured Markdown answer and citations. It does not yet provide a separate image-search operation or a strict typed response schema for every specialist category. That is a deliberate draft limitation and a key candidate for the next review cycle.


## Consolidated BYOK deployment notes
- The browser app calls the Cloudflare Worker configured in `config.js`.
- The single-file Worker exposes `GET /health`, `POST /test` and `POST /research`.
- CORS preflight permits `Content-Type`, `X-User-API-Key` and `X-AI-Provider`.
- The browser stores the API key locally only after a successful provider test and confirms the value by reading it back.
- Search history and prior-query context remain excluded. Saved Info is separate, optional local reference material.
- Similar entertainment recommendations and sourced interesting facts are required standard sections when relevant and supported by evidence.
