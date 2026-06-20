import { chromium } from '@playwright/test';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';

const root = process.cwd();
const DESIGN_STAGE_WIDTH = 1280;
const DESIGN_STAGE_HEIGHT = 720;
const MIN_EFFECTIVE_FONT_SIZE = 11;

const viewports = [
  { name: 'stage720p', width: 1280, height: 720 },
  { name: 'stage768p', width: 1366, height: 768 },
  { name: 'fhd', width: 1920, height: 1080 },
  { name: 'qhd', width: 2560, height: 1440 },
  { name: 'uhd', width: 3840, height: 2160 },
];

const sampleTargets = [
  { name: 'other tab/content labels', selector: '.main-scene__other' },
  { name: 'player stat readouts', selector: '.main-scene__player' },
  { name: 'pet/monster info readouts', selector: '.main-scene__battle-top' },
  { name: 'battle skill labels', selector: '.main-scene__battle-bottom' },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function startViteServer() {
  const server = await createViteServer({
    root,
    configFile: path.join(root, 'vite.config.mjs'),
    logLevel: 'error',
    server: {
      host: '127.0.0.1',
      port: 0,
      strictPort: false,
    },
  });

  await server.listen();
  const url = server.resolvedUrls?.local?.find(value => value.includes('127.0.0.1'))
    ?? server.resolvedUrls?.local?.[0];
  assert(url, 'Vite did not expose a local URL');
  return { server, url };
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

async function clickVisibleOtherTab(page, tabIndex) {
  await page.evaluate((index) => {
    const container = document.querySelector('.main-scene__other > div');
    const tabRail = container?.firstElementChild;
    if (!tabRail) throw new Error('Could not find OtherPanel tab rail');

    const layout = document.querySelector('.game-layout');
    const stageScale = layout
      ? Number.parseFloat(getComputedStyle(layout).getPropertyValue('--bwe-stage-scale'))
      : 1;
    const scale = Number.isFinite(stageScale) && stageScale > 0 ? stageScale : 1;
    const arrowButtons = Array.from(tabRail.querySelectorAll('button'))
      .filter((button) => {
        const rect = button.getBoundingClientRect();
        return rect.width > 0
          && rect.width <= 30 * scale
          && rect.height >= 35 * scale
          && rect.height <= 45 * scale;
      })
      .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    const leftArrow = arrowButtons[0];
    const rightArrow = arrowButtons[arrowButtons.length - 1];
    if (!leftArrow || !rightArrow) throw new Error('Could not find OtherPanel tab arrows');

    const tabClipLeft = leftArrow.getBoundingClientRect().right;
    const tabClipRight = rightArrow.getBoundingClientRect().left;
    const buttons = Array.from(tabRail.querySelectorAll('button'))
      .filter((button) => {
        const rect = button.getBoundingClientRect();
        const style = getComputedStyle(button);
        const intersectsTabClip = rect.right > tabClipLeft + 1 && rect.left < tabClipRight - 1;
        return rect.width >= 35 * scale
          && rect.width <= 45 * scale
          && rect.height >= 35 * scale
          && rect.height <= 45 * scale
          && intersectsTabClip
          && style.visibility !== 'hidden'
          && style.display !== 'none'
          && !button.disabled;
      })
      .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);

    const target = buttons[index];
    if (!target) {
      throw new Error(`Could not find visible OtherPanel tab at index ${index}`);
    }
    target.click();
  }, tabIndex);
}

async function scrollOtherTabsRight(page, count) {
  for (let index = 0; index < count; index += 1) {
    await page.evaluate(() => {
      const container = document.querySelector('.main-scene__other > div');
      const tabRail = container?.firstElementChild;
      if (!tabRail) throw new Error('Could not find OtherPanel tab rail');

      const layout = document.querySelector('.game-layout');
      const stageScale = layout
        ? Number.parseFloat(getComputedStyle(layout).getPropertyValue('--bwe-stage-scale'))
        : 1;
      const scale = Number.isFinite(stageScale) && stageScale > 0 ? stageScale : 1;
      const railRect = tabRail.getBoundingClientRect();
      const buttons = Array.from(tabRail.querySelectorAll('button'))
        .filter((button) => {
          const rect = button.getBoundingClientRect();
          const style = getComputedStyle(button);
          const intersectsRail = rect.right > railRect.left + 1 && rect.left < railRect.right - 1;
          return rect.width > 0
            && rect.width <= 30 * scale
            && rect.height >= 35 * scale
            && rect.height <= 45 * scale
            && intersectsRail
            && style.visibility !== 'hidden'
            && style.display !== 'none'
            && !button.disabled;
        })
        .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);

      const rightArrow = buttons[buttons.length - 1];
      if (!rightArrow) {
        throw new Error('Could not find enabled OtherPanel right scroll button');
      }
      rightArrow.click();
    });
    await page.waitForTimeout(420);
  }
}

