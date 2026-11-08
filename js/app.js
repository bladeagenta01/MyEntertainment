(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const VIEW_NAMES = { home: 'Overview', explore: 'Explore', search: 'Research search', connections: 'Connections', news: "What's new", library: 'Saved research', settings: 'Settings' };
  const state = {
    view: 'home', settingsTab: 'general', query: '', category: 'all', results: [], warnings: [], sources: [],
    selected: null, graphRelationships: [], newsKind: 'news', newsResults: [], newsQuery: '', records: [], services: null,
    busy: false, storageReady: false, savedSnapshot: false
  };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  function safeUrl(value) {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch (_) { return ''; }
  }
  function settings() {
    const defaults = { workerUrl: '', region: 'IE', depth: '2', spoilers: 'light', aiMode: 'external', aiProvider: 'chatgpt' };
    try { return { ...defaults, ...JSON.parse(localStorage.getItem('ere-settings') || '{}') }; } catch (_) { return defaults; }
  }
  function saveSettings(value) {
    localStorage.setItem('ere-settings', JSON.stringify({ ...settings(), ...value }));
  }
  function dateLabel(value) {
    try { return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)); } catch (_) { return 'Date unavailable'; }
  }
  function timeGreeting() {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  }
  function toast(message, type = '') {
    const region = $('#toast-region');
    if (!region) return;
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    node.textContent = message;
    region.appendChild(node);
    window.setTimeout(() => node.remove(), 3900);
  }
  function categoryName(key) {
    return ({ all: 'All entertainment', screen: 'Film and television', music: 'Music', books: 'Books', people: 'People', cross: 'Cross-media', news: 'Current news', upcoming: 'Upcoming releases' })[key] || 'All entertainment';
  }
  function updateNav() {
    $$('.nav-item, .mobile-nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === state.view));
    const crumb = $('#breadcrumb');
    if (crumb) crumb.innerHTML = `<span>WORKSPACE</span><b>/</b><strong>${escapeHtml(VIEW_NAMES[state.view] || 'Overview')}</strong>`;
  }
  function updateStatus() {
    const online = navigator.onLine;
    const pill = $('#connection-pill');
    const dot = $('#sidebar-status-dot');
    const title = $('#sidebar-status-title');
    const detail = $('#sidebar-status-detail');
    if (pill) {
      pill.classList.toggle('offline', !online);
      pill.innerHTML = `<i></i><span>${online ? 'Internet available' : 'Offline mode'}</span>`;
    }
    if (dot) dot.classList.toggle('offline', !online);
    if (title) title.textContent = online ? 'Internet available' : 'Offline mode';
    if (detail) detail.textContent = online ? 'Live research can run' : 'Saved research remains available';
  }
  async function refreshRecords() {
    try {
      state.records = await EREStorage.all();
      state.storageReady = true;
      const count = $('#saved-count');
      if (count) count.textContent = String(state.records.length);
    } catch (error) {
      state.storageReady = false;
      toast(error.message || 'Personal library unavailable.', 'error');
    }
  }
  async function refreshServiceStatus() {
    const config = settings();
    if (!config.workerUrl) {
      state.services = { connected: false, webSearch: false, tmdb: false, ai: false, reason: 'Research gateway not configured.' };
      return state.services;
    }
    try {
      state.services = await EREApi.getStatus(config.workerUrl);
    } catch (error) {
      state.services = { connected: false, webSearch: false, tmdb: false, ai: false, reason: error.message };
    }
    return state.services;
  }

  function pageHeading(kicker, title, description, actions = '') {
    return `<div class="page-heading"><div><div class="eyebrow">${escapeHtml(kicker)}</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>${actions}</div>`;
  }
  function intelligenceCard(level, title, description, status, className, pending = false) {
    return `<article class="intelligence-card ${className}"><div class="level"><b>${level}</b> LEVEL ${level}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><div class="card-status ${pending ? 'pending' : ''}"><i></i>${escapeHtml(status)}</div></article>`;
  }
  function renderHome() {
    const saved = state.records.length;
    const recent = state.records.slice(0, 3);
    const recentHtml = recent.length ? `<div class="library-list">${recent.map(record => libraryItem(record, true)).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">▣</div><h3>Your research library is ready</h3><p>Nothing has been saved yet. Search for a film, artist, book or person, then save the results you want to keep.</p><button class="button secondary" data-action="navigate" data-view="search">Start researching</button></div>`;
    return `
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow">PAST · PRESENT · FUTURE</div>
          <h1>Entertainment,<br><em>connected.</em></h1>
          <p>Research the stories behind the screen, the people behind the music and the connections that link entertainment across time.</p>
          <div class="hero-actions"><button class="button primary" data-action="navigate" data-view="search">Start a research search <span>↗</span></button><button class="button secondary" data-action="navigate" data-view="connections">Open relationship explorer</button></div>
          <form class="quick-search" id="quick-search-form"><input name="query" aria-label="Quick research search" placeholder="What would you like to explore? e.g. Blade Runner, Yello, Dune..." required><button class="button primary" type="submit">Explore</button></form>
        </div>
        <div class="hero-art" aria-hidden="true"><div class="hero-orbit"></div><div class="hero-poster one"><span>THE SCREEN</span></div><div class="hero-poster two"><span>THE SOUND</span></div><div class="hero-poster three"><span>THE STORY</span></div><div class="hero-stamp">DISCOVER WHAT CONNECTS</div></div>
      </section>

      <section class="section">
        <div class="section-heading"><div><h2>Three levels of intelligence</h2><p>Local memory, live information and independent reasoning.</p></div><button class="text-link" data-action="navigate" data-view="settings">Configure services ↗</button></div>
        <div class="intelligence-grid">
          ${intelligenceCard(1, 'Your personal research', 'Saved searches, discoveries, notes and relationship views stay on this device.', `${saved} saved item${saved === 1 ? '' : 's'} · available offline`, 'local')}
          ${intelligenceCard(2, 'Live external information', 'Search current public databases and, when configured, the wider web and news.', state.services?.webSearch ? 'Web search connected' : 'Public sources available · gateway optional', 'live', !state.services?.webSearch)}
          ${intelligenceCard(3, 'Independent reasoning', 'Choose an external AI provider or connect a provider-agnostic API through your secure gateway.', state.services?.ai ? `${state.services.providerName || 'AI provider'} connected` : 'No AI service connected', 'reasoning', !state.services?.ai)}
        </div>
      </section>

      <section class="section">
        <div class="section-heading"><div><h2>Explore an entertainment world</h2><p>Choose a starting point. The research can cross categories.</p></div><button class="text-link" data-action="navigate" data-view="explore">All categories ↗</button></div>
        <div class="category-grid">
          ${categoryCard('◫','Film & television','Films, series, cast and crew','screen')}
          ${categoryCard('♫','Music','Artists, albums, songs and recordings','music')}
          ${categoryCard('▤','Books & literature','Authors, works and adaptations','books')}
          ${categoryCard('♙','People','Performers, creators and collaborators','people')}
          ${categoryCard('✧','Cross-media','Connections across entertainment','cross')}
        </div>
      </section>

      <section class="section dashboard-grid">
        <div class="panel"><div class="panel-header"><div><h3>Saved research</h3><p>Your personal collection. Stored locally on this device.</p></div><button class="text-link" data-action="navigate" data-view="library">Open library ↗</button></div><div class="panel-body">${recentHtml}</div></div>
        <div class="panel"><div class="panel-header"><div><h3>Research radar</h3><p>Find current developments and upcoming releases.</p></div></div><div class="panel-body"><div class="empty-state"><div class="empty-icon">◷</div><h3>What's happening now?</h3><p>Search current news or upcoming entertainment. Connect the optional research gateway for in-app web and news results.</p><button class="button secondary" data-action="navigate" data-view="news">Open research radar</button></div></div></div>
      </section>`;
  }

  function categoryCard(icon, title, description, category) {
    return `<button class="category-card" data-action="category-search" data-category="${category}"><span class="cat-icon">${icon}</span><span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(description)}</small></span></button>`;
  }

  function renderExplore() {
    return `${pageHeading('DISCOVER', 'Choose a starting point', 'The research model follows meaningful connections beyond the category you choose.')}<div class="category-grid explore-grid">
      ${categoryCard('◫','Film & television','Movies, series, seasons, episodes, cast, crew and production.','screen')}
      ${categoryCard('♫','Music','Artists, bands, albums, tracks, recordings, releases and credits.','music')}
      ${categoryCard('▤','Books & literature','Authors, works, publishers, adaptations and literary lineage.','books')}
      ${categoryCard('♙','People','Actors, directors, writers, musicians, composers and collaborators.','people')}
      ${categoryCard('✧','Cross-media','Follow connections between screen, music, books and other media.','cross')}
    </div><section class="section"><div class="note-banner"><span class="note-icon">ⓘ</span><div><b>Research standard.</b> The approved Version 3.8 prompt remains the controlling research specification. Results must retain direct links, source evidence, confidence labels, regional context, spoiler control, interesting facts and similar-entertainment discovery where the source evidence supports them.</div></div></section>`;
  }

  function renderSearch() {
    const chips = [['all','All'],['screen','Film & TV'],['music','Music'],['books','Books'],['people','People'],['cross','Cross-media']];
    const resultHtml = state.results.length ? `<div class="result-grid">${state.results.map(resultCard).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">⌕</div><h3>${state.query ? 'No results returned' : 'Start with a question'}</h3><p>${state.query ? 'The connected sources returned no matching records. Try another spelling or use the wider web search.' : 'Search across public entertainment sources. The results shown are live source records, not preloaded sample entries.'}</p>${state.query ? `<button class="button secondary" data-action="external-search">Search the wider web ↗</button>` : ''}</div>`;
    const warnings = state.warnings.length ? `<div class="note-banner" style="margin-top:12px"><span class="note-icon">ⓘ</span><div>${state.warnings.map(escapeHtml).join('<br>')}</div></div>` : '';
    const snapshotNote = state.savedSnapshot ? '<div class="note-banner" style="margin-top:12px"><span class="note-icon">▣</span><div><b>Saved snapshot.</b> These are the results saved at the time of the original search. They are not current until refreshed online.</div></div>' : '';
    return `${pageHeading('RESEARCH', 'Search the entertainment landscape', 'Search public sources now. Save only the research you want to keep.')}<div class="search-panel"><form class="search-form" id="research-search-form"><div class="search-input-wrap"><span class="search-symbol">⌕</span><input id="research-query" name="query" value="${escapeHtml(state.query)}" placeholder="Enter a film, series, artist, album, song, book or person..." required minlength="2"></div><button class="button primary" type="submit">Search</button></form><div class="search-options">${chips.map(([key,label]) => `<button class="filter-chip ${state.category === key ? 'active' : ''}" type="button" data-action="set-category" data-category="${key}">${label}</button>`).join('')}<span class="subtle" style="margin-left:auto;font-size:9px">Region: ${escapeHtml(settings().region)} · Depth ${escapeHtml(settings().depth)}</span></div></div>
      <div class="results-meta"><div><h2>${state.query ? `Results for “${escapeHtml(state.query)}”` : 'Live source results'}</h2><p>${state.results.length} result${state.results.length === 1 ? '' : 's'} · ${escapeHtml(categoryName(state.category))}</p></div>${state.results.length ? `<div class="hero-actions" style="margin:0">${state.savedSnapshot ? '<button class="button secondary small" data-action="refresh-saved-search">Refresh live</button>' : ''}<button class="button secondary small" data-action="external-search">Wider web ↗</button><button class="button secondary small" data-action="save-search">Save this search</button></div>` : ''}</div>
      ${snapshotNote}${state.busy ? '<div class="loading-state"><span class="spinner"></span> Searching connected sources...</div>' : resultHtml}${warnings}
      <div class="source-strip"><strong>Sources:</strong><span>TVmaze</span><span>Wikipedia</span><span class="source-limited">Worker adds Apple Search, Open Library, MusicBrainz, TMDB and Brave web/news search</span><button class="text-link" data-action="navigate" data-view="settings">Connection settings ↗</button></div>`;
  }

  function resultCard(item) {
    const image = safeUrl(item.image);
    const initial = escapeHtml((item.title || 'E').trim().charAt(0).toUpperCase());
    const subtitle = item.subtitle ? `<div class="result-subtitle">${escapeHtml(item.subtitle)}</div>` : '';
    const summary = item.summary ? `<p class="result-summary">${escapeHtml(item.summary)}</p>` : '';
    return `<article class="result-card"><div class="result-art">${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : initial}</div><div class="result-copy"><div class="result-topline"><span class="source-tag">${escapeHtml(item.source || 'Source')}</span><span class="type-tag">${escapeHtml(item.entityType || 'Result')}</span></div><h3>${escapeHtml(item.title)}</h3>${subtitle}${summary}<div class="result-actions"><button class="button secondary small" data-action="detail" data-id="${escapeHtml(item.id)}">Details</button><button class="button secondary small" data-action="save-result" data-id="${escapeHtml(item.id)}">Save</button><button class="button ghost small" data-action="explore-result" data-id="${escapeHtml(item.id)}">Connections</button></div></div></article>`;
  }

  function renderConnections() {
    if (!state.selected) return `${pageHeading('RELATIONSHIP EXPLORER', 'See what connects', 'Build a relationship view from a researched entity. Connections are shown only when the source provides supporting records.')}<div class="graph-panel"><div class="graph-empty"><div class="empty-icon">◎</div><h3>No active relationship map</h3><p>Search for a film, series, artist, book or person, then choose Connections on a result. The map will use structured source records where available. It will not invent links to fill the screen.</p><button class="button primary" data-action="navigate" data-view="search">Find an entity</button></div></div>`;
    const warning = state.graphWarnings?.length ? `<div class="note-banner" style="margin-top:12px"><span class="note-icon">ⓘ</span><div>${state.graphWarnings.map(escapeHtml).join('<br>')}</div></div>` : '';
    const svg = EREGraph.render(state.selected, state.graphRelationships);
    const list = state.graphRelationships.length ? `<div class="library-list" style="margin-top:14px">${state.graphRelationships.map((rel,index) => `<div class="library-item"><div class="library-item-icon">◎</div><div><h3>${escapeHtml(rel.title)}</h3><p>${escapeHtml(rel.type || 'Related record')} · ${escapeHtml(rel.source || 'Source record')}</p></div><div class="library-actions">${safeUrl(rel.url) ? `<button class="button secondary small" data-action="open-url" data-url="${escapeHtml(rel.url)}">Open source</button>` : ''}</div></div>`).join('')}</div>` : `<div class="empty-state"><h3>No structured relationships returned</h3><p>The selected source did not provide connected people or works. This is not evidence that no relationship exists. Connect the research gateway or use another source to continue.</p></div>`;
    return `${pageHeading('RELATIONSHIP EXPLORER', 'Connections around an entity', 'A visual view of source-backed relationships. Select a node to open its source record.')}<div class="graph-panel"><div class="graph-toolbar"><div><h2>${escapeHtml(state.selected.title)}</h2><p>${escapeHtml(state.selected.entityType)} · ${escapeHtml(state.selected.source)}</p></div><div><button class="button secondary small" data-action="detail-selected">Entity details</button>${state.savedSnapshot ? '<button class="button secondary small" data-action="refresh-map">Refresh map</button>' : ''}${state.graphRelationships.length ? '<button class="button secondary small" data-action="save-map">Save map</button>' : ''}<button class="button ghost small" data-action="clear-graph">Clear</button></div></div><div class="graph-canvas">${svg}</div></div>${state.savedSnapshot ? '<div class="note-banner" style="margin-top:12px"><span class="note-icon">▣</span><div><b>Saved relationship snapshot.</b> This map was saved locally. Refresh it when online to check for changes.</div></div>' : ''}${warning}<section class="section"><div class="section-heading"><div><h2>Verified source relationships</h2><p>These records came from the selected data source.</p></div></div>${list}</section>`;
  }

  function renderNews() {
    const kinds = [['news','Current news'],['upcoming','Upcoming releases']];
    const snapshotNote = state.savedSnapshot ? '<div class="note-banner" style="margin-top:12px"><span class="note-icon">▣</span><div><b>Saved snapshot.</b> These results reflect the date they were saved, not the current news feed.</div></div>' : '';
    const cards = state.newsResults.length ? `<div class="news-results">${state.newsResults.map((item,index) => `<article class="news-card"><div class="result-topline"><span class="source-tag">${escapeHtml(item.source || 'Web search')}</span><span class="type-tag">${escapeHtml(item.age || 'Current result')}</span></div><h3>${escapeHtml(item.title || 'Untitled result')}</h3><p>${escapeHtml(item.description || item.summary || '')}</p><div class="result-actions">${safeUrl(item.url) ? `<button class="button secondary small" data-action="open-url" data-url="${escapeHtml(item.url)}">Open source ↗</button>` : ''}<button class="button secondary small" data-action="save-news" data-index="${index}">Save</button></div></article>`).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">◷</div><h3>${state.newsQuery ? 'No in-app web results' : 'Follow what is happening now'}</h3><p>${state.newsQuery ? 'Connect the optional web-search gateway to show live news inside the app, or open the wider web search.' : 'Search current entertainment news or announced future releases. This screen uses live web search when the gateway is configured.'}</p>${state.newsQuery ? '<button class="button secondary" data-action="external-news">Open web results ↗</button>' : ''}</div>`;
    return `${pageHeading('PAST · PRESENT · FUTURE', 'What’s happening now?', 'Track current developments and upcoming entertainment. Time-sensitive claims need current source evidence.')}<div class="search-panel"><div class="search-options" style="margin:0 0 12px">${kinds.map(([key,label]) => `<button class="filter-chip ${state.newsKind === key ? 'active' : ''}" data-action="set-news-kind" data-kind="${key}">${label}</button>`).join('')}</div><form class="search-form" id="news-search-form"><div class="search-input-wrap"><span class="search-symbol">⌕</span><input name="query" value="${escapeHtml(state.newsQuery)}" placeholder="e.g. upcoming science fiction series, latest Yello news..." required></div><button class="button primary" type="submit">Search web</button></form><div class="search-options"><span class="subtle">Region: ${escapeHtml(settings().region)} · Research date: ${dateLabel(new Date())}</span></div></div><div class="section"><div class="results-meta"><div><h2>${state.newsKind === 'news' ? 'Current news results' : 'Upcoming entertainment results'}</h2><p>${state.newsResults.length} result${state.newsResults.length === 1 ? '' : 's'}</p></div>${state.newsResults.length ? `<div class="hero-actions" style="margin:0">${state.savedSnapshot ? '<button class="button secondary small" data-action="refresh-saved-news">Refresh live</button>' : ''}<button class="button secondary small" data-action="save-news-search">Save this search</button></div>` : ''}</div>${snapshotNote}${state.busy ? '<div class="loading-state"><span class="spinner"></span> Searching current web sources...</div>' : cards}</div>${state.newsError ? `<div class="note-banner" style="margin-top:12px"><span class="note-icon">ⓘ</span><div>${escapeHtml(state.newsError)}</div></div>` : ''}<div class="note-banner" style="margin-top:16px"><span class="note-icon">ⓘ</span><div>Live news and broad web search require the optional Cloudflare research gateway and a configured search provider. Without it, the app can open a search in your browser but cannot claim to have retrieved or verified the results inside the app.</div></div>`;
  }

  function libraryItem(record, compact = false) {
    const isSearch = record.kind === 'search';
    const icon = isSearch ? '⌕' : '▣';
    const title = record.title || (isSearch ? record.query : 'Saved research');
    const meta = isSearch ? `${categoryName(record.category || 'all')} · ${record.resultCount || 0} results` : `${record.entityType || 'Entity'} · ${record.source || 'Source'}${record.relationships ? ' · relationship map saved' : ''}`;
    return `<div class="library-item"><div class="library-item-icon">${icon}</div><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(meta)}</p><div class="library-meta">Saved ${escapeHtml(dateLabel(record.savedAt))}${record.notes ? ` · ${escapeHtml(record.notes.slice(0, 100))}` : ''}</div></div><div class="library-actions"><button class="button secondary small" data-action="open-record" data-id="${escapeHtml(record.id)}">Open</button><button class="button secondary small" data-action="edit-record" data-id="${escapeHtml(record.id)}">Edit</button><button class="button danger small" data-action="delete-record" data-id="${escapeHtml(record.id)}">Delete</button></div></div>`;
  }

  function renderLibrary() {
    const rows = state.records.length ? `<div class="library-list">${state.records.map(record => libraryItem(record)).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">▣</div><h3>Your saved research is empty</h3><p>There are no preloaded sample entries. Save a search or individual result and it will appear here. You can edit or delete every saved item.</p><button class="button primary" data-action="navigate" data-view="search">Start researching</button></div>`;
    return `${pageHeading('PERSONAL WORKSPACE', 'Saved research', 'Your searches, discoveries and notes are stored in this browser on this device.', '<div class="hero-actions"><button class="button secondary" data-action="export-backup">Export backup</button><button class="button secondary" data-action="import-backup">Import backup</button></div>')}<div class="note-banner" style="margin-bottom:16px"><span class="note-icon">▣</span><div><b>Local by design.</b> Saved research is private to this browser profile. It is not uploaded to GitHub or the research gateway. Export a backup if you want to move it to another device.</div></div>${rows}`;
  }

  function renderSettings() {
    const config = settings();
    const tabs = [['general','General'],['research','Research preferences'],['services','Connections & AI'],['data','Data & backup']];
    let content = '';
    if (state.settingsTab === 'general') {
      content = `<h2>General settings</h2><p>Control the application experience on this device.</p><div class="form-grid"><div class="form-field"><label class="field-label" for="region-setting">Research region</label><select id="region-setting" name="region"><option value="IE" ${config.region === 'IE' ? 'selected' : ''}>Ireland</option><option value="GB" ${config.region === 'GB' ? 'selected' : ''}>United Kingdom</option><option value="US" ${config.region === 'US' ? 'selected' : ''}>United States</option><option value="WORLD" ${config.region === 'WORLD' ? 'selected' : ''}>Worldwide</option></select><small class="field-help">Used for region-aware searches when the source supports it. This does not use device location.</small></div><div class="form-field"><label class="field-label" for="depth-setting">Default research depth</label><select id="depth-setting" name="depth"><option value="1" ${config.depth === '1' ? 'selected' : ''}>1 · Quick</option><option value="2" ${config.depth === '2' ? 'selected' : ''}>2 · Standard</option><option value="3" ${config.depth === '3' ? 'selected' : ''}>3 · Deep Dive</option><option value="4" ${config.depth === '4' ? 'selected' : ''}>4 · Complete</option></select><small class="field-help">Default is Level 2, as specified in the approved v3.8 prompt.</small></div></div><div class="settings-divider"></div><div class="toggle-row"><label for="spoiler-setting">Keep screen-entertainment research spoiler-light</label><input type="checkbox" id="spoiler-setting" name="spoilers" ${config.spoilers === 'light' ? 'checked' : ''}></div><div class="settings-actions"><button class="button primary" data-action="save-general-settings">Save preferences</button></div>`;
    } else if (state.settingsTab === 'research') {
      content = `<h2>Research behaviour</h2><p>The application uses the approved Entertainment Relationship Explorer v3.8 master prompt as its research setup.</p><div class="note-banner"><span class="note-icon">ⓘ</span><div><b>Preserved requirements.</b> Specialist research engines, entity disambiguation, relationship analysis, source hierarchy, direct links, citations, current and future research, regional availability, spoiler control, confidence labels, Interesting Facts & Discoveries, and If You Like This, Try These remain part of the controlling prompt.</div></div><div class="settings-divider"></div><div class="provider-row"><div><strong>Master prompt</strong><small>Version 3.8 · 7 November 2026 · Included in this project package and Worker prompt.</small></div><span class="type-tag">ACTIVE</span></div><div class="provider-row"><div><strong>Default depth</strong><small>Standard (Level 2), unless changed in General settings.</small></div><span class="type-tag">LEVEL 2</span></div><div class="provider-row"><div><strong>Saved context</strong><small>Only the items you explicitly save are stored in the personal library.</small></div><span class="type-tag">LOCAL</span></div>`;
    } else if (state.settingsTab === 'services') {
      const svc = state.services || {};
      content = `<h2>Connections and AI</h2><p>Direct mode provides TVmaze and Wikipedia search. The gateway adds Apple Search, Open Library, MusicBrainz, optional TMDB, Brave web/news search and secure AI reasoning.</p><div class="form-grid"><div class="form-field full"><label class="field-label" for="worker-url">Cloudflare research gateway URL</label><input id="worker-url" name="workerUrl" type="url" placeholder="https://your-worker.your-subdomain.workers.dev" value="${escapeHtml(config.workerUrl)}"><small class="field-help">Paste the Worker URL after it has been deployed. This field stores only the URL, never an API key.</small></div></div><div class="settings-actions"><button class="button primary" data-action="save-worker-url">Save gateway URL</button><button class="button secondary" data-action="check-worker">Check connection</button></div><div class="settings-divider"></div><div class="service-status-grid"><div class="service-status ${svc.connected ? 'connected' : ''}"><strong>Research gateway</strong><span>${svc.connected ? 'Connected' : 'Not connected'}</span></div><div class="service-status ${svc.webSearch ? 'connected' : ''}"><strong>Web and news search</strong><span>${svc.webSearch ? 'Configured' : 'Not configured'}</span></div><div class="service-status ${svc.ai ? 'connected' : ''}"><strong>AI reasoning</strong><span>${svc.ai ? 'Configured' : 'Not configured'}</span></div></div><div class="settings-divider"></div><h2>Independent reasoning provider</h2><p>API credentials must be stored as Cloudflare Worker secrets. They are never entered or saved in this browser.</p><div class="form-grid"><div class="form-field"><label class="field-label" for="ai-mode">Reasoning method</label><select id="ai-mode" name="aiMode"><option value="external" ${config.aiMode === 'external' ? 'selected' : ''}>Open an external AI website</option><option value="gateway" ${config.aiMode === 'gateway' ? 'selected' : ''}>Use configured gateway AI</option><option value="none" ${config.aiMode === 'none' ? 'selected' : ''}>Do not use AI</option></select></div><div class="form-field"><label class="field-label" for="ai-provider">External AI website</label><select id="ai-provider" name="aiProvider"><option value="chatgpt" ${config.aiProvider === 'chatgpt' ? 'selected' : ''}>ChatGPT</option><option value="claude" ${config.aiProvider === 'claude' ? 'selected' : ''}>Claude</option><option value="gemini" ${config.aiProvider === 'gemini' ? 'selected' : ''}>Google Gemini</option></select></div></div><div class="settings-actions"><button class="button secondary" data-action="save-ai-settings">Save AI preference</button><button class="button secondary" data-action="open-ai">Open selected AI website ↗</button><button class="button primary" data-action="test-ai" ${svc.ai && config.aiMode === 'gateway' ? '' : 'disabled'}>Test configured AI</button></div><div class="note-banner" style="margin-top:16px"><span class="note-icon">ⓘ</span><div><b>Honest status.</b> Selecting ChatGPT, Claude or Gemini opens that external service. It does not connect that service to this application. In-app reasoning is only enabled after the Cloudflare Worker has an AI-compatible endpoint, model and secret key configured.</div></div><div class="settings-divider"></div><h2>Data source credits</h2><p>TVmaze records link back to TVmaze. Wikipedia, MusicBrainz and Open Library records link to their source records. Open Library and MusicBrainz requests identify the application and are paced to respect their published request limits.</p><div class="provider-row"><div><strong>TMDB attribution requirement</strong><small>This product uses the TMDB API but is not endorsed or certified by TMDB. The approved logo must also be displayed before TMDB is enabled.</small></div><a class="text-link" href="https://www.themoviedb.org/about/logos-attribution" target="_blank" rel="noopener noreferrer">Official logo assets ↗</a></div>`;
    } else {
      content = `<h2>Data and backup</h2><p>Saved research remains on this device unless you export it.</p><div class="provider-row"><div><strong>Personal library</strong><small>${state.records.length} saved record${state.records.length === 1 ? '' : 's'} in IndexedDB.</small></div><span class="type-tag">LOCAL</span></div><div class="settings-actions"><button class="button primary" data-action="export-backup">Export JSON backup</button><button class="button secondary" data-action="import-backup">Import and merge backup</button></div><div class="settings-divider"></div><div class="note-banner"><span class="note-icon">ⓘ</span><div>Import uses merge behaviour. It does not overwrite existing records. Duplicate entries are skipped. Deleting browser site data or removing the PWA can remove local records, so keep a separate backup.</div></div>`;
    }
    return `${pageHeading('PREFERENCES', 'Settings', 'Configure the local experience, research sources and optional reasoning services.')}<div class="settings-layout"><div class="settings-nav">${tabs.map(([key,label]) => `<button class="settings-tab ${state.settingsTab === key ? 'active' : ''}" data-action="settings-tab" data-tab="${key}">${escapeHtml(label)}</button>`).join('')}</div><section class="settings-content">${content}</section></div>`;
  }

  function render() {
    updateNav();
    const root = $('#main-view');
    if (!root) return;
    const renderers = { home: renderHome, explore: renderExplore, search: renderSearch, connections: renderConnections, news: renderNews, library: renderLibrary, settings: renderSettings };
    root.innerHTML = (renderers[state.view] || renderHome)();
    if (state.view === 'settings') {
      const checkbox = $('#spoiler-setting');
      if (checkbox) checkbox.addEventListener('change', () => saveSettings({ spoilers: checkbox.checked ? 'light' : 'allow' }));
    }
  }

  async function navigate(view) {
    if (!VIEW_NAMES[view]) return;
    state.view = view;
    if (view === 'library') await refreshRecords();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function runSearch(query, category = state.category) {
    state.query = String(query || '').trim();
    state.category = category;
    state.savedSnapshot = false;
    if (state.query.length < 2) { toast('Enter at least two characters to search.', 'error'); return; }
    state.view = 'search'; state.results = []; state.warnings = []; state.sources = []; state.busy = true; render();
    try {
      const result = await EREApi.search(state.query, state.category, settings().workerUrl, settings().region);
      state.results = result.results || [];
      state.warnings = result.warnings || [];
      state.sources = result.sources || [];
      if (!state.results.length && !state.warnings.length) state.warnings.push('No records were returned by the connected sources.');
    } catch (error) {
      state.warnings = [error.message || 'Search failed.'];
    } finally {
      state.busy = false;
      render();
    }
  }

  async function runNews(query) {
    state.newsQuery = String(query || '').trim();
    if (state.newsQuery.length < 2) { toast('Enter a topic to search.', 'error'); return; }
    state.view = 'news'; state.newsResults = []; state.newsError = ''; state.savedSnapshot = false; state.busy = true; render();
    try {
      state.newsResults = await EREApi.news(state.newsQuery, state.newsKind, settings().region, settings().workerUrl);
    } catch (error) {
      state.newsResults = [];
      state.newsError = error.message;
    } finally { state.busy = false; render(); }
  }

  function findResult(id) {
    return state.results.find(item => item.id === id) || (state.selected?.id === id ? state.selected : null);
  }
  async function saveResult(item) {
    if (!item) return;
    if (state.records.some(record => record.kind === 'entity' && record.sourceKey === item.sourceKey && record.sourceId === item.sourceId && record.title === item.title)) { toast('This source record is already in your library.'); return; }
    try {
      await EREStorage.put({ kind: 'entity', title: item.title, entityType: item.entityType, source: item.source, sourceKey: item.sourceKey, sourceId: item.sourceId, summary: item.summary, url: item.url, image: item.image, raw: item.raw, notes: '', region: settings().region });
      await refreshRecords();
      toast('Saved to your personal research library.', 'success');
    } catch (error) { toast(error.message || 'Could not save this result.', 'error'); }
  }
  async function saveSearch() {
    if (!state.query) return;
    if (state.records.some(record => record.kind === 'search' && record.query === state.query && record.category === state.category)) { toast('This search is already saved.'); return; }
    try {
      await EREStorage.put({ kind: 'search', title: `Search: ${state.query}`, query: state.query, category: state.category, resultCount: state.results.length, results: state.results.slice(0, 30), notes: '', region: settings().region });
      await refreshRecords();
      toast('Search saved to your personal library.', 'success');
      render();
    } catch (error) { toast(error.message || 'Could not save this search.', 'error'); }
  }

  function showDetail(item) {
    if (!item) return;
    state.detailItem = item;
    const links = [];
    if (safeUrl(item.url)) links.push(`<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.source || 'Original source')} ↗</a>`);
    if (safeUrl(item.imdbUrl)) links.push(`<a href="${escapeHtml(item.imdbUrl)}" target="_blank" rel="noopener noreferrer">IMDb ↗</a>`);
    else if (/film|tv|series|screen/i.test(item.entityType || '')) links.push('<span class="type-tag">IMDb link not verified</span>');
    if (safeUrl(item.tmdbUrl)) links.push(`<a href="${escapeHtml(item.tmdbUrl)}" target="_blank" rel="noopener noreferrer">TMDB ↗</a>`);
    else if (/film|tv|series|screen/i.test(item.entityType || '')) links.push('<span class="type-tag">TMDB link not verified</span>');
    const modal = $('#detail-modal');
    const screenEntity = /film|tv|series|screen/i.test(item.entityType || '');
    const verifyButton = screenEntity && state.services?.tmdb ? '<button class="button secondary" data-action="verify-links">Check IMDb and TMDB links</button>' : '';
    const rottenTomatoes = screenEntity ? '<span class="type-tag">Rotten Tomatoes not checked in this draft</span>' : '';
    const config = settings();
    const aiButton = config.aiMode === 'gateway'
      ? `<button class="button secondary" data-action="reason-detail" ${state.services?.ai ? '' : 'disabled'}>Use configured AI</button>`
      : config.aiMode === 'external' ? '<button class="button secondary" data-action="open-ai">Open selected AI website ↗</button>' : '';
    $('#detail-content').innerHTML = `<div class="eyebrow">${escapeHtml(item.source || 'RESEARCH SOURCE')} · ${escapeHtml(item.entityType || 'ENTITY')}</div><h2 id="detail-title">${escapeHtml(item.title)}</h2><div class="muted" style="font-size:10px">${escapeHtml(item.subtitle || '')}</div><p class="detail-summary">${escapeHtml(item.summary || 'No summary supplied by the source.')}</p><div class="detail-links">${links.join('') || '<span class="type-tag">No direct source link supplied</span>'}${rottenTomatoes}</div><div class="note-banner"><span class="note-icon">ⓘ</span><div>Source record: ${escapeHtml(item.source || 'Unknown')}. This result is not a substitute for full v3.8 verification. Claims, credits and relationships must be checked against the relevant primary and specialist sources before being treated as confirmed.</div></div><div class="detail-actions"><button class="button primary" data-action="save-detail">Save this research</button><button class="button secondary" data-action="explore-detail">Explore connections</button>${verifyButton}${aiButton}<button class="button ghost" data-action="close-modal">Close</button></div>`;
    modal.hidden = false;
  }

  async function exploreItem(item) {
    if (!item) return;
    state.selected = item; state.graphRelationships = []; state.graphWarnings = []; state.savedSnapshot = false; state.view = 'connections'; render();
    try {
      const response = await EREApi.connections(item, settings().workerUrl);
      state.graphRelationships = response.relationships || [];
      state.graphWarnings = response.warnings || [];
      if (response.imdbUrl) state.selected.imdbUrl = response.imdbUrl;
      if (response.tmdbUrl) state.selected.tmdbUrl = response.tmdbUrl;
    } catch (error) { state.graphWarnings = [error.message || 'Could not load relationship data.']; }
    render();
  }

  function openUrl(url) {
    const safe = safeUrl(url);
    if (!safe) { toast('No verified web address is available for this item.', 'error'); return; }
    window.open(safe, '_blank', 'noopener,noreferrer');
  }

  function openEdit(record) {
    if (!record) return;
    $('#edit-record-id').value = record.id;
    $('#edit-title-input').value = record.title || record.query || '';
    $('#edit-notes-input').value = record.notes || '';
    $('#edit-subtitle').textContent = record.kind === 'search' ? 'Edit the saved search title and your notes.' : 'Edit the saved research title and your notes.';
    $('#edit-modal').hidden = false;
  }

  async function checkGateway() {
    toast('Checking the research gateway...');
    await refreshServiceStatus();
    render();
    if (state.services.connected) toast('Research gateway connected.', 'success');
    else toast(state.services.reason || 'Research gateway is not connected.', 'error');
  }

  async function handleAction(button) {
    const action = button.dataset.action;
    if (!action) return;
    const id = button.dataset.id;
    if (action === 'navigate') return navigate(button.dataset.view);
    if (action === 'category-search') { state.category = button.dataset.category; return navigate('search'); }
    if (action === 'set-category') { state.category = button.dataset.category; render(); return; }
    if (action === 'set-news-kind') { state.newsKind = button.dataset.kind; state.newsResults = []; state.savedSnapshot = false; render(); return; }
    if (action === 'settings-tab') { state.settingsTab = button.dataset.tab; render(); return; }
    if (action === 'detail') return showDetail(findResult(id));
    if (action === 'save-result') return saveResult(findResult(id));
    if (action === 'save-search') return saveSearch();
    if (action === 'open-record') {
      const record = state.records.find(item => item.id === id);
      if (!record) return;
      if (record.kind === 'search') {
        state.savedSnapshot = true;
        if (record.category === 'news' || record.category === 'upcoming') {
          state.newsKind = record.category; state.newsQuery = record.query || ''; state.newsResults = record.results || []; state.newsError = ''; state.view = 'news'; render();
        } else {
          state.query = record.query || ''; state.category = record.category || 'all'; state.results = record.results || []; state.warnings = ['Showing the saved search snapshot. Refresh it when online to retrieve current results.']; state.view = 'search'; render();
        }
      } else {
        const item = { id: record.id, title: record.title, entityType: record.entityType, source: record.source, sourceKey: record.sourceKey, sourceId: record.sourceId, summary: record.summary, url: record.url, image: record.image, raw: record.raw, imdbUrl: record.imdbUrl, tmdbUrl: record.tmdbUrl };
        if (Array.isArray(record.relationships)) { state.selected = item; state.graphRelationships = record.relationships; state.graphWarnings = []; state.savedSnapshot = true; state.view = 'connections'; render(); }
        else showDetail(item);
      }
      return;
    }
    if (action === 'refresh-saved-search') return runSearch(state.query, state.category);
    if (action === 'refresh-saved-news') return runNews(state.newsQuery);
    if (action === 'refresh-map') return exploreItem(state.selected);
    if (action === 'save-map') {
      if (!state.selected || !state.graphRelationships.length) return;
      const existing = state.records.find(record => record.kind === 'entity' && record.sourceKey === state.selected.sourceKey && record.sourceId === state.selected.sourceId);
      const record = { kind: 'entity', title: state.selected.title, entityType: state.selected.entityType, source: state.selected.source, sourceKey: state.selected.sourceKey, sourceId: state.selected.sourceId, summary: state.selected.summary, url: state.selected.url, image: state.selected.image, raw: state.selected.raw, imdbUrl: state.selected.imdbUrl, tmdbUrl: state.selected.tmdbUrl, relationships: state.graphRelationships, notes: existing?.notes || '' };
      if (existing) await EREStorage.put({ ...existing, ...record }); else await EREStorage.put(record);
      await refreshRecords(); toast('Relationship map saved for offline viewing.', 'success'); return;
    }
    if (action === 'save-news') {
      const item = state.newsResults[Number(button.dataset.index)];
      if (!item) return;
      if (state.records.some(record => record.kind === 'entity' && record.url === item.url)) { toast('This news result is already saved.'); return; }
      await EREStorage.put({ kind: 'entity', title: item.title, entityType: 'News article', source: item.source || 'Brave Search', url: item.url, summary: item.description || '', notes: '', query: state.newsQuery, region: settings().region });
      await refreshRecords(); toast('News result saved to your personal library.', 'success'); return;
    }
    if (action === 'save-news-search') {
      if (state.records.some(record => record.kind === 'search' && record.query === state.newsQuery && record.category === state.newsKind)) { toast('This news search is already saved.'); return; }
      await EREStorage.put({ kind: 'search', title: `Search: ${state.newsQuery}`, query: state.newsQuery, category: state.newsKind, resultCount: state.newsResults.length, results: state.newsResults.slice(0, 30), notes: '', region: settings().region });
      await refreshRecords(); toast('News search saved to your personal library.', 'success'); return;
    }
    if (action === 'explore-result') return exploreItem(findResult(id));
    if (action === 'detail-selected') return showDetail(state.selected);
    if (action === 'clear-graph') { state.selected = null; state.graphRelationships = []; state.savedSnapshot = false; state.view = 'connections'; return render(); }
    if (action === 'save-detail') { await saveResult(state.detailItem); $('#detail-modal').hidden = true; return; }
    if (action === 'explore-detail') { const item = state.detailItem; $('#detail-modal').hidden = true; return exploreItem(item); }
    if (action === 'close-modal') { $('#detail-modal').hidden = true; $('#edit-modal').hidden = true; return; }
    if (action === 'open-url') return openUrl(button.dataset.url);
    if (action === 'delete-record') {
      const record = state.records.find(item => item.id === id);
      if (!record) return;
      if (!window.confirm(`Delete “${record.title || record.query || 'saved research'}” from this device? This cannot be undone.`)) return;
      await EREStorage.remove(id); await refreshRecords(); render(); toast('Saved entry deleted.', 'success'); return;
    }
    if (action === 'edit-record') return openEdit(state.records.find(item => item.id === id));
    if (action === 'export-backup') {
      try {
        const backup = await EREStorage.exportBackup();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a'); anchor.href = url; anchor.download = `ere-research-backup-${new Date().toISOString().slice(0,10)}.json`; anchor.click();
        URL.revokeObjectURL(url); toast('Backup file prepared.', 'success');
      } catch (error) { toast(error.message || 'Could not export backup.', 'error'); }
      return;
    }
    if (action === 'import-backup') { $('#import-file').click(); return; }
    if (action === 'save-general-settings') {
      saveSettings({ region: $('#region-setting').value, depth: $('#depth-setting').value, spoilers: $('#spoiler-setting').checked ? 'light' : 'allow' });
      toast('Preferences saved.', 'success'); return render();
    }
    if (action === 'save-worker-url') {
      const value = $('#worker-url').value.trim().replace(/\/$/, '');
      if (value && !/^https:\/\//i.test(value)) { toast('Enter a secure HTTPS Worker URL.', 'error'); return; }
      saveSettings({ workerUrl: value }); await refreshServiceStatus(); render(); toast('Gateway URL saved.', 'success'); return;
    }
    if (action === 'check-worker') return checkGateway();
    if (action === 'save-ai-settings') {
      saveSettings({ aiMode: $('#ai-mode').value, aiProvider: $('#ai-provider').value }); toast('AI preference saved.', 'success'); return render();
    }
    if (action === 'open-ai') return openUrl(EREApi.openAIUrl(settings().aiProvider));
    if (action === 'test-ai') {
      if (settings().aiMode !== 'gateway' || !state.services?.ai) { toast('Select gateway AI mode and configure an AI provider in the Worker first.', 'error'); return; }
      try { const response = await EREApi.reason('Respond with a short confirmation that the configured research gateway is reachable. Do not add entertainment facts.', [], settings().workerUrl, settings()); showAIResponse(response); }
      catch (error) { toast(error.message || 'AI test failed.', 'error'); }
      return;
    }
    if (action === 'verify-links') {
      if (!state.detailItem) return;
      try {
        const checked = await EREApi.connections(state.detailItem, settings().workerUrl);
        if (checked.imdbUrl) state.detailItem.imdbUrl = checked.imdbUrl;
        if (checked.tmdbUrl) state.detailItem.tmdbUrl = checked.tmdbUrl;
        if (checked.warnings?.length) toast(checked.warnings.join(' '), 'error');
        else toast('External screen links checked against the configured source.', 'success');
        showDetail(state.detailItem);
      } catch (error) { toast(error.message || 'Could not verify external links.', 'error'); }
      return;
    }
    if (action === 'reason-detail') {
      if (!state.detailItem) return;
      if (settings().aiMode !== 'gateway' || !state.services?.ai) { toast('Gateway AI is not selected or configured.', 'error'); return; }
      try { const response = await EREApi.reason(`Provide a source-grounded research brief about ${state.detailItem.title}. Use only the supplied source details as evidence, identify what remains unverified, and do not invent links or credits.`, [state.detailItem], settings().workerUrl, settings()); showAIResponse(response); }
      catch (error) { toast(error.message || 'AI reasoning request failed.', 'error'); }
      return;
    }
    if (action === 'external-search') return openUrl(EREApi.externalSearchUrl(state.query, 'search'));
    if (action === 'external-news') return openUrl(EREApi.externalSearchUrl(state.newsQuery, state.newsKind));
  }

  function showAIResponse(response) {
    const text = response.answer || response.content || 'The provider returned no answer.';
    const modal = $('#detail-modal');
    $('#detail-content').innerHTML = `<div class="eyebrow">INDEPENDENT REASONING PROVIDER</div><h2 id="detail-title">Research response</h2><div class="detail-summary" style="white-space:pre-wrap">${escapeHtml(text)}</div><div class="detail-links">${(response.sources || []).filter(source => safeUrl(source.url)).map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title || 'Source')} ↗</a>`).join('')}</div><div class="note-banner"><span class="note-icon">ⓘ</span><div>AI output is an analysis aid, not independent verification. Check the cited original sources before relying on factual claims.</div></div><div class="detail-actions"><button class="button secondary" data-action="close-modal">Close</button></div>`;
    modal.hidden = false;
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (button) { event.preventDefault(); handleAction(button).catch(error => toast(error.message || 'Action failed.', 'error')); return; }
    const graphNode = event.target.closest('[data-graph-index]');
    if (graphNode) {
      const rel = state.graphRelationships[Number(graphNode.dataset.graphIndex)];
      if (rel?.url) openUrl(rel.url);
    }
  });

  document.addEventListener('keydown', event => {
    const node = event.target.closest('[data-graph-index]');
    if (node && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      const rel = state.graphRelationships[Number(node.dataset.graphIndex)];
      if (rel?.url) openUrl(rel.url);
    }
  });

  document.addEventListener('submit', event => {
    if (event.target.id === 'quick-search-form' || event.target.id === 'research-search-form') {
      event.preventDefault(); const data = new FormData(event.target); runSearch(data.get('query'), state.category); return;
    }
    if (event.target.id === 'news-search-form') {
      event.preventDefault(); const data = new FormData(event.target); runNews(data.get('query')); return;
    }
    if (event.target.id === 'edit-form') {
      event.preventDefault();
      const id = $('#edit-record-id').value;
      const record = state.records.find(item => item.id === id);
      if (!record) return;
      EREStorage.put({ ...record, title: $('#edit-title-input').value.trim(), notes: $('#edit-notes-input').value.trim() }).then(async () => { $('#edit-modal').hidden = true; await refreshRecords(); render(); toast('Saved research updated.', 'success'); }).catch(error => toast(error.message || 'Could not update the saved record.', 'error'));
    }
  });

  $('#import-file').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      const result = await EREStorage.importBackup(payload);
      await refreshRecords(); render();
      toast(`Backup merged. ${result.imported} imported, ${result.skipped} duplicate or invalid entries skipped.`, 'success');
    } catch (error) { toast(error.message || 'Could not import this backup.', 'error'); }
    event.target.value = '';
  });

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);

  async function initialise() {
    updateStatus();
    await refreshRecords();
    await refreshServiceStatus();
    render();
    if (!new URLSearchParams(location.search).has('test') && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }
  }

  initialise().catch(error => {
    const root = $('#main-view');
    if (root) root.innerHTML = `<div class="empty-state"><h3>Application startup problem</h3><p>${escapeHtml(error.message || 'Unknown error')}</p></div>`;
  });
})();
