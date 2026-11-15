# GitHub source management

The GitHub repository is the single source of truth. It may remain public during pilot testing and can be made private after the Cloudflare Pages deployment is verified.

## Files to upload
For the first pilot deployment, create a separate branch named `pages-multiprovider-pilot` and upload the complete contents of this package to that branch's repository root, including the `functions` folder and `_routes.json`. Do not flatten the `functions` directory. Leave the existing production branch unchanged until the new Cloudflare Pages deployment has passed testing.

## Normal updates
1. Make changes to the local source files.
2. Review `CHANGELOG.md`.
3. Commit the changed files to the branch connected to Cloudflare Pages. During the pilot, this is `pages-multiprovider-pilot`.
4. Cloudflare Pages automatically deploys the commit.
5. Check the Pages deployment status and test the changed feature.

Do not edit the live Cloudflare code as a separate source of truth. If an emergency dashboard edit is unavoidable, copy the change back into GitHub immediately.

The repository can remain private while the Pages website is publicly reachable. Private source code does not automatically mean private website access. If the site itself must be restricted, configure Cloudflare Access separately.
