import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const as3Root = join(root, '..', 'BOE-O', 'scripts');

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function readAs3(relativePath) {
  const filePath = join(as3Root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing AS3 ${relativePath}`);
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

const as3Battle = readAs3('iData/Battle.as');
const as3MainScene = readAs3('iPanel/iScene/MainScene.as');
const as3Player = readAs3('iGlobal/Player.as');
const packageJson = JSON.parse(read('package.json'));
const mainScene = read('src/components/scenes/MainScene.tsx');
const speedControl = read('src/components/debug/TestSpeedControl.tsx');
const testSpeed = read('src/core/debug/testSpeedControl.ts');
const useGameLoop = read('src/hooks/useGameLoop.ts');
const saveSystem = read('src/core/systems/SaveSystem.ts');
const types = read('src/core/types.ts');

assertIncludes(as3Battle, 'this.timer = new Timer(500);', 'AS3 Battle must preserve the normal 500ms Timer baseline.');
assertIncludes(as3Battle, 'this.timer.addEventListener(TimerEvent.TIMER,this.run);', 'AS3 Battle Timer must call run().');
assertIncludes(as3Battle, '++Player.caculate;', 'AS3 Battle.run must own logical progression.');
assertIncludes(as3Battle, 'if(Player.caculate % 60 == 0)', 'AS3 Battle.run must keep save cadence tied to tick count.');
assertIncludes(as3Battle, 'if(Player.caculate % 600 == 0)', 'AS3 Battle.run must keep shop cadence tied to tick count.');
assertIncludes(as3MainScene, 'battle = new Battle();', 'AS3 MainScene must create Battle without a persisted speed state.');
assertIncludes(as3Player, '"caculate"', 'AS3 Player.save must persist progress ticks, not a speed multiplier.');

if (packageJson.scripts?.['assert:test-speed-control'] !== 'node scripts/assertTestSpeedControlParity.mjs') {
  throw new Error('package.json must expose assert:test-speed-control');
}

assertIncludes(testSpeed, 'export const TEST_SPEED_CONTROL_ENABLED = true', 'Speed control must be removable through one feature flag.');
assertIncludes(testSpeed, 'export const TEST_SPEED_MULTIPLIERS = [1, 2, 5, 10] as const', 'Speed control must expose exactly 1x/2x/5x/10x.');
assertIncludes(testSpeed, 'export const DEFAULT_TEST_SPEED_MULTIPLIER = 1', 'Speed control default must be 1x.');
assertIncludes(testSpeed, 'baseIntervalMs / multiplier', 'Speed control must affect effective loop interval only.');

assertIncludes(speedControl, 'data-bwe-test-speed-control', 'Speed control must render a browser-visible smoke target.');
assertIncludes(speedControl, 'TEST_SPEED_MULTIPLIERS.map', 'Speed control UI must be generated from the shared multiplier list.');
assertIncludes(speedControl, 'aria-pressed={multiplier === value}', 'Speed control must expose selected state to browser smoke.');

assertIncludes(mainScene, 'TEST_SPEED_CONTROL_ENABLED', 'MainScene must keep speed UI behind the feature flag.');
assertIncludes(mainScene, 'DEFAULT_TEST_SPEED_MULTIPLIER', 'MainScene must default speed control to 1x.');
assertIncludes(mainScene, 'getTestSpeedIntervalMs(500, testSpeedMultiplier)', 'MainScene must derive useGameLoop effective interval from multiplier.');
assertIncludes(mainScene, 'intervalMs: gameLoopIntervalMs', 'useGameLoop must consume the effective interval.');
assertIncludes(mainScene, '<TestSpeedControl', 'MainScene must render the speed control while the feature flag is enabled.');

assertIncludes(useGameLoop, 'intervalMs = 500', 'useGameLoop must preserve the 500ms default baseline.');
assertNotIncludes(useGameLoop, 'TEST_SPEED', 'useGameLoop must stay generic and not own the temporary test feature.');

for (const source of [saveSystem, types]) {
  assertNotIncludes(source, 'testSpeed', 'Test speed state must not be serialized or typed as save state.');
  assertNotIncludes(source, 'speedMultiplier', 'Speed multiplier must not be serialized or typed as save state.');
  assertNotIncludes(source, 'TEST_SPEED', 'Feature flag names must not leak into save state.');
}

console.log('Test speed control parity checks passed.');
