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

const gameContext = read('src/state/GameContext.tsx');
const reducerEffects = read('src/state/reducerEffects.ts');
const runGuardGate = read('scripts/runGuardGate.mjs');
const packageJson = JSON.parse(read('package.json'));

if (packageJson.scripts?.['assert:module-boundary-decomposition'] !== 'node scripts/assertModuleBoundaryDecomposition.mjs') {
  throw new Error('package.json must expose assert:module-boundary-decomposition');
}

assertIncludes(
  gameContext,
  "from './reducerEffects'",
  'GameContext must import reducer effect helpers from the extracted reducerEffects module.'
);

const extractedExports = [
  'export type TitleEffectEvent',
  'export type GameEffect',
  'export interface ReducerContext',
  'export function createReducerContext',
  'export function queueLocalSave',
  'export function queueManualSave',
  'export function queueForgeSound',
  'export function queueSoundToggle',
  'export function queueTitleEvent',
  'export function queueTitleEvents',
  'export function nextRandomPercent',
  'export function clearPendingEffects',
  'export function withQueuedEffects',
  'export function processGameEffects',
  'export function createRandomPercents',
];

for (const needle of extractedExports) {
  assertIncludes(
    reducerEffects,
    needle,
    `reducerEffects.ts must own ${needle.replace('export ', '')}.`
  );
}

const removedDeclarations = [
  'type GameEffectPayload =',
  'type GameEffect =',
  'interface ReducerContext {',
  'function createReducerContext',
  'function queueLocalSave',
  'function queueManualSave',
  'function queueForgeSound',
  'function queueSoundToggle',
  'function queueTitleEvent',
  'function queueTitleEvents',
  'function nextRandomPercent',
  'function clearPendingEffects',
  'function withQueuedEffects',
  'function processGameEffects',
  'function createRandomPercents',
];

for (const needle of removedDeclarations) {
  assertNotIncludes(
    gameContext,
    needle,
    `GameContext must not continue owning the extracted reducer effect declaration: ${needle}.`
  );
}

assertIncludes(
  runGuardGate,
  "'assert:module-boundary-decomposition'",
  'The changed guard gate must include the module-boundary decomposition guard in the architecture group.'
);

console.log('Module boundary decomposition checks passed.');
