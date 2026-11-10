/* Entertainment Research v0.1 Pilot Draft 1
   Deterministic live retrieval. No AI model, AI API, API key or search memory.
   Sources are queried directly and results are formatted by the application. */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin'
};
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});
const clean = value => String(value || '').trim().slice(0, 4000);
const enc = value => encodeURIComponent(value);

async function getJson(url) {
  const response = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'EntertainmentResearchPilot/0.1 (public research client)' } });
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
  return response.json();
}

function classify(query, selected) {
  if (selected && selected !== 'auto') return selected;
  const q = query.toLowerCase();
  if (/\b(album|song|single|band|singer|musician|artist|discography|track|music|record|soundtrack)\b/.test(q)) return 'music';
  if (/\b(tv|television|series|season|episode|streaming|show)\b/.test(q)) return 'television';
  if (/\b(book|novel|author|writer|literature|novella)\b/.test(q)) return 'books';
  if (/\b(game|gaming|video game|playstation|xbox|nintendo)\b/.test(q)) return 'games';
  if (/\b(film|movie|cinema|director|actor|actress|screenplay)\b/.test(q)) return 'film';
  if (/\b(documentary|docuseries)\b/.test(q)) return 'documentary';
  if (/\b(play|theatre|theater|musical|stage production)\b/.test(q)) return 'theatre';
  if (/\b(upcoming|release date|coming soon|next season|new releases)\b/.test(q)) return 'upcoming';
  return 'cross-media';
}

async function wikipedia(query, limit) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${enc(query)}&gsrlimit=${limit}&prop=extracts%7Cpageimages%7Cinfo&exintro=1&explaintext=1&inprop=url&pithumbsize=700&format=json&origin=*`;
  const data = await getJson(url);
  return Object.values(data.query?.pages || {}).map(p => ({
    title: p.title,
    summary: (p.extract || '').slice(0, 1100),
    url: p.fullurl || `https://en.wikipedia.org/?curid=${p.pageid}`,
    image: p.thumbnail?.source || null,
    source: 'Wikipedia'
  }));
}

async function music(query, limit) {
  const tasks = ['album', 'song', 'musicArtist'].map(async entity => {
    const data = await getJson(`https://itunes.apple.com/search?term=${enc(query)}&entity=${entity}&limit=${Math.max(3, Math.ceil(limit / 2))}`);
    return (data.results || []).map(item => ({
      title: item.collectionName || item.trackName || item.artistName,
      subtitle: [item.artistName, item.releaseDate ? String(item.releaseDate).slice(0, 4) : '', item.primaryGenreName].filter(Boolean).join(' · '),
      summary: item.collectionName ? `Album by ${item.artistName || 'unknown artist'}${item.releaseDate ? `, released ${String(item.releaseDate).slice(0, 10)}` : ''}. ${item.trackCount ? `${item.trackCount} tracks.` : ''}` : item.trackName ? `Recording by ${item.artistName || 'unknown artist'}.` : 'Artist catalogue entry.',
      url: item.collectionViewUrl || item.trackViewUrl || item.artistViewUrl || null,
      image: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb') || null,
      source: 'Apple iTunes Search',
      kind: entity
    }));
  });
  return (await Promise.all(tasks)).flat().filter(x => x.title).slice(0, limit);
}

async function television(query, limit) {
  const data = await getJson(`https://api.tvmaze.com/search/shows?q=${enc(query)}`);
  return (data || []).slice(0, limit).map(row => {
    const s = row.show || {};
    return { title: s.name, subtitle: [s.premiered ? s.premiered.slice(0, 4) : '', s.type, s.status].filter(Boolean).join(' · '), summary: (s.summary || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 1100), url: s.url, image: s.image?.original || s.image?.medium || null, source: 'TVmaze' };
  });
}

async function books(query, limit) {
  const data = await getJson(`https://openlibrary.org/search.json?q=${enc(query)}&limit=${limit}&fields=key,title,author_name,first_publish_year,cover_i,edition_count`);
  return (data.docs || []).map(book => ({
    title: book.title,
    subtitle: [book.author_name?.slice(0, 3).join(', '), book.first_publish_year].filter(Boolean).join(' · '),
    summary: `Book catalogue record${book.edition_count ? `. ${book.edition_count} recorded editions` : ''}${book.author_name?.length ? `. Author(s): ${book.author_name.slice(0, 5).join(', ')}` : ''}.`,
    url: book.key ? `https://openlibrary.org${book.key}` : null,
    image: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
    source: 'Open Library'
  }));
}

async function research(body) {
  const query = clean(body.query);
  if (!query) throw Object.assign(new Error('Enter an entertainment subject or question.'), { status: 400 });
  const category = classify(query, String(body.category || 'auto'));
  const depth = Math.min(4, Math.max(1, Number(body.depth) || 2));
  const limit = depth === 1 ? 4 : depth === 2 ? 7 : depth === 3 ? 10 : 12;
  const tasks = [];
  const add = (name, fn) => tasks.push(fn().then(items => ({ name, items, error: null })).catch(error => ({ name, items: [], error: error.message })));

  add('Wikipedia', () => wikipedia(query, limit));
  if (category === 'music') add('Apple iTunes Search', () => music(query, limit));
  if (category === 'television') add('TVmaze', () => television(query, limit));
  if (category === 'books') add('Open Library', () => books(query, limit));
  if (category === 'cross-media' || category === 'upcoming') {
    add('Apple iTunes Search', () => music(query, Math.min(6, limit)));
    add('TVmaze', () => television(query, Math.min(6, limit)));
    add('Open Library', () => books(query, Math.min(6, limit)));
  }
  const results = await Promise.all(tasks);
  const sources = results.flatMap(group => group.items).filter(item => item.url);
  return {
    query,
    category,
    depth,
    region: String(body.region || 'unspecified'),
    spoilers: String(body.spoilers || 'light'),
    researchDate: new Date().toISOString().slice(0, 10),
    groups: results,
    sourceCount: sources.length,
    limitations: [
      'This pilot retrieves and organises records from connected public catalogues. It does not use an AI model or generate open-ended narrative conclusions.',
      'Search coverage depends on the connected source catalogues. A missing result does not prove that an entertainment work or relationship does not exist.',
      'Regional streaming availability, detailed IMDb/TMDB checks, current news and future release verification are not yet connected in this pilot.'
    ]
  };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (url.pathname !== '/research' || request.method !== 'POST') return json({ error: 'Use POST /research.' }, 404);
    let body;
    try { body = await request.json(); } catch { return json({ error: 'Request body must be valid JSON.' }, 400); }
    try { return json(await research(body)); }
    catch (error) { return json({ error: error.message || 'Research could not be completed.' }, error.status || 502); }
  }
};
