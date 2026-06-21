import { existsSync, readFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer as createViteServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));

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

async function collectMetrics(page, label) {
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

    const battleBottom = document.querySelector('.main-scene__battle-bottom');
    const battleBottomStyle = battleBottom ? getComputedStyle(battleBottom) : null;
    const layout = document.querySelector('.game-layout');
    const stageScale = layout
      ? Number.parseFloat(getComputedStyle(layout).getPropertyValue('--bwe-stage-scale'))
      : Number.NaN;

    return {
      label: sampleLabel,
      stageScale,
      logRegion: getRect('.main-scene__log'),
      battleLog: getRect('[data-bwe-battle-log-panel]'),
      battleBottom: getRect('.main-scene__battle-bottom'),
      battleSkill: getRect('.main-scene__battle-bottom > :first-child'),
      lootPanel: getRect('[data-bwe-loot-panel]'),
      battleBottomStyle: battleBottomStyle
        ? {
            display: battleBottomStyle.display,
            alignContent: battleBottomStyle.alignContent,
            gridTemplateRows: battleBottomStyle.gridTemplateRows,
          }
        : null,
    };
  }, label);
}

function assertLayout(metrics) {
  const {
    label,
    stageScale,
    logRegion,
    battleLog,
    battleBottom,
    battleSkill,
    lootPanel,
    battleBottomStyle,
  } = metrics;
  assert(Number.isFinite(stageScale) && stageScale > 0, `${label}: stage scale must be measurable`);
  for (const [name, rect] of Object.entries({ logRegion, battleLog, battleBottom, battleSkill, lootPanel })) {
    assert(rect && rect.width > 0 && rect.height > 0, `${label}: ${name} must render with a visible rect`);
  }

  const tolerance = Math.max(2, 3 * stageScale);
  const skillLootGap = lootPanel.top - battleSkill.bottom;
  const lootTopGap = Math.abs(lootPanel.top - battleLog.top);
  const battleBottomTopGap = Math.abs(battleBottom.top - logRegion.top);
  const battleBottomBottomGap = Math.abs(battleBottom.bottom - logRegion.bottom);
  const lootBottomGap = Math.abs(lootPanel.bottom - battleBottom.bottom);
  const logLootBottomGap = Math.abs(lootPanel.bottom - battleLog.bottom);
  const minLootHeight = 185 * stageScale - tolerance;

  const lootTopAlignedToLog = lootTopGap <= tolerance;
  const clearInformationColumn =
    battleBottomBottomGap <= tolerance &&
    skillLootGap >= 0 &&
    skillLootGap <= 12 * stageScale + tolerance &&
    lootPanel.height >= minLootHeight &&
    lootBottomGap <= tolerance &&
    logLootBottomGap <= tolerance &&
    battleBottomStyle?.display === 'grid' &&
    battleBottomStyle.alignContent !== 'start';

  assert(
    lootTopAlignedToLog || clearInformationColumn,
    `${label}: LootPanel must either top-align with the battle log or fill a clear battle-bottom information column; ` +
      `lootTopGap=${lootTopGap}, battleBottomTopGap=${battleBottomTopGap}, ` +
      `battleBottomBottomGap=${battleBottomBottomGap}, skillLootGap=${skillLootGap}, ` +
      `lootBottomGap=${lootBottomGap}, logLootBottomGap=${logLootBottomGap}, ` +
      `battleBottomStyle=${JSON.stringify(battleBottomStyle)}`
  );

  console.log(
    `PASS ${label}: log=${rectToText(battleLog)}; loot=${rectToText(lootPanel)}; ` +
    `battleBottom=${rectToText(battleBottom)}; topGap=${lootTopGap}; ` +
    `battleBottomTopGap=${battleBottomTopGap}; lootBottomGap=${lootBottomGap}; ` +
    `style=${JSON.stringify(battleBottomStyle)}`
  );
}

const packageJson = JSON.parse(read('package.json'));
const mainScene = read('src/components/scenes/MainScene.tsx');
const lootPanel = read('src/components/panels/LootPanel.tsx');
const allInfoPanel = read('src/components/panels/AllInfoPanel.tsx');
const mainSceneCss = read('src/styles/main-scene.css');
const as3MainScene = read('reference/as3/BOE-O/scripts/iPanel/iScene/MainScene.as');
const as3LootPanel = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/LootPanel.as');
const as3AllInfoPanel = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/AllInfoPanel.as');

assert(
  packageJson.scripts?.['assert:loot-panel-log-alignment'] === 'node scripts/assertLootPanelLogAlignment.mjs',
  'package.json must expose assert:loot-panel-log-alignment'
);
assertIncludes(mainScene, 'className="main-scene__battle-bottom"', 'MainScene must keep BattleSkillPanel and LootPanel in battle-bottom.');
assertIncludes(mainScene, '<LootPanel />', 'MainScene must render LootPanel in the main battle column.');
assertIncludes(lootPanel, 'data-bwe-loot-panel', 'LootPanel must expose a stable DOM hook for rect smoke.');
assertIncludes(allInfoPanel, 'data-bwe-battle-log-panel', 'AllInfoPanel must expose the battle log DOM hook for rect smoke.');
assertIncludes(mainSceneCss, '.main-scene__battle-bottom', 'main-scene.css must own battle-bottom local layout.');
assertIncludes(as3MainScene, 'allInfoPanel.y = 235;', 'AS3 MainScene must place the battle log in the lower information band.');
assertIncludes(as3MainScene, 'lootPanel.y = 405;', 'AS3 MainScene must place LootPanel as part of the lower battle information area.');
assertIncludes(as3LootPanel, 'super(170,185);', 'AS3 LootPanel must preserve the 170x185 loot-stat panel size.');
assertIncludes(as3AllInfoPanel, 'super(400,355);', 'AS3 AllInfoPanel must preserve the 400x355 battle log panel size.');

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
    await page.waitForSelector('[data-bwe-loot-panel]', { timeout: 5000 });
    await page.waitForSelector('[data-bwe-battle-log-panel]', { timeout: 5000 });
    await page.waitForTimeout(500);

    const metrics = await collectMetrics(page, viewport.name);
    assert(errors.length === 0, `${viewport.name}: console/page errors: ${errors.join(' | ')}`);
    assertLayout(metrics);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}

console.log('LootPanel and battle-log alignment checks passed.');
