import { existsSync, readFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer as createViteServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const OLD_DETAIL_COLUMN_LAYOUT = "gridTemplateColumns: 'minmax(190px, 1fr) minmax(150px, 0.78fr)'";

const viewports = [
  { name: 'stage720p', width: 1280, height: 720 },
  { name: 'fhd', width: 1920, height: 1080 },
  { name: 'uhd', width: 3840, height: 2160 },
];

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message);
}

function assertNotIncludes(source, needle, message) {
  assert(!source.includes(needle), message);
}

function assertOrder(source, before, after, message) {
  const beforeIndex = source.indexOf(before);
  const afterIndex = source.indexOf(after);
  assert(beforeIndex !== -1 && afterIndex !== -1 && beforeIndex < afterIndex, message);
}

function formatRect(rect) {
  return `l=${rect.left},t=${rect.top},r=${rect.right},b=${rect.bottom},w=${rect.width},h=${rect.height}`;
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
  await page.waitForSelector('input:not([type])', { timeout: 5000 });
  await page.locator('input:not([type])').first().fill('DearMasterGuard');
  await page.locator('button').first().click();
  await page.waitForFunction(() => document.querySelectorAll('button').length >= 5, null, { timeout: 5000 });
  await page.locator('button').first().click();
  await page.waitForSelector('input[type="range"]', { timeout: 5000 });
  await page.locator('button').last().click();
  await page.waitForSelector('.main-scene', { timeout: 5000 });
}

async function openEquipTab(page) {
  await page.locator('[data-bwe-other-tab="equip"]').click();
  await page.waitForSelector('[data-bwe-equip-scroll-region]', { timeout: 5000 });
  await page.waitForSelector('[data-bwe-equip-detail-panel]', { timeout: 5000 });
}

async function selectSlot(page, slot) {
  const locator = page.locator(`[data-bwe-equip-slot="${slot}"]`);
  assert(await locator.count() === 1, `Missing equipment slot ${slot}`);
  await locator.click();
  await page.waitForTimeout(100);
}

async function selectFirstEmptySlot(page) {
  const slot = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('[data-bwe-equip-slot]'));
    const emptyButton = buttons.find(button => button.querySelector('[data-bwe-equip-slot-icon="mc_mode"]'));
    return emptyButton?.getAttribute('data-bwe-equip-slot') ?? null;
  });
  assert(slot, 'Expected at least one empty equipment slot in the default smoke state');
  await selectSlot(page, slot);
  return slot;
}

async function collectRects(page, label) {
  return page.evaluate((sampleLabel) => {
    const round = value => Number(value.toFixed(2));
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

    return {
      label: sampleLabel,
      activeTab: document.querySelector('[data-bwe-other-content]')?.getAttribute('data-bwe-other-content-active'),
      otherContent: getRect('[data-bwe-other-content]'),
      tabRail: getRect('[data-bwe-other-tab-rail]'),
      equipScroll: getRect('[data-bwe-equip-scroll-region]'),
      figurePanel: getRect('[data-bwe-equip-figure-panel]'),
      detailPanel: getRect('[data-bwe-equip-detail-panel]'),
    };
  }, label);
}

function assertRectPlacement(metrics) {
  const { otherContent, tabRail, equipScroll, figurePanel, detailPanel, label } = metrics;
  assert(metrics.activeTab === 'equip', `${label}: equip tab must be active`);
  for (const [name, rect] of Object.entries({ otherContent, tabRail, equipScroll, figurePanel, detailPanel })) {
    assert(rect && rect.width > 0 && rect.height > 0, `${label}: ${name} must render with a visible rect`);
  }

  assert(detailPanel.top >= figurePanel.bottom - 1, `${label}: detail panel must sit below the figure panel`);
  assert(detailPanel.left >= equipScroll.left - 1, `${label}: detail panel must stay inside the equip scroll region left edge`);
  assert(detailPanel.right <= equipScroll.right + 1, `${label}: detail panel must stay inside the equip scroll region right edge`);
  assert(equipScroll.left >= otherContent.left - 1, `${label}: equip scroll region must stay inside OtherPanel content left edge`);
  assert(equipScroll.right <= otherContent.right + 1, `${label}: equip scroll region must stay inside OtherPanel content right edge`);
  assert(detailPanel.right <= otherContent.right + 1, `${label}: detail panel must not push past OtherPanel content right edge`);
  assert(otherContent.right <= tabRail.right + 2, `${label}: OtherPanel content must not expand beyond the tab rail`);
}

