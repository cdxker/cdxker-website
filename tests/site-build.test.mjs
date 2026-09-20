import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const output = new URL('../dist/', import.meta.url);
const html = readFileSync(new URL('index.html', output), 'utf8');
const origin = 'https://cdxker.com/';
const title = "Denzell's Website";
const profile = new URL('profile.png', origin).href;

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match?.slice(1).find((value) => value !== undefined)
    ?.replace(/&#(?:39|x27);|&apos;/gi, "'").replace(/&amp;/g, '&');
}

const tags = (name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) => tag);
const metadata = new Map(tags('meta').map((tag) => [attribute(tag, 'name') ?? attribute(tag, 'property'), attribute(tag, 'content')]));

test('built homepage contains canonical, search, and social sharing metadata', () => {
  assert.match(html, /<html\b[^>]*\blang=["']?en\b/i);
  assert.match(html, /<title>Denzell(?:'|&#39;|&#x27;|&apos;)s Website<\/title>/i);
  assert.ok(tags('meta').some((tag) => attribute(tag, 'charset')?.toLowerCase() === 'utf-8'));
  assert.match(metadata.get('viewport') ?? '', /width=device-width/);
  assert.equal(attribute(tags('link').find((tag) => attribute(tag, 'rel') === 'canonical') ?? '', 'href'), origin);
  assert.ok((metadata.get('description') ?? '').length >= 30, 'A useful search description is present');

  const expected = {
    'og:type': 'website',
    'og:title': title,
    'og:description': metadata.get('description'),
    'og:url': origin,
    'og:image': profile,
    'og:image:width': '460',
    'og:image:height': '460',
    'twitter:card': 'summary',
    'twitter:title': title,
    'twitter:description': metadata.get('description'),
    'twitter:image': profile,
  };
  for (const [name, value] of Object.entries(expected)) assert.equal(metadata.get(name), value, name);
  assert.ok(metadata.get('og:image:alt'), 'Open Graph image has alternative text');
  assert.ok(metadata.get('twitter:image:alt'), 'Twitter image has alternative text');
});

test('structured data identifies the person and their website', () => {
  const entries = [];
  function collect(value) {
    if (!value || typeof value !== 'object') return;
    if (value['@type']) entries.push(value);
    for (const child of Object.values(value)) collect(child);
  }
  for (const [, tag, contents] of html.matchAll(/(<script\b[^>]*>)([\s\S]*?)<\/script>/gi)) {
    if (attribute(tag, 'type') === 'application/ld+json') collect(JSON.parse(contents));
  }
  for (const type of ['Person', 'WebSite']) {
    const entry = entries.find((value) => [value['@type']].flat().includes(type));
    assert.ok(entry, `${type} structured data is present`);
    assert.equal(entry.url, origin, `${type} URL`);
  }
});

test('published assets exist and the personal profile image is used', () => {
  for (const tag of [...tags('link'), ...tags('script'), ...tags('img')]) {
    const reference = attribute(tag, 'src') ?? attribute(tag, 'href');
    if (!reference || reference.startsWith('#') || /^[a-z][a-z\d+.-]*:|^\/\//i.test(reference)) continue;
    const pathname = new URL(reference, origin).pathname.slice(1);
    assert.ok(existsSync(new URL(pathname, output)), `Missing built asset: ${reference}`);
  }
  assert.ok(tags('img').some((tag) => new URL(attribute(tag, 'src') ?? '', origin).href === profile));
  assert.doesNotMatch(html, /cdn\.tailwindcss\.com/);

  const image = readFileSync(new URL('profile.png', output));
  assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(image.readUInt32BE(16), 460);
  assert.equal(image.readUInt32BE(20), 460);

  for (const path of [
    'music.py',
    'covers__ketamine-5.jpg', 'covers__fetish.png', 'covers__era-of-information.png',
    'covers__doom-mixtape.png', 'covers__black-bastards.jpg', 'covers__athena-feed.png',
    'covers__archangels.png', 'covers__ma-doom-son-of-yvonne.png', 'covers__kiken-na-shintsuu-lp.png',
  ]) assert.ok(existsSync(new URL(path, output)), `Existing public URL is preserved: /${path}`);
});

test('crawler files advertise the canonical site and deployment excludes private files', () => {
  const robots = readFileSync(new URL('robots.txt', output), 'utf8');
  assert.match(robots, /^Sitemap:\s*https:\/\/cdxker\.com\/sitemap-index\.xml\s*$/m);
  assert.match(readFileSync(new URL('sitemap-index.xml', output), 'utf8'), /<loc>https:\/\/cdxker\.com\/sitemap-0\.xml<\/loc>/);
  assert.match(readFileSync(new URL('sitemap-0.xml', output), 'utf8'), /<loc>https:\/\/cdxker\.com\/<\/loc>/);

  for (const path of readdirSync(output, { recursive: true })) {
    assert.doesNotMatch(path, /(?:^|\/)(?:\.env(?:\.[^/]*)?|\.git(?:hub)?|node_modules|src|tests|scripts)(?:\/|$)/, `Private/source path in build: ${path}`);
    assert.doesNotMatch(path, /(?:^|\/)(?:wrangler\.[^/]+|astro\.config\.[^/]+|package(?:-lock)?\.json|README\.md|docs\.json|update\.sh)$/, `Project configuration in build: ${path}`);
  }
});
