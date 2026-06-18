import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const distDir = join(root, 'dist');
const indexFile = join(distDir, 'index.html');
const DESIGN_STAGE_WIDTH = 1280;
const DESIGN_STAGE_HEIGHT = 720;

const viewports = [
  { name: 'stage720p', width: 1280, height: 720 },
  { name: 'fhd', width: 1920, height: 1080 },
  { name: 'qhd', width: 2560, height: 1440 },
  { name: 'uhd', width: 3840, height: 2160 },
];

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.json', 'application/json; charset=utf-8'],
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function serveDist() {
  assert(existsSync(indexFile), 'Missing dist/index.html. Run `npm run build` before smoke:responsive-layout.');

  const server = createServer((req, res) => {
    const rawUrl = new URL(req.url ?? '/', 'http://127.0.0.1');
    const pathname = decodeURIComponent(rawUrl.pathname);
    const requested = pathname === '/' ? indexFile : join(distDir, pathname);
    const filePath = normalize(requested);

    if (!filePath.startsWith(normalize(distDir))) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const target = existsSync(filePath) ? filePath : indexFile;
    const type = mimeTypes.get(extname(target)) ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(readFileSync(target));
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}/` });
    });
  });
}

async function enterMainScene(page) {
  if (await page.locator('.main-scene').count()) return;

  await page.locator('button').first().click();
  await page.waitForFunction(() => document.querySelectorAll('button').length >= 5, null, { timeout: 5000 });
  await page.locator('button').first().click();
  await page.waitForSelector('input[type="range"]', { timeout: 5000 });
  await page.locator('button').last().click();
  await page.waitForSelector('.main-scene', { timeout: 5000 });
}

function rectIsVisible(rect) {
  return rect && rect.width > 0 && rect.height > 0;
}

function nearlyEqual(actual, expected, tolerance = 3) {
  return Math.abs(actual - expected) <= tolerance;
}

const { server, url } = await serveDist();
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(url, { waitUntil: 'networkidle' });
    await enterMainScene(page);

    const metrics = await page.evaluate(() => {
      const getRect = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return {
          width: Number(rect.width.toFixed(2)),
          height: Number(rect.height.toFixed(2)),
          display: style.display,
          fontSize: Number.parseFloat(style.fontSize),
        };
      };
      const layout = document.querySelector('.game-layout');
      const stageScale = layout
        ? Number.parseFloat(getComputedStyle(layout).getPropertyValue('--bwe-stage-scale'))
        : Number.NaN;
      const log = getRect('.battle-log-panel');

      return {
        viewport: {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        },
        stageScale,
        frame: getRect('.game-stage-frame'),
        shell: getRect('.game-shell'),
        scene: getRect('.main-scene'),
        player: getRect('.main-scene__player'),
        battle: getRect('.main-scene__battle'),
        other: getRect('.main-scene__other'),
        logRegion: getRect('.main-scene__log'),
        log,
        effectiveLogFontSize: log ? Number((log.fontSize * stageScale).toFixed(2)) : 0,
        visibleTextLength: document.body.innerText.trim().length,
      };
    });

    const expectedScale = Math.min(
      viewport.width / DESIGN_STAGE_WIDTH,
      viewport.height / DESIGN_STAGE_HEIGHT
    );

    assert(errors.length === 0, `${viewport.name} has console/page errors: ${errors.join(' | ')}`);
    assert(
      Number.isFinite(metrics.stageScale) && Math.abs(metrics.stageScale - expectedScale) <= 0.03,
      `${viewport.name} exposes expected stage scale ${expectedScale.toFixed(2)}, got ${metrics.stageScale}`
    );
    assert(rectIsVisible(metrics.frame), `${viewport.name} renders the stage frame`);
    assert(rectIsVisible(metrics.shell), `${viewport.name} renders the game shell`);
    assert(rectIsVisible(metrics.scene), `${viewport.name} renders the main scene`);
    assert(
      nearlyEqual(metrics.shell.width, DESIGN_STAGE_WIDTH * metrics.stageScale) &&
        nearlyEqual(metrics.shell.height, DESIGN_STAGE_HEIGHT * metrics.stageScale),
      `${viewport.name} scales the shell from the fixed 1280x720 stage`
    );
    assert(
      nearlyEqual(metrics.scene.width, metrics.shell.width, 3 + metrics.stageScale * 2) &&
        nearlyEqual(metrics.scene.height, metrics.shell.height, 3 + metrics.stageScale * 2),
      `${viewport.name} keeps the main scene aligned with the scaled shell`
    );
    assert(rectIsVisible(metrics.player), `${viewport.name} renders player region`);
    assert(rectIsVisible(metrics.battle), `${viewport.name} renders battle region`);
    assert(rectIsVisible(metrics.other), `${viewport.name} renders function window region`);
    assert(rectIsVisible(metrics.logRegion), `${viewport.name} renders log region`);
    assert(metrics.visibleTextLength > 20, `${viewport.name} renders non-empty game UI text`);
    assert(
      metrics.effectiveLogFontSize >= 12 * metrics.stageScale - 0.5,
      `${viewport.name} effectively scales the 12px battle-log text to ${metrics.effectiveLogFontSize}px`
    );

    console.log(
      `PASS ${viewport.name}: ${metrics.viewport.width}x${metrics.viewport.height}, ` +
      `scale ${metrics.stageScale}, ` +
      `shell ${Math.round(metrics.shell.width)}x${Math.round(metrics.shell.height)}, ` +
      `effective log font ${metrics.effectiveLogFontSize}px`
    );

    await page.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
