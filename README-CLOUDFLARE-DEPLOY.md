# Deploy the complete Worker through the Cloudflare dashboard

This package uses a single-file Worker. You do not need to create a separate prompt module.

1. Sign in at https://dash.cloudflare.com/
2. Open **Workers & Pages**.
3. Select the existing Worker named `myentertainment`.
4. Open **Edit code** or **Quick edit**.
5. Select all existing code in the editor and delete it.
6. Open `worker-dashboard.js` from this package in a text editor.
7. Copy the entire file, from its first comment to its final closing brace.
8. Paste the complete contents into the Cloudflare editor.
9. Save and select **Deploy** / **Save and Deploy**.
10. Wait for Cloudflare to report a successful deployment.

## Check the deployment before entering an API key

Open this URL in a browser:
https://myentertainment.bladeagenta01.workers.dev/health

Expected response includes:
`"ok":true`
and the endpoints `/test` and `/research`.

If you do not see that response, stop. Do not test or paste an API key into the app yet.

## What this Worker supports
- `GET /health`
- `POST /test`
- `POST /research`
- CORS preflight (`OPTIONS`)
- OpenAI, Anthropic and Google Gemini BYOK requests
- Live web-search tools for supported providers

## Security and deployment notes
- The Worker accepts the user's API key in the `X-User-API-Key` request header.
- It forwards the key to the selected provider. It does not intentionally log, store or cache it.
- CORS is permissive (`*`) for this pilot. Before public release, restrict `Access-Control-Allow-Origin` to the exact GitHub Pages origin.
- Add rate limiting/abuse controls before wider public use.
- Do not create a Cloudflare secret containing a developer key. This is a BYOK design.

## Troubleshooting
- `404` on `/test`: confirm the entire `worker-dashboard.js` file was deployed, not only the CORS snippet.
- CORS error: confirm the deployed CORS allow-headers line includes `Content-Type, X-User-API-Key, X-AI-Provider`.
- `401` from `/test`: the provider rejected the key or its permissions.
- `429`: provider quota, billing or rate limit issue.
- `/health` works but research fails: inspect the returned provider error. The selected model may not be available to the account.
