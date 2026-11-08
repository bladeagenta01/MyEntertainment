from pathlib import Path
from html.parser import HTMLParser
import json, re, tomllib

ROOT = Path(__file__).resolve().parents[1]
class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.assets=[]
    def handle_starttag(self, tag, attrs):
        data=dict(attrs)
        if data.get('id'): self.ids.append(data['id'])
        if tag == 'script' and data.get('src'): self.assets.append(data['src'])
        if tag == 'link' and data.get('rel') in ('stylesheet','manifest','icon','apple-touch-icon') and data.get('href'): self.assets.append(data['href'])

for html in ['index.html','tests/smoke.html']:
    parser=Parser(); parser.feed((ROOT/html).read_text())
    assert len(parser.ids) == len(set(parser.ids)), f'Duplicate IDs in {html}'
    for asset in parser.assets:
        if asset.startswith('http'): continue
        path = (ROOT/html).parent / asset
        assert path.resolve().exists(), f'Missing {asset} referenced from {html}'
print('PASS: HTML parsing, unique IDs and local asset references')

css = (ROOT/'css/styles.css').read_text()
assert css.count('{') == css.count('}'), 'Unbalanced CSS rule braces'
assert '/*' not in css or '*/' in css, 'Unclosed CSS comment'
print('PASS: CSS rule braces and comment structure')

manifest=json.loads((ROOT/'manifest.webmanifest').read_text())
for icon in manifest['icons']:
    assert (ROOT/icon['src'].replace('./','')).exists(), f'Missing manifest icon: {icon["src"]}'
with (ROOT/'worker/wrangler.toml').open('rb') as file:
    tomllib.load(file)
print('PASS: manifest JSON, icon files and Wrangler TOML')

app=(ROOT/'js/app.js').read_text()
all_actions=set(re.findall(r'data-action=[\\\"\']([a-z-]+)', app))
all_actions.update(re.findall(r'data-action\\\\?=[\\\"\']([a-z-]+)', (ROOT/'index.html').read_text()))
branches=set(re.findall(r"action === '([a-z-]+)'", app))
missing=sorted(all_actions-branches)
assert not missing, f'Actions without handlers: {missing}'
print(f'PASS: all {len(all_actions)} declared data-action values have handlers')

sw=(ROOT/'service-worker.js').read_text()
assert '/api/' in sw and 'return;' in sw
for path in re.findall(r"'\\./([^']+)'", sw):
    assert (ROOT/path).exists(), f'Service worker cache path missing: {path}'
print('PASS: service-worker shell paths exist and API routes are excluded')

storage=(ROOT/'js/storage.js').read_text()
assert 'indexedDB.open' in storage and 'async remove' in storage and 'importBackup' in storage
assert 'makeId()' in storage
print('PASS: IndexedDB, delete and merge-import foundations present')

public_text='\n'.join(p.read_text(errors='ignore') for p in ROOT.rglob('*') if p.is_file() and p.suffix in {'.js','.html','.json','.toml','.md'})
for pattern in [r'\\bsk-[A-Za-z0-9]{16,}\\b', r'AIza[0-9A-Za-z_-]{20,}', r'BRAVE_API_KEY\\s*=\\s*[\"\'][^\"\']+[\"\']', r'TMDB_API_KEY\\s*=\\s*[\"\'][^\"\']+[\"\']']:
    assert not re.search(pattern, public_text), f'Possible credential found: {pattern}'
print('PASS: no obvious hard-coded provider credentials')
