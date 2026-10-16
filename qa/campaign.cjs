const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const out = path.join(__dirname, 'evidence');
const base = process.env.QA_URL || 'http://127.0.0.1:8766/';
const viewports = [[375, 812], [390, 844], [430, 900], [768, 1024], [1280, 720], [1440, 900], [1728, 900], [2560, 1080]];
const result = { testedAt: new Date().toISOString(), matrix: [], errors: [] };

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  result.browserVersion = browser.version();
  try {
    for (const [width, height] of viewports) {
      const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'no-preference' });
      const page = await ctx.newPage();
      page.on('pageerror', error => result.errors.push({ width, message: error.message }));
      for (const file of ['index.html', 'story.html', 'journal.html']) {
        await page.goto(base + file, { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => document.fonts.ready);
        const heading = await page.locator('h1').boundingBox();
        assert.ok(heading && heading.y >= 0 && heading.y + heading.height <= height, `${file} ${width}: brand/title in first viewport`);
        if (file === 'index.html') {
          const collection = await page.locator('#collection-title').boundingBox();
          assert.ok(collection.y < height - 8, `${width}: collection visible below hero`);
          await page.waitForFunction(() => !document.querySelector('video').paused);
          await page.locator('.hero-motion-toggle').click();
          assert.ok(await page.locator('video').evaluate(video => video.paused), 'Hero pauses on request');
        }
        await page.evaluate(async () => {
          document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
          await Promise.all([...document.images].map(image => image.decode()));
        });
        for (const element of await page.locator('[data-reveal]').all()) {
          await element.scrollIntoViewIfNeeded();
          await page.waitForFunction(element => element.classList.contains('is-visible'), await element.elementHandle());
        }
        await page.waitForFunction(() => [...document.querySelectorAll('[data-reveal]')].every(element => getComputedStyle(element).opacity === '1'));
        const metrics = await page.evaluate(() => ({
          width: document.documentElement.scrollWidth,
          images: [...document.images].every(image => image.naturalWidth > 0),
          clipped: [...document.querySelectorAll('h1,h2,h3,button,select')].filter(element => element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 2).map(element => element.tagName + '.' + element.className)
        }));
        assert.equal(metrics.width, width, `${file} ${width}: no horizontal overflow`);
        assert.ok(metrics.images, `${file} ${width}: all images decoded`);
        assert.deepEqual(metrics.clipped, [], `${file} ${width}: headings and controls fit`);
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        if ([375, 1440].includes(width)) {
          const name = `campaign-${file.replace('.html', '')}-${width}`;
          await page.screenshot({ path: path.join(out, name + '.png') });
          await page.screenshot({ path: path.join(out, name + '-full.png'), fullPage: true });
        }
        result.matrix.push({ file, width, height, images: 'decoded', reveals: 'visible', firstViewport: 'passed', overflow: false });
      }
      await ctx.close();
    }
    const sources = fs.readdirSync(root).filter(file => /\.(html|css|js|json|xml)$/.test(file)).concat('robots.txt');
    const hashes = Object.fromEntries(sources.sort().map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')]));
    fs.writeFileSync(path.join(out, 'source-hashes.json'), JSON.stringify(hashes, null, 2) + '\n');
  } catch (error) {
    result.errors.push({ message: error.message, stack: error.stack });
    process.exitCode = 1;
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(out, 'campaign-results.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ matrix: result.matrix.length, errors: result.errors }, null, 2));
  }
})();
