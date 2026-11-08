import { RESEARCH_SYSTEM_PROMPT } from './research-prompt.js';

let lastMusicBrainzRequest = 0;
let lastOpenLibraryRequest = 0;

function originAllowed(origin, env) {
  const allowed = String(env.ALLOWED_ORIGINS || '*').split(',').map(value => value.trim()).filter(Boolean);
  if (!origin || allowed.includes('*')) return true;
  return allowed.includes(origin);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowOrigin = originAllowed(origin, env) ? (origin || '*') : 'null';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(data, status, request, env) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...corsHeaders(request, env) }
  });
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/\s+/g, ' ').trim();
}

function safeUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch (_) { return ''; }
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers: { 'Accept': 'application/json', ...headers }, redirect: 'follow' });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function baseResult(source, sourceName, sourceId, entityType, title, subtitle, summary, url, extras = {}) {
  return {
    id: `${source}:${sourceId || title}`,
    source, sourceName, sourceId: String(sourceId || ''), entityType, title: title || 'Untitled', subtitle: subtitle || '',
    summary: summary || '', url: safeUrl(url), ...extras
  };
}

async function searchTvMaze(q, env) {
  const contact = env.APP_CONTACT || 'https://github.com/';
  const data = await fetchJson(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`, { 'User-Agent': `EntertainmentRelationshipExplorer/0.1 (${contact})` });
  return data.slice(0, 8).map(({ show }) => baseResult('tvmaze', 'TVmaze', show.id, 'TV series', show.name, [show.premiered?.slice(0,4), show.network?.name || show.webChannel?.name].filter(Boolean).join(' · '), stripHtml(show.summary), show.url, {
    image: show.image?.original || show.image?.medium || '', year: show.premiered?.slice(0,4) || '', imdbUrl: show.externals?.imdb ? `https://www.imdb.com/title/${show.externals.imdb}/` : '', raw: { type: 'tvmaze' }
  }));
}

async function searchItunes(q, media, entity) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=${encodeURIComponent(media)}&entity=${encodeURIComponent(entity)}&limit=8`;
  const data = await fetchJson(url);
  return (data.results || []).map(item => {
    const isMovie = item.kind === 'feature-movie';
    const title = item.trackName || item.collectionName || item.artistName || 'Untitled';
    return baseResult('itunes', 'Apple Search', item.trackId || item.collectionId || item.artistId, isMovie ? 'Film' : item.wrapperType === 'artist' ? 'Music artist' : item.kind === 'song' ? 'Song' : 'Music release', title,
      [item.artistName, item.releaseDate?.slice(0,4)].filter(Boolean).join(' · '), [item.primaryGenreName, item.longDescription || item.description].filter(Boolean).join(' · '), item.trackViewUrl || item.collectionViewUrl || item.artistViewUrl, {
        image: (item.artworkUrl600 || item.artworkUrl100 || '').replace('100x100','600x600'), year: item.releaseDate?.slice(0,4) || '', raw: { type: 'itunes', id: item.trackId || item.collectionId || item.artistId }
      });
  });
}


async function paceMusicBrainz() {
  const now = Date.now();
  const delay = Math.max(0, 1050 - (now - lastMusicBrainzRequest));
  if (delay) await new Promise(resolve => setTimeout(resolve, delay));
  lastMusicBrainzRequest = Date.now();
}

async function searchOpenLibrary(q, env) {
  const now = Date.now();
  const delay = Math.max(0, 1050 - (now - lastOpenLibraryRequest));
  if (delay) await new Promise(resolve => setTimeout(resolve, delay));
  lastOpenLibraryRequest = Date.now();
  const contact = env.APP_CONTACT || 'https://github.com/';
  const data = await fetchJson(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8`, { 'User-Agent': `EntertainmentRelationshipExplorer/0.1 (${contact})` });
  return (data.docs || []).map(item => baseResult('openlibrary', 'Open Library', item.key, 'Book', item.title,
    [item.author_name?.slice(0,2).join(', '), item.first_publish_year].filter(Boolean).join(' · '), item.edition_count ? `${item.edition_count} recorded editions` : 'Bibliographic record from Open Library.', `https://openlibrary.org${item.key}`, {
      image: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : '', year: item.first_publish_year || '', raw: { key: item.key, authors: item.author_name || [], authorKeys: item.author_key || [] }
    }));
}

