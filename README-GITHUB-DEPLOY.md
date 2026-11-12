# Publish the browser application to GitHub Pages

1. Open your existing Entertainment Research repository on GitHub.
2. Select **Add file**, then **Upload files**.
3. From this package, upload these four files to the repository's top/root level:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `config.js`
4. If GitHub asks whether to replace existing files, confirm. These four files belong together and should come from this same package.
5. Enter a commit message such as `Consolidate v0.1 pilot and fix BYOK connection`.
6. Select **Commit changes**.
7. Open **Settings > Pages**. Confirm the publishing source is the intended branch and root folder.
8. Wait for GitHub Pages to publish, then open the Pages URL.

Do not upload `worker-dashboard.js` as a browser application file. It belongs in Cloudflare.

## Before using the app
The `config.js` file already points to:
`https://myentertainment.bladeagenta01.workers.dev`

If you later change the Worker name or subdomain, update this public endpoint in `config.js` and commit that change. Never put an API key in this file.

Use the published HTTPS GitHub Pages address for testing. Do not use a local `file://` copy for the first BYOK test.
