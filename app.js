(() => {
  const $ = id => document.getElementById(id);
  const endpoint = String(window.ENTERTAINMENT_API_ENDPOINT || '').trim();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
  const labels = { music:'Music, artists and recordings', film:'Film and cinema', television:'Television and streaming', people:'People and creative careers', books:'Books and literature', games:'Games and interactive entertainment', documentary:'Documentaries and factual works', theatre:'Theatre and performance', 'cross-media':'Cross-media and entertainment history', upcoming:'Current and upcoming entertainment' };
  function setStatus(message) { $('status').textContent = message; }
  function showResult(title, html) {
    $('resultTitle').textContent = title;
    $('resultBody').innerHTML = html;
    $('results').classList.remove('hidden');
    $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function renderItem(item) {
    const url = safeUrl(item.url), image = safeUrl(item.image);
    return `<article class="result-item">${image ? `<img class="result-image" src="${esc(image)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}<div class="result-copy"><h4>${esc(item.title || 'Untitled record')}</h4>${item.subtitle ? `<p class="result-subtitle">${esc(item.subtitle)}</p>` : ''}${item.summary ? `<p>${esc(item.summary)}</p>` : ''}<p class="result-source">Source: ${esc(item.source || 'External catalogue')}${url ? ` · <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open source record</a>` : ''}</p></div></article>`;
  }
  function renderResearch(data) {
    const category = labels[data.category] || data.category || 'Entertainment';
    let html = `<div class="research-intro"><span class="classification">${esc(category)}</span><p><strong>Search:</strong> ${esc(data.query)}</p><p><strong>Research date:</strong> ${esc(data.researchDate || 'Not supplied')} · <strong>Depth:</strong> ${esc(data.depth || 2)}</p></div>`;
    let found = 0;
    for (const group of (data.groups || [])) {
      const items = group.items || [];
      found += items.length;
      html += `<section class="source-group"><h3>${esc(group.name)}</h3>`;
      if (items.length) html += items.map(renderItem).join('');
      else html += `<p class="muted">No matching records were returned by this source${group.error ? ` (${esc(group.error)})` : ''}.</p>`;
      html += '</section>';
    }
    if (!found) html += '<p class="error">No matching records were returned. Try a different search phrase or choose a more specific category.</p>';
    html += '<section class="source-group"><h3>Research coverage and limitations</h3><ul>';
    for (const note of (data.limitations || [])) html += `<li>${esc(note)}</li>`;
    html += '</ul></section>';
    html += `<p class="small muted">${found} catalogue records returned. These are source records, not independently verified conclusions.</p>`;
    return html;
  }
  async function search() {
    const query = $('query').value.trim();
    if (!query) { setStatus('Enter an entertainment subject or question first.'); $('query').focus(); return; }
    if (!endpoint) { setStatus('Live research is not configured yet. Deploy the included Cloudflare Worker and add its HTTPS URL to config.js. No AI key or AI service is required.'); return; }
    if (!/^https:\/\//i.test(endpoint)) { setStatus('The configured research endpoint must begin with https://'); return; }
    const payload = { query, category: $('category').value, depth: Number($('depth').value), region: $('region').value, spoilers: $('spoilers').value };
    $('searchBtn').disabled = true;
    setStatus('Searching connected entertainment catalogues.');
    try {
      const response = await fetch(endpoint.replace(/\/$/, '') + '/research', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({ error: 'The research service returned an unreadable response.' }));
      if (!response.ok) throw new Error(data.error || `Research service returned HTTP ${response.status}.`);
      showResult('Research results', renderResearch(data));
      setStatus(`Search completed. ${data.sourceCount || 0} catalogue records returned. No search history has been saved.`);
    } catch (error) { setStatus(`Unable to complete this search. ${error.message}`); }
    finally { $('searchBtn').disabled = false; }
  }
  $('searchBtn').addEventListener('click', search);
  $('newSearchBtn').addEventListener('click', () => { $('results').classList.add('hidden'); $('query').value = ''; setStatus('Ready for a new independent search. No previous search is retained by the application.'); $('query').focus(); });
  $('query').addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') search(); });
})();