async function searchWikipedia(q, env) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=8&prop=extracts|pageimages|info&exintro=1&explaintext=1&inprop=url&pithumbsize=480&format=json&origin=*`;
  const contact = env.APP_CONTACT || 'https://github.com/';
  const data = await fetchJson(url, { 'User-Agent': `EntertainmentRelationshipExplorer/0.1 (${contact})` });
  return Object.values(data.query?.pages || {}).map(page => baseResult('wikipedia', 'Wikipedia', page.pageid, 'Reference article', page.title, '', page.extract || '', page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_'))}`, {
    image: page.thumbnail?.source || '', raw: { pageid: page.pageid, title: page.title }
  }));
}

async function searchMusicBrainz(q, env) {
  await paceMusicBrainz();
  const contact = env.APP_CONTACT || 'https://github.com/';
  const data = await fetchJson(`https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(q)}&fmt=json&limit=8`, { 'User-Agent': `EntertainmentRelationshipExplorer/0.1 (${contact})` });
  return (data.artists || []).map(item => baseResult('musicbrainz', 'MusicBrainz', item.id, 'Music artist', item.name,
    [item.type, item.country, item['life-span']?.begin].filter(Boolean).join(' · '), item.disambiguation || 'Artist record from MusicBrainz.', `https://musicbrainz.org/artist/${item.id}`, {
      year: item['life-span']?.begin || '', raw: { type: 'musicbrainz', id: item.id }
    }));
}

async function searchTmdb(q, env) {
  if (!env.TMDB_API_KEY || env.TMDB_ATTRIBUTION_READY !== 'yes') return [];
  const data = await fetchJson(`https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(env.TMDB_API_KEY)}&query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`);
  return (data.results || []).slice(0, 10).map(item => {
    const media = item.media_type || 'movie';
    const title = item.title || item.name || 'Untitled';
    const url = `https://www.themoviedb.org/${media}/${item.id}`;
    return baseResult('tmdb', 'TMDB', item.id, media === 'person' ? 'Person' : media === 'tv' ? 'TV series' : 'Film', title,
      [item.release_date?.slice(0,4) || item.first_air_date?.slice(0,4), media === 'person' ? 'Person record' : ''].filter(Boolean).join(' · '), item.overview || item.known_for_department || '', url, {
        image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : item.profile_path ? `https://image.tmdb.org/t/p/w500${item.profile_path}` : '', year: item.release_date?.slice(0,4) || item.first_air_date?.slice(0,4) || '', tmdbUrl: url, raw: { type: media, id: item.id }
      });
  });
}

async function searchBrave(q, env, region = 'IE') {
  if (!env.BRAVE_API_KEY) return [];
  const params = new URLSearchParams({ q, count: '8', search_lang: 'en' });
  if (region && region !== 'WORLD') params.set('country', region);
  const data = await fetchJson(`https://api.search.brave.com/res/v1/web/search?${params.toString()}`, { 'X-Subscription-Token': env.BRAVE_API_KEY });
  return (data.web?.results || []).map(item => baseResult('brave', 'Brave Search', item.url, 'Web research', item.title, item.profile?.long_name || item.meta_url?.hostname || '', item.description || '', item.url, { raw: { age: item.age || '' } }));
}

async function routeSearch(url, env, request) {
  const q = (url.searchParams.get('q') || '').trim();
  const category = url.searchParams.get('category') || 'all';
  const region = (url.searchParams.get('region') || 'IE').toUpperCase();
  if (q.length < 2 || q.length > 140) return json({ error: 'Search text must be between 2 and 140 characters.' }, 400, request, env);
  const tasks = [];
  const add = (name, fn) => tasks.push({ name, promise: fn() });
  const wants = key => category === 'all' || category === 'cross' || category === key;

  if (wants('screen')) {
    add('TVmaze', () => searchTvMaze(q, env));
    add('Apple Search', () => searchItunes(q, 'movie', 'movie'));
    if (env.TMDB_API_KEY) add('TMDB', () => searchTmdb(q, env));
  }
  if (wants('music')) add('Apple Search', () => searchItunes(q, 'music', 'musicArtist,album,song'));
  if (wants('music') || category === 'people') add('MusicBrainz', () => searchMusicBrainz(q, env));
  if (wants('books')) add('Open Library', () => searchOpenLibrary(q, env));
  add('Wikipedia', () => searchWikipedia(q, env));
  if (env.BRAVE_API_KEY) add('Brave Search', () => searchBrave(q, env, region));
  if (!tasks.length) add('Wikipedia', () => searchWikipedia(q, env));

  const settled = await Promise.allSettled(tasks.map(task => task.promise));
  const results = [];
  const warnings = [];
  const sources = [];
  settled.forEach((entry, index) => {
    if (entry.status === 'fulfilled') { results.push(...entry.value); sources.push(tasks[index].name); }
    else warnings.push(`${tasks[index].name}: ${entry.reason?.message || 'request failed'}`);
  });
  const unique = new Map();
  results.forEach(item => { if (!unique.has(item.id)) unique.set(item.id, item); });
  return json({ results: Array.from(unique.values()), warnings, sources, region, researchedAt: new Date().toISOString() }, 200, request, env);
}

