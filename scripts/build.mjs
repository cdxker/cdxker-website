import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "dist");
const entries = await readdir(root, { withFileTypes: true });
const covers = entries
  .filter((entry) => entry.isFile() && /^covers__.*\.(png|jpg)$/.test(entry.name))
  .map((entry) => entry.name)
  .sort();
const files = ["index.html", "music.py", ...covers];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all(files.map((file) => copyFile(join(root, file), join(output, file))));

console.log(`Built ${files.length} static assets in dist/`);
