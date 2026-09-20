# cdxker.com

Static personal site hosted on Cloudflare Workers at [cdxker.com](https://cdxker.com), using the main Cloudflare account.

Edit `index.html` and the cover images in the repository root. Wrangler runs `node scripts/build.mjs` before deployment to copy `index.html`, `music.py`, and `covers__*.png` / `covers__*.jpg` into `dist/`. Add any new public files to that build script.

For local deployments, use Node.js 22 or newer and install the same Wrangler version used by CI:

```sh
npm install --global wrangler@4.114.0
```

Authenticate with `CLOUDFLARE_API_TOKEN`, or with both `CLOUDFLARE_API_KEY` and `CLOUDFLARE_EMAIL` for a global API key. Export these variables from your private environment before running Wrangler. `wrangler.jsonc` selects the main account, `9d2c6364b3d18075cf04a31235a5dc59`.

Validate and deploy:

```sh
wrangler deploy --dry-run
./update.sh
```

Every push to `main` runs the [deployment workflow](.github/workflows/deploy.yml). It can also be run manually from the Actions tab on `main`. GitHub needs the repository secret `CLOUDFLARE_API_TOKEN` and repository variable `CLOUDFLARE_ACCOUNT_ID`. The workflow installs Wrangler automatically and deploys the site to Cloudflare.
