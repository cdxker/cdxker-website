import { defineConfig } from "astro/config";
import { readFile } from "node:fs/promises";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const outDir = "./dist/";

export default defineConfig({
  site: "https://cdxker.com",
  output: "static",
  outDir,
  integrations: [
    sitemap({
      async serialize(page) {
        const pathname = new URL(page.url).pathname;
        if (!/^\/(essays|poems)\//.test(pathname)) return page;

        // Read the rendered robots tag so unlisted entries stay out of the sitemap.
        const file = new URL(`.${pathname.replace(/\/?$/, "/")}index.html`, new URL(outDir, import.meta.url));
        const html = await readFile(file, "utf8");
        const head = html.split("</head>")[0];
        const robots = head.match(/<meta\s+name="robots"\s+content="([^"]*)"/i)?.[1];
        return robots?.split(/\s*,\s*/).includes("noindex") ? undefined : page;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
