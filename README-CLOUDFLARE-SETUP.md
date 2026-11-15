# Initial Cloudflare Pages setup

This is a one-time setup for the new architecture. It replaces the old standalone Worker deployment. Keep the existing Worker and GitHub Pages site until the new Pages site passes testing.

## 1. Prepare the GitHub repository
The repository may remain Public during the pilot, as currently planned. It can be made Private after testing, before retiring the old GitHub Pages site.
1. Extract this ZIP on your Windows laptop.
2. In your `MyEntertainment` repository, create a new branch named `pages-multiprovider-pilot`. Leave the current production branch unchanged.
3. Upload the complete contents of the extracted project folder to the repository root on the new branch.
4. Preserve the `functions` folder and its subfolders. Do not upload only the four browser files.
5. Commit the changes to `pages-multiprovider-pilot`. This protects the existing GitHub Pages version while the new deployment is tested.

## 2. Create the Cloudflare Pages project
1. Sign in to Cloudflare.
2. Open Workers & Pages.
3. Choose Create application, then Pages, then Connect to Git.
4. Authorise GitHub if prompted and select the `MyEntertainment` repository.
5. Select the `pages-multiprovider-pilot` branch as the production branch for this new Pages project.
6. Set the framework preset to None.
7. Set the build command to blank / no build command.
8. Set the build output directory to `.` (the repository root). If the dashboard rejects this value, stop and share a screenshot rather than guessing.
9. Save and deploy.

Cloudflare Pages Functions are discovered from the root-level `functions` directory. `_routes.json` limits function invocation to `/api/*`; static assets are served directly.

## 3. Check deployment
Open the new `pages.dev` URL. Then test:
- The application loads without a 404.
- Settings opens.
- Select Google Gemini and enter your own key.
- Select Test & Save Key.
- A successful test confirms the key was accepted by the provider's models endpoint. It does not prove that a complete research request works.
- Run a small research question and inspect the response and source links.

After that, test OpenAI and Anthropic only if you have their own API keys and billing enabled.

## 4. Important
- Do not paste API keys into GitHub, Cloudflare source code, screenshots or chat.
- Do not paste the old `worker-dashboard.js` into Cloudflare.
- Do not delete the old Worker or GitHub Pages deployment until the new site is tested.
- If the Cloudflare build fails, open the deployment log and share the error text with all keys and private tokens removed.
