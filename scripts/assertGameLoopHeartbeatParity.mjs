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

const mainScene = read('src/components/scenes/MainScene.tsx');
const gameLoop = read('src/core/systems/GameLoop.ts');
const gameContext = read('src/state/GameContext.tsx');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(
  mainScene,
  "import { gameTick } from '../../core/systems/GameLoop'",
  'MainScene must use the shared core gameTick heartbeat boundary.'
);
assertIncludes(
  mainScene,
  'gameTick(stateRef.current, dispatch)',
  'MainScene useGameLoop callback must delegate tick dispatching to core GameLoop.'
);
assertNotIncludes(
  mainScene,
  "dispatch({ type: 'BATTLE_TICK' })",
  'MainScene must not bypass core GameLoop with a component-local BATTLE_TICK branch.'
);
assertIncludes(
  gameLoop,
  "dispatch({ type: 'BATTLE_TICK' })",
  'core GameLoop must own battle heartbeat dispatch.'
);
assertIncludes(
  gameLoop,
  "dispatch({ type: 'GAME_TICK' })",
  'core GameLoop must dispatch GAME_TICK when no active battle exists.'
);
assertIncludes(
  gameContext,
  "case 'GAME_TICK':",
  'GameContext must expose a reducer path for non-battle heartbeat ticks.'
);

if (packageJson.scripts?.['assert:game-loop'] !== 'node scripts/assertGameLoopHeartbeatParity.mjs') {
  throw new Error('package.json must expose assert:game-loop');
}

console.log('Game loop heartbeat parity checks passed.');
