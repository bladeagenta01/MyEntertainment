import assert from 'node:assert/strict';
import worker from '../worker/index.js';

const env = { ALLOWED_ORIGINS: 'https://example.com', APP_CONTACT: 'https://github.com/example/ere' };
const request = (path, method = 'GET', body) => new Request(`https://gateway.example${path}`, { method, headers: { Origin: 'https://example.com', ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });

const originalFetch = globalThis.fetch;
let lastAiBody = null;
globalThis.fetch = async (url, options = {}) => {
  const value = String(url);
  let data = {};
  if (value.includes('api.tvmaze.com/search/shows')) {
    data = [{ show: { id: 321, name: 'Gateway Test Show', summary: '<p>TVmaze summary.</p>', premiered: '2022-01-01', network: { name: 'Test Network' }, url: 'https://www.tvmaze.com/shows/321/gateway-test-show', externals: { imdb: 'tt7654321' } } }];
  } else if (value.includes('api.tvmaze.com/shows/321/cast')) {
    data = [{ person: { name: 'Gateway Actor', url: 'https://www.tvmaze.com/people/10/gateway-actor' }, character: { name: 'Lead' } }];
  } else if (value.includes('api.tvmaze.com/shows/321/crew')) {
    data = [{ person: { name: 'Gateway Director', url: 'https://www.tvmaze.com/people/11/gateway-director' }, type: 'Director' }];
  } else if (value.includes('itunes.apple.com/search')) {
    data = { results: [{ trackId: 55, trackName: 'Gateway Film', kind: 'feature-movie', releaseDate: '2021-01-01', trackViewUrl: 'https://itunes.apple.com/item/55' }] };
  } else if (value.includes('openlibrary.org/search.json')) {
    data = { docs: [{ key: '/works/OL123W', title: 'Gateway Book', author_name: ['Test Author'], author_key: ['OL123A'], first_publish_year: 2001, edition_count: 2 }] };
  } else if (value.includes('musicbrainz.org/ws/2/artist')) {
    data = { artists: [{ id: 'mbid-123', name: 'Gateway Artist', type: 'Group', country: 'GB', disambiguation: 'Test group' }] };
  } else if (value.includes('en.wikipedia.org/w/api.php')) {
    data = { query: { pages: { 1: { pageid: 1, title: 'Gateway Article', extract: 'Reference summary.', fullurl: 'https://en.wikipedia.org/wiki/Gateway_Article' } } } };
  } else if (value.includes('api.themoviedb.org/3/search/multi')) {
    const parsed = new URL(value);
    if ((parsed.searchParams.get('query') || '').includes('Gateway Test Show')) data = { results: [{ id: 555, media_type: 'tv', name: 'Gateway Test Show', overview: 'TMDB show overview.', first_air_date: '2022-01-01' }] };
    else data = { results: [{ id: 987, media_type: 'movie', title: 'TMDB Gateway Film', overview: 'TMDB overview.', release_date: '2024-01-01', poster_path: '/poster.jpg' }] };
  } else if (value.includes('api.themoviedb.org/3/tv/555')) {
    data = { external_ids: { imdb_id: 'tt5550001' } };
  } else if (value.includes('api.themoviedb.org/3/movie/987')) {
    data = { external_ids: { imdb_id: 'tt9876543' }, credits: { cast: [{ id: 45, name: 'TMDB Actor', character: 'Lead' }], crew: [{ id: 46, name: 'TMDB Director', job: 'Director' }] } };
  } else if (value.includes('api.search.brave.com/res/v1/web/search')) {
    data = { web: { results: [{ title: 'Brave web result', url: 'https://example.com/web', description: 'A current web result.' }] } };
  } else if (value.includes('api.search.brave.com/res/v1/news/search')) {
    data = { results: [{ title: 'Brave news result', url: 'https://example.com/news', description: 'A current news result.', age: '1 day ago' }] };
  } else if (value.includes('ai.example/v1/chat/completions')) {
    lastAiBody = JSON.parse(options.body);
    data = { choices: [{ message: { content: 'Test reasoning response with evidence limitations.' } }] };
  } else {
    throw new Error(`Unexpected upstream request: ${value}`);
  }
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

try {
  let response = await worker.fetch(request('/api/health'), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://example.com');

  response = await worker.fetch(request('/api/status'), env);
  const status = await response.json();
  assert.equal(status.ok, true);
  assert.equal(status.ai, false);
  assert.equal(status.webSearch, false);

  response = await worker.fetch(request('/api/search?q=Gateway%20Test&category=screen&region=IE'), env);
  const screen = await response.json();
  assert.equal(response.status, 200);
  assert.ok(screen.results.some(item => item.title === 'Gateway Test Show'));
  assert.ok(screen.results.some(item => item.title === 'Gateway Film'));

  response = await worker.fetch(request('/api/entity?source=tvmaze&id=321'), env);
  const entity = await response.json();
  assert.equal(entity.relationships.length, 2);
  assert.ok(entity.relationships.some(item => item.title === 'Gateway Actor'));

  response = await worker.fetch(request('/api/news?q=Test&kind=news&region=IE'), env);
  assert.equal(response.status, 503);

  const tmdbWithoutCredits = { ...env, TMDB_API_KEY: 'test-tmdb' };
  response = await worker.fetch(request('/api/status'), tmdbWithoutCredits);
  assert.equal((await response.json()).tmdb, false);
  response = await worker.fetch(request('/api/entity?source=tmdb&id=987&type=movie'), tmdbWithoutCredits);
  assert.equal(response.status, 503);

  response = await worker.fetch(request('/api/reason', 'POST', { query: 'Test question' }), env);
  assert.equal(response.status, 503);

  const richEnv = { ...env, TMDB_API_KEY: 'test-tmdb', TMDB_ATTRIBUTION_READY: 'yes', BRAVE_API_KEY: 'test-brave' };
  response = await worker.fetch(request('/api/search?q=TMDB%20Gateway&category=screen&region=IE'), richEnv);
  const tmdbSearch = await response.json();
  assert.ok(tmdbSearch.results.some(item => item.title === 'TMDB Gateway Film'));

  response = await worker.fetch(request('/api/search?q=Gateway%20Artist&category=music&region=IE'), env);
  const music = await response.json();
  assert.ok(music.results.some(item => item.source === 'musicbrainz' && item.title === 'Gateway Artist'));

  response = await worker.fetch(request('/api/search?q=Gateway%20Book&category=books&region=IE'), env);
  const books = await response.json();
  assert.ok(books.results.some(item => item.source === 'openlibrary' && item.title === 'Gateway Book'));

  response = await worker.fetch(request('/api/news?q=Gateway&kind=news&region=IE'), richEnv);
  const news = await response.json();
  assert.ok(news.results.some(item => item.title === 'Brave news result'));

  response = await worker.fetch(request('/api/entity?source=tmdb&id=987&type=movie'), richEnv);
  const tmdbEntity = await response.json();
  assert.ok(tmdbEntity.imdbUrl.includes('tt9876543'));
  assert.ok(tmdbEntity.relationships.some(item => item.title === 'TMDB Director'));

  response = await worker.fetch(request('/api/entity?source=tvmaze&id=321&title=Gateway%20Test%20Show&year=2022'), richEnv);
  const tvmazeEntity = await response.json();
  assert.ok(tvmazeEntity.tmdbUrl.includes('/tv/555'));
  assert.ok(tvmazeEntity.imdbUrl.includes('tt5550001')); 

  const aiEnv = { ...richEnv, AI_API_KEY: 'test-secret', AI_BASE_URL: 'https://ai.example/v1', AI_MODEL: 'test-model', AI_PROVIDER_NAME: 'Test provider' };
  response = await worker.fetch(request('/api/reason', 'POST', { query: 'Test question', sources: [{ title: 'Test source', url: 'https://example.com/source' }] }), aiEnv);
  const reasoning = await response.json();
  assert.equal(response.status, 200);
  assert.match(reasoning.answer, /evidence limitations/);
  assert.ok(lastAiBody.messages[0].content.length > 50000, 'full v3.8 prompt should be sent to the AI provider');
  assert.equal(lastAiBody.model, 'test-model');

  console.log('PASS: Worker health and CORS');
  console.log('PASS: Worker service status');
  console.log('PASS: Screen search aggregation');
  console.log('PASS: Source-backed entity relationships');
  console.log('PASS: Missing Brave/AI configuration reported accurately');
  console.log('PASS: TMDB stays disabled until logo and attribution are confirmed');
  console.log('PASS: MusicBrainz and Open Library specialist search');
  console.log('PASS: Optional TMDB and Brave web/news search');
  console.log('PASS: TMDB external IMDb link and credits lookup');
  console.log('PASS: Exact title/year matching before linking TVmaze entity to TMDB/IMDb');
  console.log('PASS: AI gateway uses the full v3.8 research prompt');
} finally {
  globalThis.fetch = originalFetch;
}
