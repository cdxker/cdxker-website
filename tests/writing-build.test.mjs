import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const output = new URL('../dist/', import.meta.url);
const samples = ['essays/sample-essay', 'poems/sample-poem'];

for (const path of samples) {
  test(`${path} renders a complete unlisted content page`, () => {
    const html = readFileSync(new URL(`${path}/index.html`, output), 'utf8');
    assert.match(html, /<h1\b[^>]*>[^<]+<\/h1>/);
    assert.match(html, /<article\b[\s\S]*<p\b[\s\S]*<\/article>/);
    assert.match(html, /<meta\s+name="robots"\s+content="noindex, follow"/);
    assert.ok(html.includes(`href="https://cdxker.com/${path}/"`), 'Canonical URL identifies the entry');
    assert.doesNotMatch(html, /<title>Denzell(?:'|&#39;|&#x27;|&apos;)s Website<\/title>/);
    assert.doesNotMatch(html, /draft:|unlisted:|pubDate:/, 'Frontmatter does not leak into the page');
    if (path.startsWith('poems/')) assert.match(html, /<br\s*\/?>/, 'Poem line breaks are preserved');
  });
}

test('unlisted samples are absent from navigation and the sitemap', () => {
  const homepage = readFileSync(new URL('index.html', output), 'utf8');
  const sitemap = readFileSync(new URL('sitemap-0.xml', output), 'utf8');
  for (const path of samples) {
    assert.ok(!homepage.includes(`/${path}`), `${path} is not linked on the homepage`);
    assert.ok(!sitemap.includes(`/${path}`), `${path} is not in the sitemap`);
  }
  for (const collection of ['essays', 'poems']) {
    assert.ok(!existsSync(new URL(`${collection}/index.html`, output)), 'No collection listing exposes the samples');
  }
});
