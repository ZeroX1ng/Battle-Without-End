import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) {
    throw new Error(message);
  }
}

const itemWindow = read('src/components/windows/ItemWindow.tsx');
const actions = read('src/state/actions.ts');
const gameContext = read('src/state/GameContext.tsx');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(itemWindow, "useInfoWindow", 'ItemWindow must use StringInfoButton/ItemInfoWindow style hover tips');
assertIncludes(itemWindow, "showStringInfo('按价值排列')", 'value sort button must show the original StringInfoButton hint');
assertIncludes(itemWindow, "showStringInfo('按类型排列')", 'type sort button must show the original StringInfoButton hint');
assertIncludes(itemWindow, "dispatch({ type: 'ITEM_SORT', mode: 'value' })", 'value sort button must dispatch item sorting');
assertIncludes(itemWindow, "dispatch({ type: 'ITEM_SORT', mode: 'type' })", 'type sort button must dispatch item sorting');
assertIncludes(itemWindow, "showItemInfo(getItemDescription(item))", 'bag item cells must expose item descriptions on hover');
assertIncludes(itemWindow, "showStringInfo(autoForgeLabel)", 'auto forge toggle must expose its original hover feedback');
assertIncludes(itemWindow, "dispatch({ type: 'CONFIG_TOGGLE', key: 'sound_toggle' })", 'ItemWindow sound toggle must share the AS3 sound setting');
assertIncludes(itemWindow, "setSelectedItem(null)", 'destroy/equip paths must clear missing selected item');

assertIncludes(actions, "{ type: 'ITEM_SORT'; mode: 'value' | 'type' }", 'GameAction must include ITEM_SORT');
assertIncludes(gameContext, "case 'ITEM_SORT'", 'reducer must sort the player bag');
assertIncludes(gameContext, "getMoney() < b.getMoney()", 'value sort must match AS3 descending getMoney ordering');
assertIncludes(gameContext, "sortWeight", 'type sort must match AS3 sortWeight ordering');
assertIncludes(gameContext, "queueForgeSound(ctx, 'success')", 'forge success must queue immediate feedback');
assertIncludes(gameContext, "queueForgeSound(ctx, 'destroy')", 'destroyed forge failure must queue immediate feedback');
assertIncludes(gameContext, "playForgeSound(effect.sound)", 'queued forge sound effects must be played after reducer commit');

if (packageJson.scripts?.['assert:item-window'] !== 'node scripts/assertItemWindowParity.mjs') {
  throw new Error('package.json must expose assert:item-window');
}

console.log('ItemWindow parity checks passed.');
