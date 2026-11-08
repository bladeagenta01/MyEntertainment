const assert = require('node:assert/strict');
global.window = global;
let calls = [];
global.fetch = async (url, options = {}) => {
  const value = String(url);
  calls.push({ url: value, options });
  let data = {};
  if (value.includes('api.tvmaze.com/search/shows')) {
    data = [{ show: { id: 77, name: 'API Smoke Show', summary: '<p>Example summary.</p>', premiered: '2019-01-01', url: 'https://www.tvmaze.com/shows/77/api-smoke-show', externals: { imdb: 'tt1234567' } } }];
  } else if (value.includes('en.wikipedia.org/w/api.php')) {
    data = { query: { pages: { 7: { pageid: 7, title: 'API Smoke Article', extract: 'Wikipedia summary.', fullurl: 'https://en.wikipedia.org/wiki/API_Smoke_Article' } } } };
  } else if (value.includes('/shows/77/cast')) {
    data = [{ person: { name: 'API Smoke Actor', url: 'https://www.tvmaze.com/people/7/api-smoke-actor' }, character: { name: 'Character' } }];
  } else if (value.includes('/shows/77/crew')) {
    data = [{ person: { name: 'API Smoke Director', url: 'https://www.tvmaze.com/people/8/api-smoke-director' }, type: 'Director' }];
  } else if (value.includes('worker.example/api/status')) {
    data = { ok: true, webSearch: true, tmdb: false, ai: false };
  } else if (value.includes('worker.example/api/news')) {
    data = { results: [{ title: 'API Smoke News', url: 'https://example.com/news' }] };
  } else if (value.includes('worker.example/api/entity')) {
    data = { relationships: [{ title: 'Gateway Link', type: 'Related', url: 'https://example.com/related' }], imdbUrl: 'https://www.imdb.com/title/tt1234567/' };
  } else if (value.includes('worker.example/api/reason')) {
    const body = JSON.parse(options.body);
    assert.equal(body.region, 'IE');
    assert.equal(body.depth, '3');
    assert.equal(body.spoilers, 'light');
    data = { answer: 'API smoke reasoning.' };
  } else {
    throw new Error(`Unexpected URL: ${value}`);
  }
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

require('../js/api.js');
(async () => {
  const result = await EREApi.search('API Smoke', 'screen', '', 'IE');
  assert.ok(result.results.some(item => item.title === 'API Smoke Show'));
  assert.ok(result.results.some(item => item.title === 'API Smoke Article'));
  assert.ok(result.warnings.some(item => item.includes('Limited direct mode')));

  const tv = result.results.find(item => item.sourceKey === 'tvmaze');
  const graph = await EREApi.connections(tv, '');
  assert.equal(graph.relationships.length, 2);
  assert.ok(graph.relationships.some(item => item.title === 'API Smoke Actor'));

  const status = await EREApi.getStatus('https://worker.example');
  assert.equal(status.connected, true);
  assert.equal(status.webSearch, true);
  const news = await EREApi.news('API Smoke', 'news', 'IE', 'https://worker.example');
  assert.equal(news[0].title, 'API Smoke News');
  const gatewayGraph = await EREApi.connections(tv, 'https://worker.example');
  assert.equal(gatewayGraph.imdbUrl, 'https://www.imdb.com/title/tt1234567/');
  assert.ok(calls.some(call => call.url.includes('title=API+Smoke+Show')));
  const reason = await EREApi.reason('API Smoke question', [tv], 'https://worker.example', { region: 'IE', depth: '3', spoilers: 'light' });
  assert.equal(reason.answer, 'API smoke reasoning.');
  assert.ok(EREApi.externalSearchUrl('API Smoke').includes('google.com/search'));
  assert.equal(EREApi.openAIUrl('claude'), 'https://claude.ai/');

  console.log('PASS: direct TVmaze/Wikipedia search normalisation');
  console.log('PASS: direct TVmaze relationship lookup');
  console.log('PASS: Worker status, news and relationship adapters');
  console.log('PASS: Worker relationship request carries title/year context');
  console.log('PASS: AI request carries region, depth and spoiler preferences');
  console.log('PASS: external web and AI links');
})().catch(error => { console.error(error); process.exitCode = 1; });
