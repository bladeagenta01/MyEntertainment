(function () {
  'use strict';

  const API = {};
  const UA = 'EntertainmentRelationshipExplorer/0.1-draft (personal research PWA)';

  function stripHtml(value) {
    return String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/\s+/g, ' ').trim();
  }

  function safeUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch (_) { return ''; }
  }

  function resultId(source, id, title) {
    return `${source}:${id || title || 'unknown'}`;
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store', ...options });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  }

  function normaliseTvMaze(item) {
    const show = item.show || item;
    return {
      id: resultId('tvmaze', show.id, show.name), source: 'TVmaze', sourceKey: 'tvmaze', sourceId: String(show.id || ''),
      entityType: 'TV series', title: show.name || 'Untitled TV series', subtitle: [show.premiered ? show.premiered.slice(0, 4) : '', show.network?.name || show.webChannel?.name || ''].filter(Boolean).join(' · '),
      summary: stripHtml(show.summary) || 'No summary supplied by this source.', year: show.premiered ? show.premiered.slice(0, 4) : '', image: safeUrl(show.image?.original || show.image?.medium || ''),
      url: safeUrl(show.url || ''), imdbUrl: show.externals?.imdb ? `https://www.imdb.com/title/${encodeURIComponent(show.externals.imdb)}/` : '', tmdbUrl: '',
      status: show.status || '', genres: show.genres || [], raw: { id: show.id, type: 'tvmaze' }
    };
  }

  function normaliseItunes(item) {
    const isMovie = item.kind === 'feature-movie' || item.wrapperType === 'track' && item.kind === 'feature-movie';
    const title = item.trackName || item.collectionName || item.artistName || 'Untitled';
    return {
      id: resultId('itunes', item.trackId || item.collectionId || item.artistId, title), source: 'Apple Search', sourceKey: 'itunes', sourceId: String(item.trackId || item.collectionId || item.artistId || ''),
      entityType: isMovie ? 'Film' : item.wrapperType === 'artist' ? 'Music artist' : item.kind === 'song' ? 'Song' : 'Music release',
      title, subtitle: [item.artistName || '', item.releaseDate ? String(item.releaseDate).slice(0, 4) : ''].filter(Boolean).join(' · '),
      summary: [item.primaryGenreName || '', item.collectionName && item.collectionName !== title ? item.collectionName : '', item.longDescription || item.description || ''].filter(Boolean).join(' · ') || 'Apple Search catalogue result.',
      year: item.releaseDate ? String(item.releaseDate).slice(0, 4) : '', image: safeUrl((item.artworkUrl600 || item.artworkUrl100 || '').replace('100x100', '600x600')),
      url: safeUrl(item.trackViewUrl || item.collectionViewUrl || item.artistViewUrl || ''), imdbUrl: '', tmdbUrl: '',
      status: '', genres: item.primaryGenreName ? [item.primaryGenreName] : [], raw: { id: item.trackId || item.collectionId || item.artistId, type: 'itunes' }
    };
  }

  function normaliseOpenLibrary(item) {
    const key = String(item.key || '');
    const title = item.title || 'Untitled book';
    return {
      id: resultId('openlibrary', key, title), source: 'Open Library', sourceKey: 'openlibrary', sourceId: key,
      entityType: 'Book', title, subtitle: [Array.isArray(item.author_name) ? item.author_name.slice(0, 2).join(', ') : '', item.first_publish_year || ''].filter(Boolean).join(' · '),
      summary: [item.edition_count ? `${item.edition_count} recorded editions` : '', item.subject ? item.subject.slice(0, 3).join(', ') : ''].filter(Boolean).join(' · ') || 'Bibliographic record from Open Library.',
      year: item.first_publish_year || '', image: item.cover_i ? `https://covers.openlibrary.org/b/id/${encodeURIComponent(item.cover_i)}-M.jpg` : '',
      url: safeUrl(key ? `https://openlibrary.org${key}` : ''), imdbUrl: '', tmdbUrl: '',
      status: '', genres: item.subject ? item.subject.slice(0, 5) : [], raw: { key, authors: item.author_name || [], authorKeys: item.author_key || [] }
    };
  }

  function normaliseWiki(item) {
    const title = item.title || 'Untitled';
    return {
      id: resultId('wikipedia', item.pageid, title), source: 'Wikipedia', sourceKey: 'wikipedia', sourceId: String(item.pageid || ''),
      entityType: 'Reference article', title, subtitle: item.description || 'Reference result',
      summary: item.extract || 'No introductory summary supplied.', year: '', image: safeUrl(item.thumbnail?.source || ''),
      url: safeUrl(item.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`), imdbUrl: '', tmdbUrl: '',
      status: '', genres: [], raw: { pageid: item.pageid, title }
    };
  }

  function normaliseWorker(item) {
    return {
      id: item.id || resultId(item.source || 'web', item.sourceId || item.url, item.title),
      source: item.sourceName || item.source || 'Web source', sourceKey: item.source || 'web', sourceId: String(item.sourceId || ''),
      entityType: item.entityType || item.type || 'Entertainment result', title: item.title || 'Untitled result', subtitle: item.subtitle || '',
      summary: item.summary || item.description || '', year: item.year || '', image: safeUrl(item.image || ''), url: safeUrl(item.url || ''),
      imdbUrl: safeUrl(item.imdbUrl || ''), tmdbUrl: safeUrl(item.tmdbUrl || ''), status: item.status || '', genres: item.genres || [], raw: item.raw || {}
    };
  }

  async function directSearch(query, category) {
    const q = encodeURIComponent(query.trim());
    const jobs = [];
    const sourceNames = [];
    if (category === 'all' || category === 'screen' || category === 'cross') {
      jobs.push(fetchJson(`https://api.tvmaze.com/search/shows?q=${q}`).then(rows => rows.slice(0, 8).map(normaliseTvMaze)));
      sourceNames.push('TVmaze');
    }
    jobs.push(fetchJson(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrlimit=8&prop=extracts|pageimages|info&exintro=1&explaintext=1&inprop=url&pithumbsize=480&format=json&origin=*`).then(data => Object.values(data.query?.pages || {}).map(normaliseWiki)));
    sourceNames.push('Wikipedia');

    const settled = await Promise.allSettled(jobs);
    const results = [];
    const warnings = [];
    settled.forEach((item, index) => {
      if (item.status === 'fulfilled') results.push(...item.value);
      else warnings.push(`${sourceNames[index] || 'A public source'}: ${item.reason?.message || 'request failed'}`);
    });
    warnings.push('Limited direct mode is active. Connect the optional research gateway for specialist MusicBrainz and Open Library searches, Apple catalogue search, TMDB, broad web/news search and secure AI reasoning.');
    const unique = new Map();
    for (const item of results) if (!unique.has(item.id)) unique.set(item.id, item);
    return { results: Array.from(unique.values()), warnings, sources: sourceNames, mode: 'direct-public-sources' };
  }

  API.search = async function (query, category, workerUrl, region) {
    if (!query || query.trim().length < 2) throw new Error('Enter at least two characters to search.');
    const base = String(workerUrl || '').trim().replace(/\/$/, '');
    if (base) {
      try {
        const url = new URL(`${base}/api/search`);
        url.searchParams.set('q', query.trim());
        url.searchParams.set('category', category || 'all');
        url.searchParams.set('region', region || 'IE');
        const data = await fetchJson(url.href);
        return { ...data, results: (data.results || []).map(normaliseWorker), mode: 'research-gateway' };
      } catch (error) {
        const fallback = await directSearch(query, category || 'all');
        fallback.warnings.unshift(`Research gateway unavailable: ${error.message}. Public source search was used instead.`);
        return fallback;
      }
    }
    return directSearch(query, category || 'all');
  };

  API.getStatus = async function (workerUrl) {
    const base = String(workerUrl || '').trim().replace(/\/$/, '');
    if (!base) return { connected: false, webSearch: false, tmdb: false, ai: false, reason: 'No research gateway URL has been configured.' };
    const data = await fetchJson(`${base}/api/status`);
    return { connected: !!data.ok, webSearch: !!data.webSearch, tmdb: !!data.tmdb, ai: !!data.ai, providerName: data.providerName || '', reason: '' };
  };

  API.news = async function (query, kind, region, workerUrl) {
    const base = String(workerUrl || '').trim().replace(/\/$/, '');
    if (!base) throw new Error('The research gateway is not configured.');
    const url = new URL(`${base}/api/news`);
    url.searchParams.set('q', query);
    url.searchParams.set('kind', kind || 'news');
    url.searchParams.set('region', region || 'IE');
    const data = await fetchJson(url.href);
    return data.results || [];
  };

  API.connections = async function (item, workerUrl) {
    if (item.sourceKey === 'openlibrary' && item.raw?.authors?.length) {
      return { relationships: item.raw.authors.slice(0, 5).map((name, index) => ({ title: name, type: 'Author', url: item.raw.authorKeys?.[index] ? `https://openlibrary.org/authors/${encodeURIComponent(item.raw.authorKeys[index])}` : '', source: 'Open Library' })), warnings: [] };
    }
    const base = String(workerUrl || '').trim().replace(/\/$/, '');
    if (base && item.sourceKey && item.sourceId) {
      try {
        const url = new URL(`${base}/api/entity`);
        url.searchParams.set('source', item.sourceKey);
        url.searchParams.set('id', item.sourceId);
        if (item.raw?.type) url.searchParams.set('type', item.raw.type);
        if (item.title) url.searchParams.set('title', item.title);
        if (item.year) url.searchParams.set('year', item.year);
        const data = await fetchJson(url.href);
        return { relationships: data.relationships || [], warnings: data.warnings || [], imdbUrl: data.imdbUrl || '', tmdbUrl: data.tmdbUrl || '' };
      } catch (error) {
        return { relationships: [], warnings: [`Research gateway could not retrieve structured relationships: ${error.message}`] };
      }
    }
    if (item.sourceKey === 'tvmaze' && item.sourceId) {
      try {
        const [cast, crew] = await Promise.all([
          fetchJson(`https://api.tvmaze.com/shows/${encodeURIComponent(item.sourceId)}/cast`),
          fetchJson(`https://api.tvmaze.com/shows/${encodeURIComponent(item.sourceId)}/crew`)
        ]);
        const relationships = [];
        cast.slice(0, 8).forEach(entry => relationships.push({ title: entry.person?.name || 'Cast member', type: entry.character?.name ? `Played ${entry.character.name}` : 'Cast', url: safeUrl(entry.person?.url || ''), source: 'TVmaze' }));
        crew.slice(0, 6).forEach(entry => relationships.push({ title: entry.person?.name || 'Crew member', type: entry.type || 'Crew', url: safeUrl(entry.person?.url || ''), source: 'TVmaze' }));
        return { relationships, warnings: [] };
      } catch (error) { return { relationships: [], warnings: [error.message] }; }
    }
    return { relationships: [], warnings: ['This source does not provide structured relationship records in direct-search mode. Connect the optional research gateway for additional sources.'] };
  };

  API.reason = async function (query, results, workerUrl, preferences = {}) {
    const base = String(workerUrl || '').trim().replace(/\/$/, '');
    if (!base) throw new Error('The AI reasoning gateway is not configured.');
    const response = await fetch(`${base}/api/reason`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit',
      body: JSON.stringify({ query, region: preferences.region || 'IE', depth: preferences.depth || '2', spoilers: preferences.spoilers || 'light', sources: (results || []).slice(0, 12).map(item => ({ title: item.title, type: item.entityType, source: item.source, url: item.url, summary: item.summary })) })
    });
    if (!response.ok) {
      let detail = `${response.status} ${response.statusText}`;
      try { const body = await response.json(); detail = body.error || detail; } catch (_) {}
      throw new Error(detail);
    }
    return response.json();
  };

  API.externalSearchUrl = function (query, kind) {
    const prefix = kind === 'news' ? 'latest news' : kind === 'upcoming' ? 'upcoming release' : '';
    return `https://www.google.com/search?q=${encodeURIComponent([prefix, query].filter(Boolean).join(' '))}`;
  };

  API.openAIUrl = function (provider) {
    const urls = { chatgpt: 'https://chatgpt.com/', claude: 'https://claude.ai/', gemini: 'https://gemini.google.com/' };
    return urls[provider] || urls.chatgpt;
  };

  window.EREApi = API;
})();
