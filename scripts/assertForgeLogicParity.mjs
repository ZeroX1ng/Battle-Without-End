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

function caseBody(source, caseName) {
  const start = source.indexOf(`case '${caseName}'`);
  if (start < 0) {
    throw new Error(`Missing reducer case ${caseName}`);
  }
  const rest = source.slice(start + caseName.length);
  const next = rest.search(/\n\s*case\s+'/);
  return next < 0 ? rest : rest.slice(0, next);
}

const forgeSystem = read('src/core/systems/ForgeSystem.ts');
const itemWindow = read('src/components/windows/ItemWindow.tsx');
const gameContext = read('src/state/GameContext.tsx');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(forgeSystem, 'export function getForgeSuccessRate', 'Forge success formula must live in ForgeSystem');
assertIncludes(forgeSystem, 'export function getForgeCost', 'Forge cost formula must live in ForgeSystem');
assertIncludes(forgeSystem, 'export function getAutoForgeTarget', 'Auto-forge target policy must live in ForgeSystem');
assertIncludes(forgeSystem, 'export function resolveForgeFailure', 'Forge failure penalty must live in ForgeSystem');
assertIncludes(forgeSystem, 'failureRoll: number', 'Forge failure resolution must accept an explicit random roll for deterministic tests');

assertIncludes(itemWindow, '../../core/systems/ForgeSystem', 'ItemWindow must import shared forge selectors');
assertNotIncludes(itemWindow, 'Math.pow(Math.E, -targetLevel / 5)', 'ItemWindow must not duplicate the AS3 forge success formula');
assertNotIncludes(itemWindow, '100 - targetLevel * 3', 'ItemWindow must not duplicate the forge success cap');

assertIncludes(gameContext, '../core/systems/ForgeSystem', 'GameContext must import shared forge logic');
assertNotIncludes(gameContext, 'function getForgeSuccessRate', 'GameContext must not own forge success formula');
assertNotIncludes(gameContext, 'function getForgeCost', 'GameContext must not own forge cost formula');
assertNotIncludes(gameContext, 'function applyForgeFailure', 'GameContext must not own forge failure penalty');
assertNotIncludes(gameContext, 'legacyForgeFailure', 'GameContext must not retain dead forge penalty code');

const forgeCase = caseBody(gameContext, 'FORGE_EQUIPMENT');
const autoForgeCase = caseBody(gameContext, 'AUTO_FORGE_EQUIPMENT');
assertIncludes(forgeCase, 'withBattlePlayer', 'Manual forge must sync the updated player into live battle state');
assertIncludes(autoForgeCase, 'withBattlePlayer', 'Auto forge must sync the updated player into live battle state');

if (packageJson.scripts?.['assert:forge-logic'] !== 'node scripts/assertForgeLogicParity.mjs') {
  throw new Error('package.json must expose assert:forge-logic');
}

console.log('Forge logic parity checks passed.');
