# Entertainment 3.8 to Pilot Mapping

This document distinguishes the intended research scope from what this no-AI first pilot actually implements.

| Entertainment 3.8 requirement | Current pilot status | Notes |
|---|---|---|
| Entertainment subject classification | Partial | Menu selection works. Automatic classification uses simple keywords and is not semantic entity recognition. |
| Specialist research approaches | Partial | Music, television and books have dedicated catalogue lookups. Other categories currently use Wikipedia retrieval. |
| Research depth 1 to 4 | Partial | Depth changes the number of returned records. It does not yet change analytical depth. |
| Relationship graph and connections | Not implemented | No relationship is inferred from coincidental search matches. |
| Verified entity-specific references | Partial | Direct links to the returned provider records are shown. Cross-source verification is not implemented. |
| IMDb and TMDB checks | Not implemented | No IMDb or TMDB integration is present. |
| MusicBrainz, Discogs and AllMusic checks | Not implemented | Apple iTunes Search and Wikipedia are used in this pilot. |
| Current news and future release radar | Not implemented | No dedicated news or release search provider is connected. |
| Regional availability | Not implemented | Region control is retained but does not currently change results. |
| Spoiler controls | Not implemented | Spoiler choice is retained but the current catalogue records are not transformed or filtered by it. |
| Adaptation, remake and franchise lineage | Not implemented | Requires explicit relationship data and verification rules. |
| Similar entertainment recommendations | Not implemented | No recommendation engine is claimed. |
| Interesting facts and discoveries | Not implemented | No generated facts. Only source catalogue descriptions are displayed. |
| Confidence and uncertainty labels | Partial | The interface states the limits of source records. It does not calculate confidence scores. |
| Images and visual research output | Partial | Provider artwork is shown when a source supplies an image URL. No general image search is implemented. |
| Independent searches with no memory | Implemented at application level | No app database, browser storage or search history. External providers may retain technical logs under their own policies. |

## No-AI design rule

The pilot does not call a generative model. It does not require an AI API key. The Worker performs fixed API requests to public catalogues and returns structured records. The browser renders those records. The application must not describe catalogue retrieval as full narrative research or claim that it has verified facts it has not cross-checked.

## Next deterministic development stages

1. Improve category/entity classification without generative AI, including clearer user-selected categories and deterministic rules.
2. Add dedicated film and television data integrations, with explicit IMDb/TMDB link checks where permitted and available.
3. Add music credits and release data integrations.
4. Add a news/search provider for current and upcoming information. This may require a conventional search API, but not an AI model.
5. Build explicit relationship tables and verification rules for collaborators, adaptations, remakes, franchises and influence. Distinguish documented links from editorial similarity.
6. Add recommendation rules based on declared shared attributes, with explanations showing the evidence for each match.
7. Only mark features as implemented after source-level and end-to-end tests.
