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

function getCase(source, actionType) {
  const start = source.indexOf(`case '${actionType}':`);
  if (start < 0) {
    throw new Error(`Missing reducer case ${actionType}`);
  }
  const next = source.indexOf('\n    case ', start + 1);
  return source.slice(start, next < 0 ? source.indexOf('\n    default:', start) : next);
}

function assertCaseSyncsBattle(source, actionType) {
  const body = getCase(source, actionType);
  assertIncludes(
    body,
    'withBattlePlayer(',
    `${actionType} updates PlayerState and must also sync an active Battle.playerState`
  );
}

const gameContext = read('src/state/GameContext.tsx');
const battleModel = read('src/core/models/Battle.ts');
const as3Battle = read('../BOE-O/scripts/iData/Battle.as');

assertIncludes(as3Battle, '++Player.caculate;', 'AS3 Battle.run must mutate the global Player timer');
assertIncludes(as3Battle, 'Player.ageup();', 'AS3 Battle.run must age the global Player directly');
assertIncludes(battleModel, 'public playerState: PlayerState', 'React Battle currently owns a live PlayerState reference that must stay synchronized');
assertIncludes(gameContext, 'function withBattlePlayer', 'GameContext must provide a single active-battle player sync helper');

for (const actionType of [
  'PLAYER_SET_NAME',
  'EQUIP_ITEM',
  'UNEQUIP_ITEM',
  'ITEM_ADD',
  'ITEM_REMOVE',
  'ITEM_SELL',
  'ITEM_SORT',
  'BAG_EXPAND',
  'PET_EXPAND',
  'SHOP_BUY_SELL',
  'SHOP_BUY_GAMBLE',
  'FORGE_EQUIPMENT',
  'AUTO_FORGE_EQUIPMENT',
  'SKILL_LEARN',
  'SKILL_LEVELUP',
  'SKILL_EQUIP',
  'SKILL_UNEQUIP',
  'PLAYER_AGEUP',
  'PLAYER_ADD_EXP',
  'PLAYER_ADD_GOLD',
  'PLAYER_LOSE_GOLD',
  'PLAYER_LOSE_EXP',
  'PET_ADD',
  'PET_SET',
  'PET_REMOVE',
  'TITLE_ADD',
  'TITLE_SET',
]) {
  assertCaseSyncsBattle(gameContext, actionType);
}

const battleTick = getCase(gameContext, 'BATTLE_TICK');
assertIncludes(
  battleTick,
  'return withBattlePlayer(newState, playerState);',
  'BATTLE_TICK must write post-run ageup/unlock changes back to the active Battle.playerState before the next tick'
);
if (/\bb(?:attle)?\.config\s*=/.test(battleTick)) {
  throw new Error('BATTLE_TICK must not directly assign Battle.config inside the reducer');
}

console.log('Battle player state parity checks passed.');
