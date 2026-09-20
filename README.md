# cdxker.com

Astro personal site hosted on Cloudflare Workers at [cdxker.com](https://cdxker.com), using the main Cloudflare account. Astro generates static HTML, bundled JavaScript, and compiled Tailwind CSS.

Edit the homepage in `src/pages/index.astro`, metadata in `src/layouts/BaseLayout.astro`, and the quote animation in `src/scripts/quotes.js`. Public files live in `public/` and keep their existing URLs. Replace `public/profile.png` to update the profile picture, page icon, and social preview image; update its dimensions in the layout if they change.

Use Node.js 22.12 or newer. Install the locked dependencies and start Astro:

```sh
npm ci
npm run dev
```

`astro.config.mjs` sets the canonical site URL and generates the sitemap. `public/robots.txt` points crawlers to that sitemap. Metadata includes canonical, Open Graph, Twitter, and WebSite/Person structured data.

Build and check the generated site:

```sh
npm run build
npm test
npm run preview
```

For deployment, authenticate with `CLOUDFLARE_API_TOKEN`, or both `CLOUDFLARE_API_KEY` and `CLOUDFLARE_EMAIL` for a global API key. Export these variables from your private environment. `wrangler.jsonc` selects the main account, `9d2c6364b3d18075cf04a31235a5dc59`.

```sh
npm run deploy -- --dry-run
./update.sh
```

Wrangler builds the site and runs the regression tests before every deployment. Every push to `main` runs the [deployment workflow](.github/workflows/deploy.yml), which installs dependencies with `npm ci` and deploys to Cloudflare with Wrangler. It can also be run manually from the Actions tab on `main`. GitHub uses the repository secret `CLOUDFLARE_API_TOKEN` and repository variable `CLOUDFLARE_ACCOUNT_ID`.
