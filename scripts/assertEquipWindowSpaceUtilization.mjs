import { existsSync, readFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer as createViteServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));

const slotNames = ['head', 'feet', 'body', 'necklace', 'ring', 'leftHand', 'rightHand'];
const viewports = [
  { name: 'stage720p', width: 1280, height: 720 },
  { name: 'fhd', width: 1920, height: 1080 },
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

function assertMatches(source, pattern, message) {
  assert(pattern.test(source), message);
}

function rectToText(rect) {
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

async function collectMetrics(page, label) {
  return page.evaluate(({ sampleLabel, expectedSlots }) => {
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
    const centerOwner = (rect) => {
      const element = document.elementFromPoint((rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2);
      const slot = element?.closest?.('[data-bwe-equip-slot]');
      return slot?.getAttribute('data-bwe-equip-slot') ?? null;
    };
    const slots = expectedSlots.map(slot => {
      const rect = getRect(`[data-bwe-equip-slot="${slot}"]`);
      return {
        slot,
        rect,
        centerOwner: rect ? centerOwner(rect) : null,
      };
    });
    return {
      label: sampleLabel,
      slots,
      scrollRegion: getRect('[data-bwe-equip-scroll-region]'),
      figurePanel: getRect('[data-bwe-equip-figure-panel]'),
      petInfo: getRect('[data-bwe-equip-pet-info]'),
      petEmpty: getRect('[data-bwe-equip-pet-empty]'),
      detailPanel: getRect('[data-bwe-equip-detail-panel]'),
      statGrid: getRect('[data-bwe-equip-stat-grid]'),
      statGridColumns: document.querySelector('[data-bwe-equip-stat-grid]')
        ? getComputedStyle(document.querySelector('[data-bwe-equip-stat-grid]')).gridTemplateColumns
        : '',
      detailText: document.querySelector('[data-bwe-equip-detail-panel]')?.textContent?.trim() ?? '',
      petInfoText: document.querySelector('[data-bwe-equip-pet-info]')?.textContent?.trim() ?? '',
      petEmptyText: document.querySelector('[data-bwe-equip-pet-empty]')?.textContent?.trim() ?? '',
    };
  }, { sampleLabel: label, expectedSlots: slotNames });
}

function overlapArea(a, b) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

function assertSlotRects(metrics) {
  const seen = new Set();
  for (const entry of metrics.slots) {
    const { slot, rect, centerOwner } = entry;
    assert(rect, `${metrics.label}: missing rect for ${slot}`);
    assert(rect.width >= 40 && rect.height >= 40, `${metrics.label}: ${slot} must keep a clickable slot rect, got ${rectToText(rect)}`);
    assert(centerOwner === slot, `${metrics.label}: ${slot} center is covered by ${centerOwner ?? 'nothing'}`);
    seen.add(slot);
  }
  assert(seen.size === slotNames.length, `${metrics.label}: expected seven equipment slot rects`);

  for (let i = 0; i < metrics.slots.length; i++) {
    for (let j = i + 1; j < metrics.slots.length; j++) {
      const first = metrics.slots[i];
      const second = metrics.slots[j];
      const area = overlapArea(first.rect, second.rect);
      assert(area === 0, `${metrics.label}: ${first.slot} overlaps ${second.slot} by ${area}px`);
    }
  }
}

function assertLowerFlow(metrics) {
  const { scrollRegion, figurePanel, petEmpty, detailPanel, statGrid, statGridColumns, detailText, petEmptyText } = metrics;
  for (const [name, rect] of Object.entries({ scrollRegion, figurePanel, detailPanel })) {
    assert(rect && rect.width > 0 && rect.height > 0, `${metrics.label}: ${name} must render with a visible rect`);
  }
  assert(statGrid && statGrid.width > 0 && statGrid.height > 0, `${metrics.label}: statGrid must render with a visible rect`);
  assert(petEmpty && petEmpty.height > 0, `${metrics.label}: empty-pet state must be a measured lightweight lower-flow hint`);
  assert(petEmptyText.length > 0, `${metrics.label}: empty-pet hint must be readable text`);
  assert(petEmpty.top >= figurePanel.bottom - 1, `${metrics.label}: empty-pet hint must sit below the figure panel`);
  assert(detailPanel.top >= petEmpty.bottom - 1, `${metrics.label}: detail panel must sit below the empty-pet hint`);
  assert(petEmpty.height <= 28, `${metrics.label}: empty-pet hint must be lightweight, got height ${petEmpty.height}`);

  const visibleDetailHeight = Math.max(0, Math.min(detailPanel.bottom, scrollRegion.bottom) - Math.max(detailPanel.top, scrollRegion.top));
  const bottomGap = Math.abs(scrollRegion.bottom - detailPanel.bottom);
  assert(bottomGap <= 3, `${metrics.label}: lower detail panel must use the available scroll height, bottomGap=${bottomGap}px`);
  assert(visibleDetailHeight >= 190, `${metrics.label}: lower detail area must be readable in the scroll viewport, got ${visibleDetailHeight}px visible`);
  assert(statGridColumns.trim().split(/\s+/).length >= 2, `${metrics.label}: stat delta grid must use multiple columns, got "${statGridColumns}"`);
  assert(detailText.length >= 20, `${metrics.label}: lower detail panel must contain readable selected-slot guidance`);
}

const packageJson = JSON.parse(read('package.json'));
const equipWindow = read('src/components/windows/EquipWindow.tsx');
const as3EquipWindow = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as');

assert(
  packageJson.scripts?.['assert:equip-window-space-utilization'] === 'node scripts/assertEquipWindowSpaceUtilization.mjs',
  'package.json must expose assert:equip-window-space-utilization'
);

assertIncludes(as3EquipWindow, 'private const SC:Number = 0.4;', 'AS3 EquipWindow must keep SC = 0.4 as the mapping source.');
assertIncludes(as3EquipWindow, 'private const SY:int = 100;', 'AS3 EquipWindow must keep SY = 100 as the mapping source.');
assertIncludes(as3EquipWindow, 'this.pet.x = 60;', 'AS3 EquipWindow pet icon x must remain part of the layout evidence.');
assertIncludes(as3EquipWindow, 'this.pet.y = 620;', 'AS3 EquipWindow pet icon y must remain part of the layout evidence.');
assertIncludes(as3EquipWindow, 'this.petSp.visible = false;', 'AS3 EquipWindow must hide pet stats when no pet is equipped.');
assertIncludes(as3EquipWindow, 'this.petSkillSp.visible = false;', 'AS3 EquipWindow must hide pet skills when no pet is equipped.');

assertIncludes(equipWindow, 'const AS3_SLOT_POSITIONS', 'EquipWindow must preserve the AS3 slot coordinate map.');
assert(!equipWindow.includes("const EQUIP_WINDOW_CONTENT_MAX_HEIGHT = 'min(508px, 100%)'"), 'EquipWindow must not cap the scroll region below the available right-panel height.');
assertIncludes(equipWindow, 'data-bwe-equip-stat-grid', 'EquipWindow must expose the multi-column stat delta grid for browser smoke.');
assertIncludes(equipWindow, 'repeat(auto-fit, minmax(118px, 1fr))', 'EquipWindow stat deltas must use a responsive multi-column grid.');
for (const [slot, x, y] of [
  ['head', 210, -50],
  ['feet', 210, 480],
  ['body', 390, 300],
  ['necklace', 380, 100],
  ['ring', 10, 120],
  ['leftHand', 5, 230],
  ['rightHand', 415, 220],
]) {
  assertMatches(
    equipWindow,
    new RegExp(`${slot}:\\s*\\{\\s*x:\\s*${x},\\s*y:\\s*${y}\\s*\\}`),
    `EquipWindow ${slot} slot must keep AS3 coordinates (${x}, ${y}).`,
  );
}
assertIncludes(equipWindow, 'data-bwe-equip-pet-empty', 'EquipWindow must expose the empty-pet lower-flow hint for browser smoke.');

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

    const metrics = await collectMetrics(page, `${viewport.name}:empty-pet`);
    assertSlotRects(metrics);
    assertLowerFlow(metrics);
    assert(errors.length === 0, `${viewport.name}: console/page errors: ${errors.join(' | ')}`);

    const slotSummary = metrics.slots.map(({ slot, rect }) => `${slot}:${rectToText(rect)}`).join(' | ');
    console.log(
      `PASS ${metrics.label}: slots ${slotSummary}; emptyPet=${rectToText(metrics.petEmpty)}; ` +
      `detailVisible=${Math.max(0, Math.min(metrics.detailPanel.bottom, metrics.scrollRegion.bottom) - Math.max(metrics.detailPanel.top, metrics.scrollRegion.top))}`,
    );

    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}

console.log('EquipWindow space utilization checks passed.');
