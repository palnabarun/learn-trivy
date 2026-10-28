// These are rendering and event-logic tests with a minimal DOM adapter.
// They do not substitute for the real browser tests or visual inspection.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { lessons } from '../site/content.mjs';

const root = new URL('../', import.meta.url);
const source = ['site/deep-dives.mjs', 'site/architecture.mjs', 'site/content.mjs', 'site/app.mjs']
  .map(path => readFileSync(new URL(path, root), 'utf8').replace(/^export /gm, '').replace(/^import .*;\n/gm, '')).join('\n');

function harness(hash = '#/', saved = {}, storageDisabled = false, darkPreference = false) {
  const elements = new Map();
  const listeners = new Map();
  const storage = new Map(Object.entries(saved));
  let copied = '';
  const classes = () => ({ add() {}, remove() {}, toggle() {}, contains: () => false });
  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, {
      innerHTML: '', textContent: '', dataset: {}, value: '', open: false,
      classList: classes(), focus() {}, scrollIntoView() {}, setAttribute() {},
      showModal() { this.open = true; }, close() { this.open = false; },
      addEventListener() {}, querySelectorAll() { return []; },
    });
    return elements.get(selector);
  }
  const document = {
    documentElement: { dataset: {} }, body: { classList: classes() },
    querySelector: element, querySelectorAll: () => [], getElementById: id => element(`#${id}`),
    addEventListener: (name, fn) => listeners.set(name, fn),
  };
  const location = { hash };
  const context = createContext({
    document, location, URL, console,
    matchMedia: () => ({ matches: darkPreference }),
    window: { scrollY: 0, scrollTo() {}, addEventListener: (name, fn) => listeners.set(name, fn) },
    navigator: { clipboard: { writeText: async text => { copied = text; } } },
    localStorage: { getItem: key => { if (storageDisabled) throw Error('Disabled'); return storage.get(key) ?? null; }, setItem: (key, value) => { if (storageDisabled) throw Error('Disabled'); storage.set(key, value); } },
    requestAnimationFrame: fn => fn(), setTimeout: () => 1, clearTimeout() {},
  });
  runInContext(source, context);
  return {
    html: () => element('#app').innerHTML, element, storage, context,
    navigate: hash => { location.hash = hash; listeners.get('hashchange')({}); },
    click: async dataset => {
      const target = { dataset, innerHTML: '', hasAttribute: key => key === 'data-search-result' && dataset.searchResult !== undefined, setAttribute() {}, focus() {} };
      await listeners.get('click')({ target: { closest: () => target }, preventDefault() {} });
      return target;
    },
    input: (id, value) => listeners.get('input')({ target: { id, value } }),
    copied: () => copied,
  };
}

test('every public route renders its content and active navigation', () => {
  const h = harness();
  assert.match(h.html(), /Understand the scan/);
  for (const lesson of lessons) {
    h.navigate(`#/${lesson.id}`);
    assert.ok(h.html().includes(`<h1>${lesson.title}</h1>`), lesson.id);
    assert.ok(h.html().includes('aria-current="page"'), lesson.id);
    assert.ok(!h.html().includes('undefined'), lesson.id);
  }
  h.navigate('#/glossary'); assert.match(h.html(), /A shared vocabulary/);
  h.navigate('#/sources'); assert.match(h.html(), /A field guide, with roots/);
  h.navigate('#/__proto__'); assert.match(h.html(), /not in the guide/);
  h.navigate('#/<script>'); assert.ok(!h.html().includes('<script>'));
});

test('malformed or unavailable browser storage does not prevent reading', () => {
  for (const stored of ['not json', '{}', '42', 'null', '["scanner", "unknown", "__proto__"]']) {
    assert.match(harness('#/', { 'trivy-completed': stored }).html(), /Understand the scan/);
  }
  assert.match(harness('#/', {}, true).html(), /Understand the scan/);
});

test('map tabs and selections display the relevant component information', async () => {
  const h = harness();
  await h.click({ component: 'java-db' });
  assert.match(h.element('#map-container').innerHTML, /Which Java package/);
  await h.click({ mapMode: 'image' });
  assert.match(h.element('#map-container').innerHTML, /Image vulnerability scanning/);
  await h.click({ mapMode: 'kubernetes' });
  assert.match(h.element('#map-container').innerHTML, /node collection use different inputs/);
});

