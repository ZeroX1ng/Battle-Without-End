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

function getCase(source, actionType) {
  const start = source.indexOf(`case '${actionType}':`);
  if (start < 0) {
    throw new Error(`Missing reducer case ${actionType}`);
  }
  const next = source.indexOf('\n    case ', start + 1);
  return source.slice(start, next < 0 ? source.indexOf('\n    default:', start) : next);
}

const as3Battle = read('../BOE-O/scripts/iData/Battle.as');
const gameContext = read('src/state/GameContext.tsx');
const packageJson = JSON.parse(read('package.json'));
const battleTick = getCase(gameContext, 'BATTLE_TICK');

assertIncludes(as3Battle, 'Player.addExp(this.monster.exp);', 'AS3 reward flow directly accumulates exp on Player');
assertIncludes(as3Battle, 'Player.addMoney(this.monster.money);', 'AS3 reward flow directly accumulates money on Player');
assertIncludes(as3Battle, 'this.monster.dropItem();', 'AS3 reward flow delegates item drops without a shared loot object');
assertIncludes(as3Battle, 'this.monster.dropPet();', 'AS3 reward flow delegates pet drops without a shared loot object');

assertIncludes(battleTick, 'if (result.loot) {', 'BATTLE_TICK must explicitly merge battle loot results');
assertIncludes(
  battleTick,
  'newState = { ...newState, loot: { ...newState.loot } };',
  'BATTLE_TICK must clone the existing LootState before applying battle loot'
);
assertIncludes(
  battleTick,
  'for (const key of Object.keys(result.loot) as Array<keyof LootState>)',
  'BATTLE_TICK must merge battle loot counters key-by-key'
);
assertIncludes(
  battleTick,
  'newState.loot[key] += result.loot[key] ?? 0;',
  'BATTLE_TICK must add battle loot counters instead of replacing the loot object'
);

assertNotIncludes(battleTick, 'loot: result.loot', 'BATTLE_TICK must not store Battle.run loot by reference');
assertNotIncludes(battleTick, 'newState.loot = result.loot', 'BATTLE_TICK must not replace state loot with Battle.run loot');
assert(!/result\.loot\[[^\]]+\]\s*[+\-*/]?=/.test(battleTick), 'BATTLE_TICK must not mutate Battle.run loot while merging');

if (packageJson.scripts?.['assert:loot-merge-reference-safety'] !== 'node scripts/assertLootMergeReferenceSafety.mjs') {
  throw new Error('package.json must expose assert:loot-merge-reference-safety');
}

console.log('Loot merge reference-safety checks passed.');
