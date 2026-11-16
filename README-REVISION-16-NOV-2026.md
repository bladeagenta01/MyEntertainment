# Revision instructions. 16 November 2026

Release label: v0.1 Pilot Draft
Revision: Provider Usage Profiles and Operating Modes
Target branch: `pages-multiprovider-pilot`

## What this revision changes

- Adds Testing Mode and Production Mode.
- Adds provider-specific account profile labels for Google Gemini, OpenAI and Anthropic.
- Adds an on/off control for live web search.
- Adds a model-list endpoint so the app can retrieve models visible to the selected API key.
- Adds a separate small AI generation test without live web search.
- Keeps the existing API-key authentication test separate.
- Corrects the Cloudflare Pages redirect handling that caused the previous provider connection failure.

## Files added

- `functions/_lib/provider-profiles.js`
- `functions/api/models.js`
- `functions/api/test-generation.js`
- `README-REVISION-16-NOV-2026.md`

## Files updated

- `functions/_lib/provider.js`
- `app.js`
- `index.html`
- `styles.css`
- `README.md`
- `CHANGELOG.md`
- `BUILD-NOTES.md`
- `RESEARCH-MAPPING.md`
- `README-CLOUDFLARE-SETUP.md`

The remaining application files are retained from the previous reviewed package, including the Entertainment 3.8 prompt source and the existing research/test routes.

## Step-by-step GitHub update

1. Download and extract the revised ZIP on the Windows laptop.
2. Open the `MyEntertainment` repository on GitHub.
3. Switch to the existing `pages-multiprovider-pilot` branch. Do not switch to `main`.
4. Choose **Add file**, then **Upload files**.
5. Open the extracted project folder. Upload its contents, including the `functions` folder and all documentation files. Do not upload the outer ZIP file and do not flatten the `functions` folders.
6. Allow GitHub to replace files that already exist and add the three new function/profile files listed above.
7. Review the changed-file list. Confirm that the target branch is `pages-multiprovider-pilot` and not `main`.
8. Use this commit message: `Add provider usage profiles, operating modes and model discovery`.
9. Commit the changes to `pages-multiprovider-pilot`.

Do not delete or edit the old Worker. Do not make changes to `main` as part of this pilot update.

## Step-by-step Cloudflare check

1. Open the existing Cloudflare Pages project connected to `MyEntertainment`.
2. Confirm its production branch is `pages-multiprovider-pilot`.
3. A new deployment should start automatically after the GitHub commit.
4. Wait for the deployment to show Success.
5. Open the existing `pages.dev` address and refresh the page. If the new interface does not appear, check the deployment commit and branch before changing any settings.

## Test sequence after deployment

1. Open Settings. Confirm the default mode is Testing Mode.
2. Confirm Google Gemini is selected and the provider profile says Google Free Tier.
3. Enter the existing Gemini API key in the app. Do not send the key in chat or put it in GitHub.
4. Select **Test & Save Key**. This checks authentication only.
5. Select **Load Models**. Choose a model returned by Google's API for this key. Do not assume that an old hard-coded model ID is still valid.
6. Select **Test AI Generation**. This makes a small model request without live web search. It may still use provider quota, but it avoids the separate web-search grounding tool.
7. If generation succeeds, close Settings and run a short research question with live web search disabled.
8. If that succeeds, open Settings and enable live web search. Run one short test question separately. Google Search grounding may have a separate quota from model generation.
9. Do not switch to Production Mode or enable paid billing until the Testing Mode results and provider billing implications are understood.

## What the app can and cannot guarantee

- Testing Mode caps research depth at Level 2, the question at 1,200 characters and saved reference information at 4,000 characters.
- Testing Mode starts with live web search disabled. When enabled, OpenAI uses low search context and Anthropic is limited to one search-tool use. Google's grounding tool has no equivalent per-request use cap in this implementation.
- Production Mode restores depth Levels 1 to 4 and the larger request limits.
- Provider account profiles are labels chosen by the user. The app cannot read provider credit balances or prove that a request is free.
- Application limits reduce request size and some search usage. They are not a guaranteed spending cap. Provider billing and spend controls remain authoritative.
- No automatic switch to another provider, automatic paid-usage fallback or automatic retry is implemented.
- No per-user daily request budget is implemented. This anonymous BYOK application has no trusted user identity or server-side account ledger.

## Verification status at package creation

Static JavaScript syntax checks, mocked provider tests, HTML ID checks, route configuration parsing and ZIP integrity checks passed. No live provider call, GitHub upload, Cloudflare deployment or physical-device test has been performed for this package revision.
