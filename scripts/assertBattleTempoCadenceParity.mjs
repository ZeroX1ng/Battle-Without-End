import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { resolveAs3Path } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const as3Root = resolveAs3Path('scripts');
const outRoot = join(root, 'node_modules/.cache/bwe-assert-battle-tempo-cadence');

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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message);
}

function assertNotIncludes(source, needle, message) {
  assert(!source.includes(needle), message);
}

function countMatches(source, needle) {
  return source.split(needle).length - 1;
}

function legacySynchronousTickCount(elapsedMs, intervalMs) {
  const dueTicks = Math.floor(elapsedMs / intervalMs);
  let ticks = 0;
  for (let i = 0; i < dueTicks; i += 1) {
    ticks += 1;
  }
  return ticks;
}

try {
  const as3Battle = readAs3('iData/Battle.as');
  const packageJson = JSON.parse(read('package.json'));
  const useGameLoop = read('src/hooks/useGameLoop.ts');
  const mainScene = read('src/components/scenes/MainScene.tsx');
  const gameLoop = read('src/core/systems/GameLoop.ts');
  const battleModel = read('src/core/models/Battle.ts');
  const testSpeed = read('src/core/debug/testSpeedControl.ts');
  const saveSystem = read('src/core/systems/SaveSystem.ts');
  const types = read('src/core/types.ts');

  assertIncludes(as3Battle, 'this.timer = new Timer(500);', 'AS3 Battle must create a 500ms Timer.');
  assertIncludes(
    as3Battle,
    'this.timer.addEventListener(TimerEvent.TIMER,this.run);',
    'AS3 Battle Timer must call run() once per timer event.'
  );
  assertIncludes(as3Battle, 'this.timer.start();', 'AS3 Battle Timer must start in the Battle lifecycle.');

  const runMatch = as3Battle.match(/public function run\(param1:Event = null\) : void\s*\{([\s\S]*?)\n      private function fight/);
  assert(runMatch, 'AS3 Battle.run body must be readable.');
  assertEqual(
    countMatches(runMatch[1], 'this.fight();'),
    1,
    'AS3 Battle.run must call fight() exactly once per Timer event'
  );
  assertIncludes(runMatch[1], '++Player.caculate;', 'AS3 Battle.run must advance caculate after the single fight().');

  const fightMatch = as3Battle.match(/private function fight\(\) : \*\s*\{([\s\S]*?)\n      private function playerTurn/);
  assert(fightMatch, 'AS3 Battle.fight body must be readable.');
  assertEqual(
    countMatches(fightMatch[1], 'this.changeTurn();'),
    1,
    'AS3 Battle.fight must change turn exactly once per fight() call'
  );

  if (packageJson.scripts?.['assert:battle-tempo-cadence'] !== 'node scripts/assertBattleTempoCadenceParity.mjs') {
    throw new Error('package.json must expose assert:battle-tempo-cadence');
  }

  assertIncludes(
    mainScene,
    'getTestSpeedIntervalMs(500, testSpeedMultiplier)',
    'MainScene must keep the 500ms AS3 baseline before applying the temporary test multiplier.'
  );
  assertIncludes(
    mainScene,
    'DEFAULT_TEST_SPEED_MULTIPLIER',
    'MainScene must initialize the temporary speed control from the shared 1x default.'
  );
  assertIncludes(
    mainScene,
    'intervalMs: gameLoopIntervalMs',
    'MainScene must pass the effective interval into useGameLoop.'
  );
  assertIncludes(
    mainScene,
    'gameTick(stateRef.current, dispatch, battleDebugOptions)',
    'MainScene must continue to delegate each logical tick through core GameLoop.'
  );
  assertIncludes(
    gameLoop,
    "dispatch({ type: 'BATTLE_TICK', meta: { battleDebug: debugOptions } })",
    'core GameLoop must keep BATTLE_TICK dispatch ownership.'
  );
  assertIncludes(
    battleModel,
    'fight(): void',
    'Battle model must keep one fight() boundary per battle tick.'
  );
  assertIncludes(
    battleModel,
    'this.fight();',
    'Battle.run must continue to invoke fight() through the AS3-equivalent path.'
  );

  assertIncludes(testSpeed, 'export const DEFAULT_TEST_SPEED_MULTIPLIER = 1', 'Test speed must default to 1x.');
  assertIncludes(
    testSpeed,
    'export const DEFAULT_TEST_ONE_HIT_KILL_ENABLED = false',
    'One-hit debug control must default off.'
  );
  assertIncludes(
    testSpeed,
    'baseIntervalMs / multiplier',
    'Test speed must only affect the effective loop interval.'
  );

  for (const source of [saveSystem, types]) {
    assertNotIncludes(source, 'testSpeed', 'Test speed state must not be serialized or typed as save state.');
    assertNotIncludes(source, 'speedMultiplier', 'Speed multiplier must not be serialized or typed as save state.');
    assertNotIncludes(source, 'TEST_SPEED', 'Feature flag names must not leak into save state.');
    assertNotIncludes(source, 'oneHitKill', 'One-hit kill state must not be serialized or typed as save state.');
    assertNotIncludes(source, 'BattleDebugOptions', 'Battle debug options must not leak into save state.');
  }

  const legacySyncCatchUp =
    useGameLoop.includes('const dueTicks = Math.floor(elapsed / intervalMs);') &&
    useGameLoop.includes('for (let i = 0; i < dueTicks; i += 1)') &&
    useGameLoop.includes('callbackRef.current()');

  if (legacySyncCatchUp) {
    const burstTicks = legacySynchronousTickCount(1500, 500);
    assertEqual(
      burstTicks,
      1,
      '1x foreground elapsed catch-up must not synchronously emit multiple visible battle ticks'
    );
  }

  assertIncludes(
    useGameLoop,
    'export function planGameLoopSchedule',
    'useGameLoop must expose a testable scheduling helper for visible cadence.'
  );
  assertIncludes(
    useGameLoop,
    'maxTicksPerLoop = 1',
    'The normal visible cadence must default to at most one tick per scheduler pass.'
  );
  assertNotIncludes(
    useGameLoop,
    'for (let i = 0; i < dueTicks; i += 1)',
    'useGameLoop must not synchronously loop over every due tick in one scheduler pass.'
  );

  const { planGameLoopSchedule } = await importTsModule({
    entry: join(root, 'src/hooks/useGameLoop.ts'),
    root,
    outRoot,
  });

  assertEqual(typeof planGameLoopSchedule, 'function', 'planGameLoopSchedule must be exported.');

  const early = planGameLoopSchedule({ now: 499, lastTime: 0, intervalMs: 500 });
  assertEqual(early.dueTicks, 0, '499ms elapsed should not produce a battle tick');
  assertEqual(early.ticksToRun, 0, '499ms elapsed should run zero ticks');
  assertEqual(early.nextLastTime, 0, 'Early scheduler pass must keep lastTime unchanged');
  assertEqual(early.nextDelayMs, 1, 'Early scheduler pass should wait for the remaining interval');

  const onTime = planGameLoopSchedule({ now: 500, lastTime: 0, intervalMs: 500 });
  assertEqual(onTime.dueTicks, 1, '500ms elapsed should expose one due tick');
  assertEqual(onTime.ticksToRun, 1, '500ms elapsed should run one tick');
  assertEqual(onTime.nextLastTime, 500, 'On-time pass should advance lastTime by one interval');
  assertEqual(onTime.nextDelayMs, 500, 'On-time pass should schedule the next AS3 cadence interval');

  const lateSingle = planGameLoopSchedule({ now: 760, lastTime: 0, intervalMs: 500 });
  assertEqual(lateSingle.dueTicks, 1, 'A late single tick should still expose one due tick');
  assertEqual(lateSingle.ticksToRun, 1, 'A late single tick should still run one visible tick');
  assertEqual(lateSingle.nextLastTime, 760, 'A late visible tick should re-anchor cadence to the actual run time');
  assertEqual(lateSingle.nextDelayMs, 500, 'A late visible tick should not compress the next visible interval');

  const burst = planGameLoopSchedule({ now: 1500, lastTime: 0, intervalMs: 500 });
  assertEqual(burst.dueTicks, 3, 'The scheduler should still measure elapsed debt for background recovery decisions');
  assertEqual(burst.ticksToRun, 1, '1x foreground catch-up must run at most one visible tick per pass');
  assertEqual(burst.skippedTicks, 2, 'Overdue visible ticks should be clamped instead of synchronously replayed');
  assertEqual(burst.nextLastTime, 1500, 'Clamped catch-up should reset the visible cadence anchor to now');
  assertEqual(burst.nextDelayMs, 500, 'Clamped catch-up should return to the AS3 500ms visible cadence');

  console.log('Battle tempo cadence parity checks passed.');
} finally {
  await cleanupTranspileOutput(outRoot);
}
