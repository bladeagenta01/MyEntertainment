# Requirements traceability

| Approved requirement or user clarification | Draft implementation | Status / limitation |
|---|---|---|
| Design A cinematic dark direction | Dark navy/gold responsive UI and cinematic overview | Implemented in draft; visual comparison against the original design images still requires user review |
| iPhone and Windows layouts | Responsive desktop sidebar and mobile bottom navigation | CSS implemented; real device tests outstanding |
| GitHub/PWA approach | Static PWA, manifest, icons, service worker | Implemented; GitHub Pages publication not performed |
| Online-first research | Direct TVmaze/Wikipedia and optional Worker multi-source search | Implemented in code; live upstream requests not tested in build environment |
| Offline use is for saved research only | Service worker caches shell only; IndexedDB stores explicit saves | Implemented |
| No mandatory account or cloud database | No login or remote personal library | Implemented |
| Search across entertainment categories | Category filters and Worker adapters | Partial; full category coverage needs gateway deployment and additional specialist engines |
| Search current news and upcoming releases | Brave web/news Worker route | Requires Brave API key and gateway deployment |
| Relationship visualiser | SVG graph, TVmaze cast/crew, MusicBrainz relations, TMDB credits, Open Library author links | Partial; no multi-hop traversal, path analysis or full cross-category graph yet |
| Delete supplied sample records | No preloaded personal sample records; every saved record has Delete | Implemented |
| Edit saved records | Edit title and personal notes | Implemented |
| Save searches and discoveries | Explicit IndexedDB save actions | Implemented |
| Export and import | JSON backup; merge import and duplicate skipping | Implemented |
| Independent AI architecture | OpenAI-compatible Worker adapter, provider base URL/model variables, secret key | Architecture implemented; provider not configured or live-tested |
| Never expose credentials | No browser API key fields; Cloudflare secrets only | Implemented by design; deployment configuration remains user's responsibility |
| Full v3.8 research standard | Full v3.8 prompt included in package and Worker system prompt | Prompt preserved; many specialist research engines and report workflows are deferred |
| IMDb/TMDB checks for screen entities | IMDb from TVmaze when supplied; optional exact title/year TMDB match and external ID lookup | Partial; TMDB requires key and approved logo/attribution; Rotten Tomatoes and broad screen verification are not implemented |
| Similar entertainment recommendations | Required by v3.8 prompt | Not implemented as a dedicated app feature yet |
| Sourced interesting facts | Required by v3.8 prompt | Not implemented as a dedicated app feature yet |
| Regional availability | Region preference is captured and passed to search/AI | Actual streaming/platform availability research is not implemented yet |
| Confidence and lineage labels | Required by v3.8 prompt | Not implemented as a full structured UI workflow yet |
| Complete UPIEC integration | Separate UPIEC text was not present in recovered files | Not included; must be supplied/retrieved before claiming full compliance |
