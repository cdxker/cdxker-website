# cdxker.com

Astro personal site hosted on Cloudflare Workers at [cdxker.com](https://cdxker.com), using the main Cloudflare account. Astro generates static HTML, bundled JavaScript, and compiled Tailwind CSS.

All site styles use Tailwind utilities. Shared font and color tokens live in the `@theme` block in `src/styles/global.css`; Markdown typography is handled by descendant utilities in `src/layouts/WritingLayout.astro`.

Edit the homepage in `src/pages/index.astro`, metadata in `src/layouts/BaseLayout.astro`, and the quote animation in `src/scripts/quotes.js`. Public files live in `public/` and keep their existing URLs. Replace `public/profile.png` to update the profile picture, page icon, and social preview image; update its dimensions in the layout if they change.

Use Node.js 22.12 or newer. Install the locked dependencies and start Astro:

```sh
npm ci
npm run dev
```

`astro.config.mjs` sets the canonical site URL and generates the sitemap. `public/robots.txt` points crawlers to that sitemap. Metadata includes canonical, Open Graph, Twitter, and WebSite/Person structured data.

## Essays and poems

Astro's content collections are defined in `src/content.config.ts`. Add Markdown files to `src/content/essays/` or `src/content/poems/`. Each folder contains a `.md.example` template; copy it to a new `.md` file to create an entry. The example files are excluded from the collections.

Every entry requires `title` and `pubDate`. Optional fields are `description`, `updatedDate`, `draft` and `unlisted` (both default to `false`), and `tags` (defaults to an empty list). Use `YYYY-MM-DD` dates. File names provide the entry IDs, so `essays/on-writing.md` has the ID `on-writing` and is rendered at `/essays/on-writing/`.

Entries with `draft: true` do not get a page. Entries with `unlisted: true` are accessible by URL, have a `noindex` robots tag, and are excluded from the sitemap. This is for sharing links, not access control. The sample entries at `/essays/sample-essay/` and `/poems/sample-poem/` are unlisted. Neither collection has a listing page or homepage links yet.

Poem pages end with a "View also" section showing up to three of the latest public poems. It excludes the current poem, drafts, and unlisted entries. Until another public poem is available, the section shows an empty state.

Essays can include an optional image above the title. Set `image.src` to a local image path relative to the Markdown file, and provide descriptive text in `image.alt`:

```yaml
image:
  src: "./images/essay-photo.jpg"
  alt: "Describe what the image shows."
```

Astro generates a JPEG up to 1600 pixels wide, preserving the aspect ratio and avoiding upscaling. The same image becomes the essay's Open Graph and Twitter preview, with its URL, dimensions, and alternative text in the page metadata. Essays without an image retain the profile picture as their social preview.

Query entries with Astro's content API, filtering drafts and unlisted entries when building public listings:

```astro
---
import { getCollection } from "astro:content";

const essays = await getCollection("essays", ({ data }) => !data.draft && !data.unlisted);
const poems = await getCollection("poems", ({ data }) => !data.draft && !data.unlisted);
---
```

For an individual entry, use `getEntry("poems", "entry-id")` and `render(entry)` from `astro:content` to render its Markdown. Markdown soft line breaks render as spaces; use two trailing spaces or a trailing backslash where a poem needs a hard line break, and blank lines between stanzas.

## Build and deploy

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
