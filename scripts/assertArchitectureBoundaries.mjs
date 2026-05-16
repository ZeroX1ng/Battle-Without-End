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
  'applyTitleEvents(result.titleEvents)',
  'BATTLE_TICK must consume battle titleEvents at the reducer boundary.'
);
assertIncludes(
  gameContext,
  'function applyTitleEvents',
  'GameContext must keep title mutation in one reducer-side helper.'
);

if (packageJson.scripts?.['assert:architecture'] !== 'node scripts/assertArchitectureBoundaries.mjs') {
  throw new Error('package.json must expose assert:architecture');
}

console.log('Architecture boundary checks passed.');