async function routeNews(url, env, request) {
  if (!env.BRAVE_API_KEY) return json({ error: 'BRAVE_API_KEY is not configured in the research gateway.' }, 503, request, env);
  const q = (url.searchParams.get('q') || '').trim();
  const kind = url.searchParams.get('kind') || 'news';
  const region = (url.searchParams.get('region') || 'IE').toUpperCase();
  if (q.length < 2 || q.length > 140) return json({ error: 'Search text must be between 2 and 140 characters.' }, 400, request, env);
  const endpoint = kind === 'news' ? 'news' : 'web';
  const params = new URLSearchParams({ q, count: '10', search_lang: 'en' });
  if (region !== 'WORLD') params.set('country', region);
  const data = await fetchJson(`https://api.search.brave.com/res/v1/${endpoint}/search?${params.toString()}`, { 'X-Subscription-Token': env.BRAVE_API_KEY });
  const rows = kind === 'news' ? (data.results || []) : (data.web?.results || []);
  const results = rows.map(item => ({ source: 'Brave Search', title: item.title || '', description: item.description || '', url: safeUrl(item.url || ''), age: item.age || item.page_age || '' })).filter(item => item.url);
  return json({ results, researchedAt: new Date().toISOString(), kind, region }, 200, request, env);
}


function normaliseTitle(value) {
  return String(value || '').toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

async function verifyTmdbMatch(title, year, env) {
  if (!env.TMDB_API_KEY || env.TMDB_ATTRIBUTION_READY !== 'yes' || !title) return { warning: 'TMDB link not checked. Configure the TMDB key and complete the required in-app attribution first.' };
  const data = await fetchJson(`https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(env.TMDB_API_KEY)}&query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1`);
  const wanted = normaliseTitle(title);
  let candidates = (data.results || []).filter(item => ['movie', 'tv'].includes(item.media_type) && normaliseTitle(item.title || item.name) === wanted);
  if (year) {
    const sameYear = candidates.filter(item => String(item.release_date || item.first_air_date || '').slice(0, 4) === String(year).slice(0, 4));
    if (sameYear.length) candidates = sameYear;
  }
  if (candidates.length !== 1) return { warning: candidates.length ? 'TMDB returned multiple plausible matches. No direct TMDB/IMDb link was selected.' : 'No exact TMDB title match was found. No direct TMDB/IMDb link was selected.' };
  const match = candidates[0];
  const type = match.media_type;
  const details = await fetchJson(`https://api.themoviedb.org/3/${type}/${match.id}?api_key=${encodeURIComponent(env.TMDB_API_KEY)}&append_to_response=external_ids`);
  return {
    tmdbUrl: `https://www.themoviedb.org/${type}/${match.id}`,
    imdbUrl: details.external_ids?.imdb_id ? `https://www.imdb.com/title/${details.external_ids.imdb_id}/` : '',
    matchTitle: match.title || match.name || title,
    matchYear: (match.release_date || match.first_air_date || '').slice(0, 4)
  };
}

async function routeEntity(url, env, request) {
  const source = url.searchParams.get('source') || '';
  const id = url.searchParams.get('id') || '';
  if (!id || id.length > 120) return json({ error: 'A valid source record ID is required.' }, 400, request, env);
  let relationships = [];
  const warnings = [];
  if (source === 'tvmaze') {
    const [castResult, crewResult] = await Promise.allSettled([
      fetchJson(`https://api.tvmaze.com/shows/${encodeURIComponent(id)}/cast`),
      fetchJson(`https://api.tvmaze.com/shows/${encodeURIComponent(id)}/crew`)
    ]);
    if (castResult.status === 'fulfilled') castResult.value.slice(0, 8).forEach(entry => relationships.push({ title: entry.person?.name || 'Cast member', type: entry.character?.name ? `Played ${entry.character.name}` : 'Cast member', url: entry.person?.url || '', source: 'TVmaze' }));
    else warnings.push(`TVmaze cast: ${castResult.reason?.message || 'unavailable'}`);
    if (crewResult.status === 'fulfilled') crewResult.value.slice(0, 6).forEach(entry => relationships.push({ title: entry.person?.name || 'Crew member', type: entry.type || 'Crew member', url: entry.person?.url || '', source: 'TVmaze' }));
    else warnings.push(`TVmaze crew: ${crewResult.reason?.message || 'unavailable'}`);
    const verified = await verifyTmdbMatch(url.searchParams.get('title') || '', url.searchParams.get('year') || '', env);
    if (verified.tmdbUrl) return json({ relationships, warnings, imdbUrl: verified.imdbUrl || '', tmdbUrl: verified.tmdbUrl, matchTitle: verified.matchTitle, matchYear: verified.matchYear }, 200, request, env);
    if (verified.warning) warnings.push(verified.warning);
  } else if (source === 'itunes') {
    const verified = await verifyTmdbMatch(url.searchParams.get('title') || '', url.searchParams.get('year') || '', env);
    if (verified.tmdbUrl) return json({ relationships, warnings, imdbUrl: verified.imdbUrl || '', tmdbUrl: verified.tmdbUrl, matchTitle: verified.matchTitle, matchYear: verified.matchYear }, 200, request, env);
    if (verified.warning) warnings.push(verified.warning);
  } else if (source === 'musicbrainz') {
    await paceMusicBrainz();
    const contact = env.APP_CONTACT || 'https://github.com/';
    const data = await fetchJson(`https://musicbrainz.org/ws/2/artist/${encodeURIComponent(id)}?inc=artist-rels+url-rels&fmt=json`, { 'User-Agent': `EntertainmentRelationshipExplorer/0.1 (${contact})` });
    (data.relations || []).slice(0, 14).forEach(rel => {
      const target = rel.artist || rel.work || rel.label || rel.place || rel.url;
      const title = target?.name || target?.title || target?.resource || '';
      if (title) relationships.push({ title, type: rel.type || 'Related entity', url: target?.id && rel.artist ? `https://musicbrainz.org/artist/${target.id}` : target?.id && rel.work ? `https://musicbrainz.org/work/${target.id}` : target?.resource || '', source: 'MusicBrainz' });
    });
  } else if (source === 'tmdb') {
    if (!env.TMDB_API_KEY || env.TMDB_ATTRIBUTION_READY !== 'yes') return json({ error: 'TMDB is not enabled. Configure TMDB_API_KEY and complete the official in-app attribution first.' }, 503, request, env);
    const type = url.searchParams.get('type') || 'movie';
    if (type === 'person') {
      const data = await fetchJson(`https://api.themoviedb.org/3/person/${encodeURIComponent(id)}?api_key=${encodeURIComponent(env.TMDB_API_KEY)}&append_to_response=external_ids,combined_credits`);
      const credits = [...(data.combined_credits?.cast || []), ...(data.combined_credits?.crew || [])];
      credits.slice(0, 14).forEach(work => relationships.push({ title: work.title || work.name || 'Screen work', type: work.character ? `Cast · ${work.character}` : work.job || 'Crew credit', url: `https://www.themoviedb.org/${work.media_type || 'movie'}/${work.id}`, source: 'TMDB' }));
      return json({ relationships, warnings, imdbUrl: data.external_ids?.imdb_id ? `https://www.imdb.com/name/${data.external_ids.imdb_id}/` : '', tmdbUrl: `https://www.themoviedb.org/person/${id}` }, 200, request, env);
    }
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const data = await fetchJson(`https://api.themoviedb.org/3/${mediaType}/${encodeURIComponent(id)}?api_key=${encodeURIComponent(env.TMDB_API_KEY)}&append_to_response=credits,external_ids`);
    const cast = data.credits?.cast || [];
    const crew = data.credits?.crew || [];
    cast.slice(0, 8).forEach(person => relationships.push({ title: person.name, type: person.character ? `Played ${person.character}` : 'Cast member', url: `https://www.themoviedb.org/person/${person.id}`, source: 'TMDB' }));
    crew.filter(person => /director|writer|producer|composer/i.test(person.job || '')).slice(0, 6).forEach(person => relationships.push({ title: person.name, type: person.job, url: `https://www.themoviedb.org/person/${person.id}`, source: 'TMDB' }));
    return json({ relationships, warnings, imdbUrl: data.external_ids?.imdb_id ? `https://www.imdb.com/title/${data.external_ids.imdb_id}/` : '', tmdbUrl: `https://www.themoviedb.org/${mediaType}/${id}` }, 200, request, env);
  } else {
    warnings.push('This source does not expose structured relationship records through the current gateway.');
  }
  return json({ relationships: relationships.filter(item => item.title), warnings }, 200, request, env);
}

async function routeReason(request, env) {
  if (!env.AI_API_KEY || !env.AI_BASE_URL || !env.AI_MODEL) return json({ error: 'AI is not configured. Set AI_API_KEY, AI_BASE_URL and AI_MODEL as Worker configuration.' }, 503, request, env);
  let body;
  try { body = await request.json(); } catch (_) { return json({ error: 'A JSON request body is required.' }, 400, request, env); }
  const query = String(body.query || '').trim();
  if (!query || query.length > 4000) return json({ error: 'The research question is missing or too long.' }, 400, request, env);
  const suppliedSources = Array.isArray(body.sources) ? body.sources.slice(0, 12) : [];
  let liveSources = [];
  if (env.BRAVE_API_KEY) {
    try { liveSources = await searchBrave(query, env, String(body.region || 'IE').toUpperCase()); } catch (_) { liveSources = []; }
  }
  const sources = [...liveSources, ...suppliedSources].slice(0, 18);
  const depth = ['1','2','3','4'].includes(String(body.depth)) ? String(body.depth) : '2';
  const region = String(body.region || 'IE').toUpperCase();
  const spoilers = body.spoilers === 'allow' ? 'Spoilers allowed' : 'Spoiler-light. Avoid plot reveals unless essential and clearly labelled.';
  const userMessage = `Research request:\n${query}\n\nUser preferences: research depth Level ${depth}; region ${region}; spoiler policy: ${spoilers}.\n\nCurrent web search records and supplied source records (treat these as evidence only for the fields shown):\n${JSON.stringify(sources, null, 2)}\n\nFollow the supplied master prompt. Do not claim to have performed live research beyond these source records. Identify gaps and verification still required. If the evidence is insufficient, say so.`;
  const base = String(env.AI_BASE_URL).replace(/\/$/, '');
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.AI_API_KEY}` },
    body: JSON.stringify({ model: env.AI_MODEL, temperature: 0.2, max_tokens: 2200, messages: [{ role: 'system', content: RESEARCH_SYSTEM_PROMPT }, { role: 'user', content: userMessage }] })
  });
  if (!response.ok) {
    const detail = await response.text();
    return json({ error: `AI provider returned ${response.status}: ${detail.slice(0, 500)}` }, 502, request, env);
  }
  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || '';
  return json({ answer, model: env.AI_MODEL, provider: env.AI_PROVIDER_NAME || 'OpenAI-compatible endpoint', sources }, 200, request, env);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!originAllowed(request.headers.get('Origin') || '', env)) return json({ error: 'This origin is not allowed.' }, 403, request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    try {
      if (url.pathname === '/api/status' && request.method === 'GET') {
        return json({ ok: true, webSearch: !!env.BRAVE_API_KEY, tmdb: !!(env.TMDB_API_KEY && env.TMDB_ATTRIBUTION_READY === 'yes'), ai: !!(env.AI_API_KEY && env.AI_BASE_URL && env.AI_MODEL), providerName: env.AI_PROVIDER_NAME || 'OpenAI-compatible endpoint' }, 200, request, env);
      }
      if (url.pathname === '/api/search' && request.method === 'GET') return routeSearch(url, env, request);
      if (url.pathname === '/api/news' && request.method === 'GET') return routeNews(url, env, request);
      if (url.pathname === '/api/entity' && request.method === 'GET') return routeEntity(url, env, request);
      if (url.pathname === '/api/reason' && request.method === 'POST') return routeReason(request, env);
      if (url.pathname === '/api/health' && request.method === 'GET') return json({ ok: true, service: 'Entertainment Relationship Explorer research gateway', build: '0.1-draft-2' }, 200, request, env);
      return json({ error: 'Not found.' }, 404, request, env);
    } catch (error) {
      return json({ error: error.message || 'The research gateway encountered an error.' }, 500, request, env);
    }
  }
};