const packageJson = JSON.parse(read('package.json'));
const equipWindow = read('src/components/windows/EquipWindow.tsx');
const as3EquipWindow = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as');
const as3EquipCell = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iEquip/EquipCell.as');

assert(
  packageJson.scripts?.['assert:equip-window-detail-placement'] === 'node scripts/assertEquipWindowDetailPlacement.mjs',
  'package.json must expose assert:equip-window-detail-placement'
);

assertIncludes(as3EquipWindow, 'new BasicCell(200,540)', 'AS3 EquipWindow must keep the 200x540 equipment window content cell.');
assertIncludes(as3EquipWindow, 'new people_use1()', 'AS3 EquipWindow must place people_use1 in the equipment window.');
assertIncludes(as3EquipWindow, 'new people_use2()', 'AS3 EquipWindow must place people_use2 in the equipment window.');
assertIncludes(as3EquipWindow, 'this.setPetInfo();', 'AS3 EquipWindow must place pet info through setPetInfo().');
assertIncludes(as3EquipCell, 'Global.setItemInfoWindow(this.equip.getDescription())', 'AS3 EquipCell must express equipment detail through the hover info window.');

assertNotIncludes(
  equipWindow,
  OLD_DETAIL_COLUMN_LAYOUT,
  'EquipWindow still uses the old two-column grid that puts data-bwe-equip-detail-panel in the right-side column.'
);
assertIncludes(equipWindow, 'data-bwe-equip-scroll-region', 'EquipWindow must expose the bounded internal scroll region.');
assertIncludes(equipWindow, 'data-bwe-equip-content-column', 'EquipWindow must expose the single vertical content column.');
assertIncludes(equipWindow, 'data-bwe-equip-figure-panel', 'EquipWindow must expose the figure/slot panel for placement smoke.');
assertIncludes(equipWindow, 'data-bwe-equip-guide-line', 'EquipWindow must expose aligned guide lines for the slot layer.');
assertIncludes(equipWindow, 'data-bwe-equip-detail-panel', 'EquipWindow must expose the selected equipment detail panel.');
assertIncludes(equipWindow, 'data-bwe-equip-pet-info', 'EquipWindow must expose the AS3-style active-pet detail block below the figure.');
assertOrder(equipWindow, 'data-bwe-equip-scroll-region', 'data-bwe-equip-content-column', 'EquipWindow content column must live inside the bounded scroll region.');
assertOrder(equipWindow, 'data-bwe-equip-content-column', 'data-bwe-equip-figure-panel', 'EquipWindow figure panel must be first in the vertical flow.');
assertOrder(equipWindow, 'data-bwe-equip-figure-panel', 'data-bwe-equip-detail-panel', 'EquipWindow detail panel must follow the figure panel.');

const { server, url } = await startViteServer();
const browser = await chromium.launch({ headless: true });

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
    await openEquipTab(page);

    await selectSlot(page, 'leftHand');
    const mainHand = await collectRects(page, `${viewport.name}:leftHand`);
    assertRectPlacement(mainHand);

    const emptySlot = await selectFirstEmptySlot(page);
    const empty = await collectRects(page, `${viewport.name}:${emptySlot}`);
    assertRectPlacement(empty);

    const stableTolerance = 2;
    assert(
      Math.abs(mainHand.otherContent.right - empty.otherContent.right) <= stableTolerance &&
        Math.abs(mainHand.otherContent.width - empty.otherContent.width) <= stableTolerance &&
        Math.abs(mainHand.equipScroll.right - empty.equipScroll.right) <= stableTolerance &&
        Math.abs(mainHand.detailPanel.right - empty.detailPanel.right) <= stableTolerance,
      `${viewport.name}: selecting main hand and empty slot must keep right boundaries stable`
    );

    assert(errors.length === 0, `${viewport.name}: console/page errors: ${errors.join(' | ')}`);
    console.log(
      `PASS ${viewport.name}: leftHand detail ${formatRect(mainHand.detailPanel)}; ` +
      `empty(${emptySlot}) detail ${formatRect(empty.detailPanel)}; ` +
      `scroll ${formatRect(empty.equipScroll)}; other ${formatRect(empty.otherContent)}; right boundary stable`
    );

    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}

console.log('EquipWindow detail placement checks passed.');