async function openEquipTab(page) {
  await clickVisibleOtherTab(page, 1);
  await page.waitForSelector('[data-bwe-equip-scroll-region]', { timeout: 5000 });
}

async function openShopOverlay(page) {
  await scrollOtherTabsRight(page, 3);
  await clickVisibleOtherTab(page, 3);
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('[data-bwe-other-button-icon="button_shop"]'))
      .some((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0
          && rect.height > 0
          && style.visibility !== 'hidden'
          && style.display !== 'none';
      });
  }, null, { timeout: 5000 });
  await page.evaluate(() => {
    const element = Array.from(document.querySelectorAll('[data-bwe-other-button-icon="button_shop"]'))
      .find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        const style = getComputedStyle(candidate);
        return rect.width > 0
          && rect.height > 0
          && style.visibility !== 'hidden'
          && style.display !== 'none';
      });
    if (!element) throw new Error('Could not find a visible shop button icon');
    const button = element.closest('button');
    if (!button) throw new Error('Shop icon is not inside a button');
    button.click();
  });
  await page.waitForSelector('.main-scene__overlay-panel', { timeout: 5000 });
}

async function collectMetrics(page, viewport) {
  const metrics = await page.evaluate(({ targets, minEffectiveFontSize }) => {
    const round = (value) => Number(value.toFixed(2));
    const getRect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        selector,
        left: round(rect.left),
        top: round(rect.top),
        right: round(rect.right),
        bottom: round(rect.bottom),
        width: round(rect.width),
        height: round(rect.height),
      };
    };
    const hasOwnText = (element) => Array.from(element.childNodes)
      .some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0
        && rect.height > 0
        && style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number.parseFloat(style.opacity || '1') > 0.01;
    };
    const minFontIn = (target) => {
      const rootElement = document.querySelector(target.selector);
      if (!rootElement) {
        return {
          ...target,
          found: false,
          fontSize: 0,
          effectiveFontSize: 0,
          text: '',
        };
      }

      const candidates = Array.from(rootElement.querySelectorAll('*'))
        .filter(element => hasOwnText(element) && isVisible(element))
        .map((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          const fontSize = Number.parseFloat(style.fontSize);
          return {
            text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 32),
            fontSize,
            rect: {
              width: round(rect.width),
              height: round(rect.height),
            },
          };
        })
        .filter(entry => Number.isFinite(entry.fontSize) && entry.fontSize > 0)
        .sort((a, b) => a.fontSize - b.fontSize);

      const smallest = candidates[0];
      if (!smallest) {
        return {
          ...target,
          found: false,
          fontSize: 0,
          effectiveFontSize: 0,
          text: '',
        };
      }

      return {
        ...target,
        found: true,
        fontSize: round(smallest.fontSize),
        effectiveFontSize: round(smallest.fontSize * window.__bweStageScale),
        text: smallest.text,
        rect: smallest.rect,
        passes: smallest.fontSize * window.__bweStageScale >= minEffectiveFontSize,
      };
    };
    const overlapArea = (a, b) => {
      if (!a || !b) return 0;
      const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return round(width * height);
    };

    const layout = document.querySelector('.game-layout');
    const stageScale = layout
      ? Number.parseFloat(getComputedStyle(layout).getPropertyValue('--bwe-stage-scale'))
      : Number.NaN;
    window.__bweStageScale = stageScale;

    const regionRects = [
      getRect('.main-scene__player'),
      getRect('.main-scene__battle'),
      getRect('.main-scene__other'),
      getRect('.main-scene__log'),
    ];
    const overlaps = [];
    for (let left = 0; left < regionRects.length; left += 1) {
      for (let right = left + 1; right < regionRects.length; right += 1) {
        const area = overlapArea(regionRects[left], regionRects[right]);
        if (area > 1) {
          overlaps.push(`${regionRects[left].selector}/${regionRects[right].selector}:${area}`);
        }
      }
    }

    return {
      stageScale,
      samples: targets.map(minFontIn),
      overlaps,
      shell: getRect('.game-shell'),
      scene: getRect('.main-scene'),
    };
  }, { targets: sampleTargets, minEffectiveFontSize: MIN_EFFECTIVE_FONT_SIZE });

  await openEquipTab(page);
  const equipSample = await page.evaluate(({ minEffectiveFontSize }) => {
    const round = (value) => Number(value.toFixed(2));
    const rootElement = document.querySelector('[data-bwe-equip-scroll-region]');
    const candidates = Array.from(rootElement?.querySelectorAll('*') ?? [])
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const hasText = Array.from(element.childNodes)
          .some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
        return hasText
          && rect.width > 0
          && rect.height > 0
          && style.display !== 'none'
          && style.visibility !== 'hidden';
      })
      .map((element) => {
        const style = getComputedStyle(element);
        return {
          text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 32),
          fontSize: Number.parseFloat(style.fontSize),
        };
      })
      .filter(entry => Number.isFinite(entry.fontSize) && entry.fontSize > 0)
      .sort((a, b) => a.fontSize - b.fontSize);
    const smallest = candidates[0];
    const stageScale = window.__bweStageScale;
    return {
      name: 'equipment detail/readouts',
      selector: '[data-bwe-equip-scroll-region]',
      found: Boolean(smallest),
      fontSize: smallest ? round(smallest.fontSize) : 0,
      effectiveFontSize: smallest ? round(smallest.fontSize * stageScale) : 0,
      text: smallest?.text ?? '',
      passes: smallest ? smallest.fontSize * stageScale >= minEffectiveFontSize : false,
    };
  }, { minEffectiveFontSize: MIN_EFFECTIVE_FONT_SIZE });

  await openShopOverlay(page);
  const shopSample = await page.evaluate(({ minEffectiveFontSize }) => {
    const round = (value) => Number(value.toFixed(2));
    const rootElement = document.querySelector('.main-scene__overlay-panel');
    const candidates = Array.from(rootElement?.querySelectorAll('*') ?? [])
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const hasText = Array.from(element.childNodes)
          .some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
        return hasText
          && rect.width > 0
          && rect.height > 0
          && style.display !== 'none'
          && style.visibility !== 'hidden';
      })
      .map((element) => {
        const style = getComputedStyle(element);
        return {
          text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 32),
          fontSize: Number.parseFloat(style.fontSize),
        };
      })
      .filter(entry => Number.isFinite(entry.fontSize) && entry.fontSize > 0)
      .sort((a, b) => a.fontSize - b.fontSize);
    const smallest = candidates[0];
    const stageScale = window.__bweStageScale;
    return {
      name: 'shop row/price readouts',
      selector: '.main-scene__overlay-panel',
      found: Boolean(smallest),
      fontSize: smallest ? round(smallest.fontSize) : 0,
      effectiveFontSize: smallest ? round(smallest.fontSize * stageScale) : 0,
      text: smallest?.text ?? '',
      passes: smallest ? smallest.fontSize * stageScale >= minEffectiveFontSize : false,
    };
  }, { minEffectiveFontSize: MIN_EFFECTIVE_FONT_SIZE });

  const expectedScale = Math.min(
    viewport.width / DESIGN_STAGE_WIDTH,
    viewport.height / DESIGN_STAGE_HEIGHT,
  );

  return {
    ...metrics,
    expectedScale,
    samples: [...metrics.samples, equipSample, shopSample],
  };
}

