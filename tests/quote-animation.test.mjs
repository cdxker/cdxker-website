import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const script = readFileSync(new URL('../src/scripts/quotes.js', import.meta.url), 'utf8');
const quotes = [
  { top: 'make software', bottom: 'be happy.' },
  { top: 'just make software', bottom: 'life will make sense.' },
  { top: 'make what you want', bottom: 'be a picky user.' },
];

function createPage(minimumTimeout = 0) {
  const top = { textContent: quotes[0].top };
  const bottom = { textContent: quotes[0].bottom };
  const timers = new Map();
  let now = 0;
  let nextId = 0;
  let rotation = 0;
  let selected = quotes[0];

  function schedule(callback, delay, interval = false) {
    const id = ++nextId;
    const wait = interval ? delay : Math.max(delay, minimumTimeout);
    timers.set(id, { callback, at: now + wait, interval, delay });
    return id;
  }

  const math = Object.create(Math);
  math.random = () => {
    const index = rotation++ % quotes.length;
    selected = quotes[index];
    return (index + 0.5) / quotes.length;
  };

  const context = vm.createContext({
    document: {
      querySelector: (selector) => selector === '.top-quote' ? top : bottom,
    },
    Math: math,
    setTimeout: (callback, delay) => schedule(callback, delay),
    clearTimeout: (id) => timers.delete(id),
    setInterval: (callback, delay) => schedule(callback, delay, true),
    clearInterval: (id) => timers.delete(id),
  });
  vm.runInContext(script, context);

  return {
    top,
    bottom,
    animate: (element, text) => context.animateText(element, text),
    assertClean() {
      assert.ok(selected.top.startsWith(top.textContent),
        `Top quote ${JSON.stringify(top.textContent)} is not a prefix of ${JSON.stringify(selected.top)}`);
      assert.ok(selected.bottom.startsWith(bottom.textContent),
        `Bottom quote ${JSON.stringify(bottom.textContent)} is not a prefix of ${JSON.stringify(selected.bottom)}`);
    },
    advance(milliseconds, inspect = () => {}) {
      const end = now + milliseconds;
      for (;;) {
        const next = [...timers].sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!next || next[1].at > end) break;
        const [id, timer] = next;
        now = timer.at;
        if (timer.interval) timer.at += timer.delay;
        else timers.delete(id);
        timer.callback();
        inspect();
      }
      now = end;
    },
  };
}

test('normal rotations type each selected quote cleanly and finish', () => {
  const page = createPage();
  for (let index = 0; index < quotes.length; index++) {
    page.advance(index === 0 ? 5500 : 3500, () => page.assertClean());
    assert.equal(page.top.textContent, quotes[index].top);
    assert.equal(page.bottom.textContent, quotes[index].bottom);
  }
});

test('throttled background timers never mix old and newly selected quotes', () => {
  // Background throttling can stretch one animation across multiple rotations.
  const page = createPage(1000);
  page.advance(18000, () => page.assertClean());
});

test('rapid replacements finish with the latest text and stay unchanged', () => {
  const page = createPage();
  page.animate(page.top, 'alpha');
  page.advance(50);
  page.animate(page.top, 'bravo');
  page.animate(page.top, 'charlie');

  page.advance(1000, () => {
    assert.ok('charlie'.startsWith(page.top.textContent),
      `A replaced animation corrupted the latest text: ${JSON.stringify(page.top.textContent)}`);
  });
  assert.equal(page.top.textContent, 'charlie');
  page.advance(1000);
  assert.equal(page.top.textContent, 'charlie');
});
