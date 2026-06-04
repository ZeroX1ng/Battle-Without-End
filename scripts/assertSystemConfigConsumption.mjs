import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const srcRoot = join(root, 'src');
const outRoot = join(root, '.tmp-system-config-test');
const testEntry = join(outRoot, 'system-config-consumption.test.ts');
const seen = new Set();

const testSource = `
import {
  addItemWithAutoSell,
  handleDroppedItem,
  shouldDisplayLog,
  shouldKeepDroppedItem,
} from './core/systems/SystemConfig';
import type { GlobalConfig, PlayerState } from './core/types';

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(label + "\\nexpected: " + e + "\\nactual:   " + a);
  }
}

const config: GlobalConfig = {
  battle_toggle: true,
  battleIntro_toggle: true,
  money_toggle: true,
  exp_toggle: true,
  item_toggle: true,
  other_toggle: true,
  item0_toggle: true,
  item1_toggle: true,
  item2_toggle: true,
  item3_toggle: true,
  item4_toggle: true,
  item5_toggle: true,
  sword_toggle: true,
  axe_toggle: true,
  bow_toggle: true,
  crossbow_toggle: true,
  sceptre_toggle: true,
  staff_toggle: true,
  tome_toggle: true,
  shield_toggle: true,
  dagger_toggle: true,
  body_light_toggle: true,
  body_medium_toggle: true,
  body_heavy_toggle: true,
  head_light_toggle: true,
  head_medium_toggle: true,
  head_heavy_toggle: true,
  feet_light_toggle: true,
  feet_medium_toggle: true,
  feet_heavy_toggle: true,
  necklace_toggle: true,
  ring_toggle: true,
  autoSell_toggle: true,
  sound_toggle: true,
};

const item = (patch: Record<string, unknown>) => ({
  name: 'sword',
  position: 'body',
  type: 'light',
  quality: 2,
  category: undefined,
  getMoney: () => 10,
  getSellMoney: () => 100,
  getNameHTML: () => '<font>Sword</font>',
  ...patch,
});

assertEqual(shouldDisplayLog(config, 'battle'), true, 'battle log displays when enabled');
assertEqual(shouldDisplayLog({ ...config, battle_toggle: false }, 'battle'), false, 'battle log hides when disabled');
assertEqual(shouldDisplayLog({ ...config, other_toggle: false }, undefined), false, 'uncategorized logs follow other_toggle');

assertEqual(shouldKeepDroppedItem({ ...config, item2_toggle: false }, item({ quality: 2 })), false, 'quality toggle rejects matching drops');
assertEqual(shouldKeepDroppedItem({ ...config, sword_toggle: false }, item({ category: 'melee', name: 'sword' })), false, 'weapon name toggle rejects weapon drops');
assertEqual(shouldKeepDroppedItem({ ...config, body_light_toggle: false }, item({ position: 'body', type: 'light' })), false, 'armor position/type toggle rejects armor drops');
assertEqual(shouldKeepDroppedItem({ ...config, ring_toggle: false }, item({ position: 'ring', type: 'accesory', name: 'ring' })), false, 'accessory name toggle rejects accessory drops');
assertEqual(shouldKeepDroppedItem(config, item({ quality: 5, position: 'head', type: 'heavy' })), true, 'enabled toggles keep eligible drops');

const lowValue = item({ name: 'low', getMoney: () => 1, getSellMoney: () => 10 });
const highValue = item({ name: 'high', getMoney: () => 20, getSellMoney: () => 200 });
const incoming = item({ name: 'incoming', getMoney: () => 5, getSellMoney: () => 50 });
const fullPlayer = {
  gold: 7,
  BAGMAX: 2,
  itemList: [highValue, lowValue],
} as PlayerState;

const autoSold = addItemWithAutoSell(fullPlayer, incoming, config);
assertEqual(autoSold.added, true, 'auto sell accepts incoming item when bag is full');
assertEqual(autoSold.soldItem?.name, 'low', 'auto sell removes lowest value item');
assertEqual(autoSold.state.gold, 8, 'auto sell adds the sold item AS3 getMoney value');
assertEqual(autoSold.state.itemList.map((entry: any) => entry.name), ['high', 'incoming'], 'auto sell keeps remaining items and incoming item');

const blocked = addItemWithAutoSell(fullPlayer, incoming, { ...config, autoSell_toggle: false });
assertEqual(blocked.added, false, 'full bag rejects incoming item when auto sell is disabled');
assertEqual(blocked.state.itemList.map((entry: any) => entry.name), ['high', 'low'], 'rejected item leaves bag unchanged');

const filteredDrop = item({ quality: 2, getMoney: () => 25, getSellMoney: () => 250 });
const filteredResult = handleDroppedItem(
  { ...fullPlayer, gold: 3, BAGMAX: 10, itemList: [] },
  filteredDrop,
  { ...config, item2_toggle: false },
);
assertEqual(filteredResult.added, false, 'filtered drop is not added to the bag');
assertEqual(filteredResult.convertedToGold, 25, 'filtered drop converts to base drop money');
assertEqual(filteredResult.state.gold, 28, 'filtered drop gold is awarded to the player');
assertEqual(filteredResult.state.itemList.length, 0, 'filtered drop leaves bag unchanged');
`;

async function writeTestEntry() {
  await mkdir(outRoot, { recursive: true });
  await writeFile(testEntry, testSource, 'utf8');
}

async function transpileFile(filePath) {
  const normalized = resolve(filePath);
  if (seen.has(normalized) || extname(normalized) !== '.ts') {
    return;
  }
  seen.add(normalized);

  const source = await readFile(normalized, 'utf8');
  const importRegex = /from\s+['"](\.{1,2}\/[^'"]+)['"]/g;
  const imports = [...source.matchAll(importRegex)].map(match => match[1]);
  const patchedSource = source.replace(importRegex, (match, specifier) => {
    const prefix = match.slice(0, -specifier.length - 1);
    return `${prefix}${specifier}.js'`;
  });

  const output = ts.transpileModule(patchedSource, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;

  const baseRoot = normalized.startsWith(srcRoot) ? srcRoot : outRoot;
  const outPath = join(outRoot, relative(baseRoot, normalized)).replace(/\.ts$/, '.js');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, output, 'utf8');

  for (const specifier of imports) {
    const importedTs = resolve(dirname(normalized), `${specifier}.ts`);
    const sourceTs = importedTs.startsWith(outRoot)
      ? resolve(srcRoot, relative(outRoot, importedTs))
      : importedTs;
    await transpileFile(sourceTs);
  }
}

await rm(outRoot, { recursive: true, force: true });
await writeTestEntry();

try {
  await transpileFile(testEntry);
  await import(pathToFileURL(join(outRoot, 'system-config-consumption.test.js')));
} finally {
  await rm(outRoot, { recursive: true, force: true });
}

console.log('System config toggles are consumed by logs, drops, and auto sell.');