test('walkthrough steps, answer feedback, and clipboard keep their lesson context', async () => {
  const h = harness('#/image-scan');
  await h.click({ step: '4' });
  assert.match(h.element('#flow-container').innerHTML, /STEP 5 OF 5/);
  assert.match(h.element('#flow-container').innerHTML, /Filter and report/);
  const lesson = lessons.find(l => l.id === 'image-scan');
  await h.click({ answer: String((lesson.quiz.answer + 1) % lesson.quiz.options.length) });
  assert.match(h.element('#quiz-container').innerHTML, /Try another answer/);
  await h.click({ answer: String(lesson.quiz.answer) });
  assert.match(h.element('#quiz-container').innerHTML, /That is right/);
  await h.click({ copy: '0' });
  assert.equal(h.copied(), lesson.sections.find(s => s.code).code.text);
});

test('completion and theme persist, and reset removes only progress', async () => {
  const h = harness('#/scanner');
  await h.click({ action: 'complete' });
  assert.deepEqual(JSON.parse(h.storage.get('trivy-completed')), ['scanner']);
  assert.match(h.html(), /Completed · undo/);
  await h.click({ action: 'theme' });
  assert.equal(JSON.parse(h.storage.get('trivy-theme')), 'dark');
  await h.click({ action: 'reset-progress' });
  assert.deepEqual(JSON.parse(h.storage.get('trivy-completed')), []);
  assert.equal(JSON.parse(h.storage.get('trivy-theme')), 'dark');
});

test('first paint and app agree on the system theme, saved override, and unavailable storage', async () => {
  const html = readFileSync(new URL('site/index.html', root), 'utf8');
  const bootScript = html.match(/<script id="theme-init">([\s\S]*?)<\/script>/)[1];
  assert.ok(html.indexOf('id="theme-init"') < html.indexOf('rel="stylesheet"'));
  for (const [darkPreference, saved, storageDisabled, expected] of [
    [true, undefined, false, 'dark'],
    [false, undefined, false, 'light'],
    [true, '"light"', false, 'light'],
    [false, '"dark"', false, 'dark'],
    [true, 'not json', false, 'dark'],
    [true, '"unknown"', false, 'dark'],
    [true, '"light"', true, 'dark'],
  ]) {
    const h = harness('#/', saved === undefined ? {} : { 'trivy-theme': saved }, storageDisabled, darkPreference);
    assert.equal(h.context.document.documentElement.dataset.theme, expected);
    h.context.document.documentElement.dataset.theme = '';
    runInContext(bootScript, h.context);
    assert.equal(h.context.document.documentElement.dataset.theme, expected);
    assert.equal(h.element('meta[name="theme-color"]').content, expected === 'dark' ? '#101820' : '#f6f8fb');
    await h.click({ action: 'theme' });
    const selected = expected === 'dark' ? 'light' : 'dark';
    assert.equal(h.context.document.documentElement.dataset.theme, selected);
    if (!storageDisabled) {
      const reload = harness('#/', Object.fromEntries(h.storage), false, !darkPreference);
      assert.equal(reload.context.document.documentElement.dataset.theme, selected);
    }
  }
});

test('full-text search and glossary filtering use lesson and definition content', async () => {
  const h = harness();
  await h.click({ action: 'search' });
  assert.equal(h.element('#search-dialog').open, true);
  h.input('global-search', 'archive');
  assert.match(h.element('#search-results').innerHTML, /trivy-java-db/);
  h.input('global-search', '<script>');
  assert.match(h.element('#search-results').innerHTML, /No matching lessons/);
  assert.ok(!h.element('#search-results').innerHTML.includes('<script>'));
  h.input('glossary-filter', 'Reconciliation');
  assert.match(h.element('#glossary-terms').innerHTML, /observed state toward desired state/);
  assert.ok(!h.element('#glossary-terms').innerHTML.includes('<h2>CVE</h2>'));
});
