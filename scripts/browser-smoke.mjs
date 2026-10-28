// Optional browser tests. Install Playwright separately, or point
// PLAYWRIGHT_MODULE to an existing Playwright module.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lessons } from '../site/content.mjs';

const modulePath = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright');
const root = new URL('../', import.meta.url);
const output = new URL('test-results/', root);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}),
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('dist/learn-trivy.html', root).href);
  await page.locator('h1').filter({ hasText: 'Understand the scan' }).waitFor();
  await page.screenshot({ path: fileURLToPath(new URL('overview-desktop.png', output)), fullPage: true });
  await page.locator('[data-component="java-db"]').click();
  assert.match(await page.locator('.map-inspector').innerText(), /Which Java package/);
  await page.locator('[data-map-mode="kubernetes"]').click();
  assert.equal(await page.locator('[data-component="node-collector"]').count(), 1);
  await page.locator('.sidebar-search').click();
  await page.locator('#global-search').fill('Java');
  await page.locator('[data-search-result]').first().click();
  await page.locator('h1').filter({ hasText: 'trivy-java-db' }).waitFor();
  for (const lesson of lessons) {
    await page.evaluate(id => { location.hash = `#/${id}`; }, lesson.id);
    await page.locator('h1').filter({ hasText: lesson.title }).waitFor();
    assert.equal(await page.locator('.lesson-section').count(), lesson.sections.length);
  }
  await page.evaluate(() => { location.hash = '#/image-scan'; });
  const imageLesson = lessons.find(lesson => lesson.id === 'image-scan');
  await page.locator('[data-step="3"].flow-stop').click();
  assert.ok((await page.locator('.flow-detail').innerText()).includes(imageLesson.flow[3].title));
  await page.locator(`[data-answer="${imageLesson.quiz.answer}"]`).click();
  assert.match(await page.locator('.quiz-feedback').innerText(), /That is right/);
  await page.locator('[data-action="complete"]').click();
  await page.reload();
  assert.match(await page.locator('[data-action="complete"]').innerText(), /Completed/);
  await page.locator('[data-action="theme"]').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.screenshot({ path: fileURLToPath(new URL('lesson-dark.png', output)), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { location.hash = '#/'; });
  await page.locator('h1').filter({ hasText: 'Understand the scan' }).waitFor();
  await page.locator('[data-action="theme"]').click();
  const dimensions = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth }));
  assert.ok(dimensions.content <= dimensions.width, `Page overflow: ${JSON.stringify(dimensions)}`);
  await page.locator('[data-action="menu"]').click();
  await page.locator('.nav-link[href="#/config-lab"]').click();
  await page.locator('h1').filter({ hasText: 'Lab 02' }).waitFor();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.download-link').first().click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'privileged-pod.yaml');
  await page.evaluate(() => { location.hash = '#/'; });
  await page.locator('h1').filter({ hasText: 'Understand the scan' }).waitFor();
  await page.screenshot({ path: fileURLToPath(new URL('overview-mobile.png', output)), fullPage: true });
  assert.deepEqual(errors, []);
  console.log('Browser smoke tests passed. Screenshots are in test-results/.');
} finally {
  await browser.close();
}
