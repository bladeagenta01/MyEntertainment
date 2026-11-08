(function () {
  'use strict';

  function esc(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function short(value, max) {
    const text = String(value || '');
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  }

  function render(root, relationships) {
    const width = 920;
    const height = 390;
    const cx = width / 2;
    const cy = height / 2;
    const radiusX = 285;
    const radiusY = 145;
    const items = (relationships || []).slice(0, 8);
    const nodes = items.map((item, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index / Math.max(items.length, 1));
      return { ...item, x: cx + Math.cos(angle) * radiusX, y: cy + Math.sin(angle) * radiusY, index };
    });
    const lines = nodes.map(node => `<line x1="${cx}" y1="${cy}" x2="${node.x}" y2="${node.y}" stroke="rgba(201,164,92,.28)" stroke-width="1.5" stroke-dasharray="4 5"/><text x="${(cx + node.x) / 2}" y="${(cy + node.y) / 2 - 7}" text-anchor="middle" fill="#8fa2b8" font-size="8">${esc(short(node.type || 'Related', 22))}</text>`).join('');
    const outerNodes = nodes.map(node => {
      const label = short(node.title, 25);
      const fill = node.type && /actor|cast|crew|director|writer|person/i.test(node.type) ? '#254a63' : '#4c3c2b';
      return `<g class="graph-node" data-graph-index="${node.index}" tabindex="0" role="button" aria-label="Open ${esc(node.title)}" transform="translate(${node.x},${node.y})"><circle r="31" fill="${fill}" stroke="rgba(201,164,92,.58)"/><circle r="24" fill="none" stroke="rgba(255,255,255,.09)"/><text text-anchor="middle" y="-3">${esc(label.slice(0, 15))}</text><text class="node-type" text-anchor="middle" y="11">${esc(short(node.type || 'Related', 16))}</text></g>`;
    }).join('');
    const rootLabel = short(root?.title || 'Selected entity', 30);
    const rootType = short(root?.entityType || 'Research subject', 18);
    const rootNode = `<g transform="translate(${cx},${cy})"><circle r="53" fill="#9a7740" opacity=".12"/><circle r="42" fill="#1d334a" stroke="#d3b36f" stroke-width="2"/><circle r="34" fill="none" stroke="rgba(228,196,125,.22)"/><text text-anchor="middle" y="-3" fill="#fff0ce" font-size="11" font-weight="700">${esc(rootLabel.slice(0, 18))}</text><text text-anchor="middle" y="13" fill="#d5b978" font-size="8">${esc(rootType)}</text></g>`;
    return `<svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Relationship map for ${esc(rootLabel)}"><defs><radialGradient id="graphGlow"><stop offset="0" stop-color="#d1ae67" stop-opacity=".18"/><stop offset="1" stop-color="#d1ae67" stop-opacity="0"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="180" fill="url(#graphGlow)"/>${lines}${outerNodes}${rootNode}</svg>`;
  }

  window.EREGraph = { render };
})();