const { server, url } = await startViteServer();
const browser = await chromium.launch({ headless: true });
let failed = false;

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', error => errors.push(error.message));

    await page.goto(url, { waitUntil: 'networkidle' });
    await enterMainScene(page);

    const metrics = await collectMetrics(page, viewport);
    const failingSamples = metrics.samples.filter(sample => !sample.found || !sample.passes);
    const fontSummary = metrics.samples
      .map(sample => `${sample.name} ${sample.effectiveFontSize}px (${sample.fontSize}px base)`)
      .join('; ');

    const scalePasses = Number.isFinite(metrics.stageScale)
      && Math.abs(metrics.stageScale - metrics.expectedScale) <= 0.03;
    const overlapsPass = metrics.overlaps.length === 0;
    const pagePasses = errors.length === 0 && scalePasses && overlapsPass && failingSamples.length === 0;

    if (!pagePasses) failed = true;

    const prefix = pagePasses ? 'PASS' : 'FAIL';
    console.log(
      `${prefix} ${viewport.name}: ${viewport.width}x${viewport.height}, ` +
      `scale ${metrics.stageScale}, fonts ${fontSummary}, ` +
      `overlaps ${metrics.overlaps.length ? metrics.overlaps.join(' | ') : 'none'}`,
    );

    if (errors.length) {
      console.error(`  console/page errors: ${errors.join(' | ')}`);
    }
    if (!scalePasses) {
      console.error(`  expected scale ${metrics.expectedScale.toFixed(4)}, got ${metrics.stageScale}`);
    }
    if (failingSamples.length) {
      for (const sample of failingSamples) {
        console.error(
          `  ${sample.name} below ${MIN_EFFECTIVE_FONT_SIZE}px effective font: ` +
          `${sample.effectiveFontSize}px from "${sample.text}" (${sample.selector})`,
        );
      }
    }

    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}

if (failed) {
  process.exit(1);
}
