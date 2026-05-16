import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const distDir = join(root, 'dist');
const indexFile = join(distDir, 'index.html');

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 820, height: 720 },
  { name: 'mobilePortrait', width: 390, height: 844 },
  { name: 'mobileLandscape', width: 844, height: 390 },
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
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          display: getComputedStyle(el).display,
        };
      };

      return {
        viewport: {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        },
        shell: getRect('.game-shell'),
        scene: getRect('.main-scene'),
        player: getRect('.main-scene__player'),
        battle: getRect('.main-scene__battle'),
        other: getRect('.main-scene__other'),
        log: getRect('.main-scene__log'),
        visibleTextLength: document.body.innerText.trim().length,
      };
    });

    assert(errors.length === 0, `${viewport.name} has console/page errors: ${errors.join(' | ')}`);
    assert(rectIsVisible(metrics.shell), `${viewport.name} renders the game shell`);
    assert(rectIsVisible(metrics.scene), `${viewport.name} renders the main scene`);
    assert(rectIsVisible(metrics.player), `${viewport.name} renders player region`);
    assert(rectIsVisible(metrics.battle), `${viewport.name} renders battle region`);
    assert(rectIsVisible(metrics.other), `${viewport.name} renders function window region`);
    assert(
      viewport.name === 'mobileLandscape' || rectIsVisible(metrics.log),
      `${viewport.name} renders log region when the layout has vertical room`
    );
    assert(metrics.visibleTextLength > 20, `${viewport.name} renders non-empty game UI text`);

    console.log(
      `PASS ${viewport.name}: ${metrics.viewport.width}x${metrics.viewport.height}, ` +
      `shell ${metrics.shell.width}x${metrics.shell.height}, ` +
      `scene ${metrics.scene.width}x${metrics.scene.height}`
    );

    await page.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
