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

function assertNotIncludes(source, needle, message) {
  if (source.includes(needle)) {
    throw new Error(message);
  }
}

const battleModel = read('src/core/models/Battle.ts');
const gameContext = read('src/state/GameContext.tsx');
const reducerEffects = read('src/state/reducerEffects.ts');
const titleData = read('src/core/data/titleData.ts');
const packageJson = JSON.parse(read('package.json'));

assertNotIncludes(
  battleModel,
  "../data/titleData",
  'Battle must not import titleData directly; emit titleEvents instead.'
);
assertNotIncludes(
  battleModel,
  'updateTitleInfo(',
  'Battle must not mutate title progress directly; emit titleEvents instead.'
);
assertIncludes(
  battleModel,
  'titleEvents: BattleTitleEvent[]',
  'BattleRunResult must expose titleEvents for reducer-side title progress consumption.'
);
assertIncludes(
  battleModel,
  'private addTitleEvent',
  'Battle must collect title progress as explicit events.'
);
assertIncludes(
  gameContext,
  'queueTitleEvents(ctx, result.titleEvents)',
  'BATTLE_TICK must queue battle titleEvents as explicit reducer effects.'
);
assertIncludes(
  reducerEffects,
  'export function processGameEffects',
  'GameContext must process explicit side effects outside reducer evaluation.'
);
assertIncludes(
  gameContext,
  'processGameEffects(state.pendingEffects',
  'GameProvider must call the explicit side-effect processor after commit.'
);
assertIncludes(
  gameContext,
  'applyTitleEventsToPlayer',
  'GameContext must apply Battle titleEvents to player-owned title state.'
);
assertIncludes(
  titleData,
  'export function applyTitleEvents',
  'titleData must expose a pure helper for player-owned title state updates.'
);

if (packageJson.scripts?.['assert:architecture'] !== 'node scripts/assertArchitectureBoundaries.mjs') {
  throw new Error('package.json must expose assert:architecture');
}

console.log('Architecture boundary checks passed.');
