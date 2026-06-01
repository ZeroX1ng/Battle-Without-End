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

function extractFunction(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start < 0) {
    throw new Error(`Missing function ${functionName}`);
  }
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
    if (depth === 0) {
      return source.slice(start, i + 1);
    }
  }
  throw new Error(`Could not extract function ${functionName}`);
}

function caseBody(source, caseName) {
  const start = source.indexOf(`case '${caseName}'`);
  if (start < 0) {
    throw new Error(`Missing reducer case ${caseName}`);
  }
  const rest = source.slice(start);
  const next = rest.slice(1).search(/\n\s*case\s+'/);
  return next < 0 ? rest : rest.slice(0, next + 1);
}

const gameContext = read('src/state/GameContext.tsx');
const reducerEffects = read('src/state/reducerEffects.ts');
const actions = read('src/state/actions.ts');
const packageJson = JSON.parse(read('package.json'));

if (packageJson.scripts?.['assert:reducer-purity-strictmode'] !== 'node scripts/assertReducerPurityStrictMode.mjs') {
  throw new Error('package.json must expose assert:reducer-purity-strictmode');
}

const reducer = extractFunction(gameContext, 'gameReducer');
const forbiddenReducerCalls = [
  ['localSave(', 'gameReducer must not write local saves during reducer evaluation.'],
  ['manuallySave(', 'gameReducer must not export manual saves during reducer evaluation.'],
  ['localLoad(', 'gameReducer must not read local saves during reducer evaluation.'],
  ['playForgeSound(', 'gameReducer must not play forge sounds during reducer evaluation.'],
  ['Date.now(', 'gameReducer must not read wall-clock time during reducer evaluation.'],
  ['Math.random(', 'gameReducer must not consume randomness during reducer evaluation.'],
  ['updateTitleInfo(', 'gameReducer must not mutate global title progress during reducer evaluation.'],
  ['setSoundEnabled(', 'gameReducer must not update the global sound system during reducer evaluation.'],
  ['createInitialShopState(', 'gameReducer must not generate random shop state during reducer evaluation.'],
  ['generateShopState(', 'gameReducer must not generate random shop state during reducer evaluation.'],
];

for (const [needle, message] of forbiddenReducerCalls) {
  assertNotIncludes(reducer, needle, message);
}

const manualForgeCase = caseBody(reducer, 'FORGE_EQUIPMENT');
assertNotIncludes(
  manualForgeCase,
  'const equip = state.player.itemList',
  'FORGE_EQUIPMENT must not mutate the equipment instance reachable from previous state.'
);
assertNotIncludes(
  manualForgeCase,
  'equip.levelup()',
  'FORGE_EQUIPMENT must level up a cloned equipment instance.'
);
assertNotIncludes(
  manualForgeCase,
  'equip.setLevel(',
  'FORGE_EQUIPMENT must set level on a cloned equipment instance.'
);

assertIncludes(
  actions,
  'export interface GameActionMeta',
  'GameAction must carry precomputed StrictMode-safe metadata for random/time/load inputs.'
);
assertIncludes(
  reducerEffects,
  'export type GameEffect',
  'reducerEffects must describe reducer effects explicitly outside gameReducer.'
);
assertIncludes(
  reducerEffects,
  'export function processGameEffects',
  'reducerEffects must process explicit reducer effects after commit.'
);
assertIncludes(
  gameContext,
  'processGameEffects(state.pendingEffects',
  'GameProvider must call the post-commit reducer effect processor.'
);
assertIncludes(
  gameContext,
  'function prepareActionForReducer',
  'GameProvider must prepare random/time/load inputs before dispatching to the reducer.'
);

console.log('Reducer purity StrictMode checks passed.');
